// aiService.ts - UPDATED (crypto-js removed, WebCrypto added)
import { GoogleGenAI } from "@google/genai";
import {
  AIProvider,
  AIConfig,
  ExtractionResult,
  FileData,
} from "../types";
import axios from "axios";

const SYSTEM_PROMPT = `You are an expert in extracting financial and product information from documents. 
Extract ALL claim information including pricing, discounts, payouts, and schemes.

Return ONLY a JSON object with this structure:
{
  "companyBrandName": "string",
  "brandModel": "string",
  "claimType": "one of ['General Information','Price Drop','Price List','Monthly Scheme','Goods Return','Target Scheme','DOA','Other']",
  "schemeType": "one of ['Sell In','Sell Out','']",
  "schemeStartDate": "YYYY-MM-DD",
  "schemeEndDate": "YYYY-MM-DD",
  "claimDetails": "string",
  "discountModels": [
    {
      "modelName": "string",
      "fullPrice": number,
      "discountPercentage": number,
      "payoutAmount": number
    }
  ],
  "monthlySchemes": [
    {
      "month": "string",
      "targetQuantity": number,
      "achievedQuantity": number,
      "payoutPerUnit": number,
      "totalPayout": number
    }
  ],
  "extractedText": "string"
}`;

// =====================================
// GLOBAL VARIABLE FOR ENCRYPTED API KEY
// =====================================
let encryptedKey = "";

// ================================
// LOAD ENCRYPTED KEY FROM BACKEND
// ================================
export async function loadEncryptedKey() {
  const res = await axios.get(
    "http://localhost:5000/config/encrypted-key"
  );
  encryptedKey = res.data.encryptedKey;
  console.log("🔐 Encrypted key loaded:", encryptedKey);
}

// ================================
// AES-GCM DECRYPT (WebCrypto)
// ================================
async function decrypt(encryptedBase64: string) {
  try {
    const secret = import.meta.env.VITE_AES_SECRET;
    if (!secret) return "";

    // Convert secret to key
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    // Decode base64
    const bytes = Uint8Array.from(atob(encryptedBase64), (c) =>
      c.charCodeAt(0)
    );

    // Extract iv (first 12 bytes)
    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error("WebCrypto decryption failed:", err);
    return "";
  }
}

// ==========================================
// MAIN EXTRACTION FUNCTION
// ==========================================
export const extractText = async (
  fileData: FileData,
  config: AIConfig
): Promise<ExtractionResult> => {
  const { base64, mimeType, textContent } = fileData;
  const base64Pure = base64.split(",")[1] || base64;

  // =============== GEMINI ===============
  if (config.provider === AIProvider.GEMINI) {
    // Decrypt key from backend
    const decryptedKey = await decrypt(encryptedKey);

    if (!decryptedKey)
      throw new Error("Gemini key decryption failed.");

    const ai = new GoogleGenAI({ apiKey: decryptedKey });

    let parts: any[] = [{ text: SYSTEM_PROMPT }];

    if (mimeType === "text/plain" && textContent) {
      parts.push({ text: `Source Text Content:\n${textContent}` });
    } else {
      parts.push({
        inlineData: { data: base64Pure, mimeType },
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: config.modelId,
        contents: { parts },
        config: { responseMimeType: "application/json" },
      });

      const parsed = JSON.parse(response.text || "{}");

      // Enhance models
      const enhancedDiscountModels = (parsed.discountModels || []).map(
        (model: any) => {
          const fullPrice = Number(model.fullPrice) || 0;
          const discountPercentage =
            Number(model.discountPercentage) || 0;
          const payoutAmount = Number(model.payoutAmount) || 0;

          let calcDiscount = discountPercentage;
          let calcPayout = payoutAmount;

          if (fullPrice > 0) {
            if (discountPercentage > 0 && payoutAmount === 0) {
              calcPayout = fullPrice * (discountPercentage / 100);
            } else if (payoutAmount > 0 && discountPercentage === 0) {
              calcDiscount = (payoutAmount / fullPrice) * 100;
            }
          }

          return {
            modelName: model.modelName || "",
            fullPrice,
            discountPercentage: calcDiscount,
            payoutAmount: calcPayout,
          };
        }
      );

      const enhancedMonthlySchemes = (parsed.monthlySchemes || []).map(
        (scheme: any) => ({
          month: scheme.month || "",
          targetQuantity: Number(scheme.targetQuantity) || 0,
          achievedQuantity: Number(scheme.achievedQuantity) || 0,
          payoutPerUnit: Number(scheme.payoutPerUnit) || 0,
          totalPayout:
            (Number(scheme.achievedQuantity) || 0) *
            (Number(scheme.payoutPerUnit) || 0),
        })
      );

      return {
        claimData: {
          companyBrandName: parsed.companyBrandName || "",
          brandModel: parsed.brandModel || "",
          claimType: parsed.claimType || "Other",
          schemeType: parsed.schemeType || "",
          schemeStartDate: parsed.schemeStartDate || "",
          schemeEndDate: parsed.schemeEndDate || "",
          claimDetails: parsed.claimDetails || "",
          additionalFields: [],
          discountModels: enhancedDiscountModels,
          monthlySchemes: enhancedMonthlySchemes,
        },
        rawText: parsed.extractedText || response.text || "",
        modelUsed: config.modelId,
      };
    } catch (e) {
      console.error("AI parsing error:", e);
      throw new Error(
        "Failed to parse AI response. Ensure the document contains readable model information."
      );
    }
  }

  // =============== OPENAI / GROQ ===============
  if (
    config.provider === AIProvider.OPENAI ||
    config.provider === AIProvider.GROQ
  ) {
    const isOpenAI = config.provider === AIProvider.OPENAI;
    const url = isOpenAI
      ? "https://api.openai.com/v1/chat/completions"
      : "https://api.groq.com/openai/v1/chat/completions";

    const apiKey = isOpenAI
      ? config.keys.OPENAI
      : config.keys.GROQ;

    if (!apiKey)
      throw new Error(`Missing API Key for ${config.provider}.`);

    let content: any[] = [
      { type: "text", text: SYSTEM_PROMPT },
    ];

    if (mimeType === "text/plain" && textContent) {
      content.push({
        type: "text",
        text: `Source Text:\n${textContent}`,
      });
    } else if (mimeType.startsWith("image/")) {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64Pure}`,
        },
      });
    } else {
      throw new Error(
        `${config.provider} currently only supports images and text files. Use Gemini for PDFs.`
      );
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.modelId,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const err = await response
        .json()
        .catch(() => ({ error: { message: "Unknown API error" } }));
      throw new Error(
        err.error?.message || `API Error: ${response.statusText}`
      );
    }

    const data = await response.json();
    const parsed = JSON.parse(
      data.choices[0].message.content
    );

    // Enhance values
    const enhancedDiscountModels = (parsed.discountModels || []).map(
      (model: any) => {
        const fullPrice = Number(model.fullPrice) || 0;
        const discountPercentage =
          Number(model.discountPercentage) || 0;
        const payoutAmount = Number(model.payoutAmount) || 0;

        let calcDiscount = discountPercentage;
        let calcPayout = payoutAmount;

        if (fullPrice > 0) {
          if (discountPercentage > 0 && payoutAmount === 0) {
            calcPayout = fullPrice * (discountPercentage / 100);
          } else if (payoutAmount > 0 && discountPercentage === 0) {
            calcDiscount = (payoutAmount / fullPrice) * 100;
          }
        }

        return {
          modelName: model.modelName || "",
          fullPrice,
          discountPercentage: calcDiscount,
          payoutAmount: calcPayout,
        };
      }
    );

    const enhancedMonthlySchemes = (parsed.monthlySchemes || []).map(
      (scheme: any) => ({
        month: scheme.month || "",
        targetQuantity: Number(scheme.targetQuantity) || 0,
        achievedQuantity: Number(scheme.achievedQuantity) || 0,
        payoutPerUnit: Number(scheme.payoutPerUnit) || 0,
        totalPayout:
          (Number(scheme.achievedQuantity) || 0) *
          (Number(scheme.payoutPerUnit) || 0),
      })
    );

    return {
      claimData: {
        companyBrandName: parsed.companyBrandName || "",
        brandModel: parsed.brandModel || "",
        claimType: parsed.claimType || "Other",
        schemeType: parsed.schemeType || "",
        schemeStartDate: parsed.schemeStartDate || "",
        schemeEndDate: parsed.schemeEndDate || "",
        claimDetails: parsed.claimDetails || "",
        additionalFields: [],
        discountModels: enhancedDiscountModels,
        monthlySchemes: enhancedMonthlySchemes,
      },
      rawText:
        parsed.extractedText ||
        data.choices[0].message.content,
      modelUsed: config.modelId,
    };
  }

  throw new Error("Unsupported AI Provider.");
};