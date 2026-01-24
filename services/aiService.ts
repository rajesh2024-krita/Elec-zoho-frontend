// aiService.ts - UPDATED with automatic extraction
import { GoogleGenAI } from "@google/genai";
import { AIProvider, AIConfig, ExtractionResult, FileData, DiscountModel, MonthlyScheme } from "../types";
import CryptoJS from "crypto-js";
import axios from "axios";

const SYSTEM_PROMPT = `You are an expert in extracting financial and product information from documents. 
Extract ALL claim information including pricing, discounts, payouts, and schemes.

Return ONLY a JSON object with this structure:
{
  "companyBrandName": "string",
  "brandModel": "string (main model or all models mentioned)",
  "claimType": "one of ['General Information', 'Price Drop', 'Price List', 'Monthly Scheme', 'Goods Return', 'Target Scheme', 'DOA', 'Other']",
  "schemeType": "one of ['Sell In', 'Sell Out', '']",
  "schemeStartDate": "YYYY-MM-DD or empty string",
  "schemeEndDate": "YYYY-MM-DD or empty string",
  "claimDetails": "string summary",
  "discountModels": [
    {
      "modelName": "specific model name/sku/variant",
      "fullPrice": number (if mentioned, else 0),
      "discountPercentage": number (if mentioned, else 0),
      "payoutAmount": number (if mentioned, else 0)
    }
  ],
  "monthlySchemes": [
    {
      "month": "month name or period",
      "targetQuantity": number,
      "achievedQuantity": number,
      "payoutPerUnit": number,
      "totalPayout": number (calculate if possible)
    }
  ],
  "extractedText": "full relevant text for reference"
}

CRITICAL INSTRUCTIONS:
1. Search for ALL model names, SKUs, product codes in the document
2. For EACH model found, extract:
   - Full model name/SKU (e.g., "Samsung QLED QA55Q80A", "iPhone 14 Pro 256GB")
   - Full price if mentioned (look for "MRP", "price", "cost", "₹", "$")
   - Discount percentage if mentioned (look for "discount", "off", "%", "rebate")
   - Payout amount if mentioned (look for "payout", "incentive", "commission", "scheme amount")
3. For monthly schemes, extract each month's data including targets and payouts
4. If discount percentage is mentioned but payout isn't, calculate: payoutAmount = fullPrice * (discountPercentage/100)
5. If payout is mentioned but discount isn't, calculate: discountPercentage = (payoutAmount/fullPrice)*100
6. Look for tables, lists, or structured data containing model information
7. If no prices are mentioned but models are, set fullPrice to 0 (will be filled manually)
8. Return ALL models you find, even if incomplete information

EXAMPLE EXTRACTION:
If document says: "Samsung QLED 55" - MRP ₹1,25,000 with 15% discount. LG OLED 65" - MRP ₹1,80,000 with payout ₹25,000"
Return:
"discountModels": [
  {
    "modelName": "Samsung QLED 55",
    "fullPrice": 125000,
    "discountPercentage": 15,
    "payoutAmount": 18750
  },
  {
    "modelName": "LG OLED 65",
    "fullPrice": 180000,
    "discountPercentage": 13.89,
    "payoutAmount": 25000
  }
]`;



let encryptedKey = "";


// ================================
// LOAD ENCRYPTED KEY FROM BACKEND
// ================================
export async function loadEncryptedKey() {
  const res = await axios.get("http://localhost:5000/config/encrypted-key");
  encryptedKey = res.data.encryptedKey;
  console.log("🔐 Encrypted key loaded:", encryptedKey);
}


// ================================
// DECRYPT FUNCTION (crypto-js)
// ================================
function decrypt(text: string) {
  try {
    const bytes = CryptoJS.AES.decrypt(
      text,
      import.meta.env.VITE_AES_SECRET
    );


    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result;
  } catch (err) {
    console.error("Decryption failed:", err);
    return "";
  }
}

export const extractText = async (
  fileData: FileData,
  config: AIConfig
): Promise<ExtractionResult> => {
  const { base64, mimeType, textContent } = fileData;
  const base64Pure = base64.split(',')[1] || base64;

  if (config.provider === AIProvider.GEMINI) {
    // const apiKey = config.keys.GEMINI || import.meta.env.VITE_GEMINI_KEY || '';
    // if (!apiKey) throw new Error("No Gemini API key found.");

    // 1️⃣ DECRYPT KEY HERE
    const decryptedKey = decrypt(encryptedKey);


    console.log("🔓 Decrypted Gemini Key:", decryptedKey);


    if (!decryptedKey) throw new Error("Gemini key decryption failed.");

    const ai = new GoogleGenAI({ apiKey: decryptedKey });

    let parts: any[] = [{ text: SYSTEM_PROMPT }];

    if (mimeType === 'text/plain' && textContent) {
      parts.push({ text: `Source Text Content:\n${textContent}` });
    } else {
      parts.push({ inlineData: { data: base64Pure, mimeType } });
    }

    try {
      const response = await ai.models.generateContent({
        model: config.modelId,
        contents: { parts },
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsed = JSON.parse(response.text || "{}");

      // Calculate missing values
      const enhancedDiscountModels = (parsed.discountModels || []).map((model: any) => {
        const fullPrice = Number(model.fullPrice) || 0;
        const discountPercentage = Number(model.discountPercentage) || 0;
        const payoutAmount = Number(model.payoutAmount) || 0;

        let calculatedDiscount = discountPercentage;
        let calculatedPayout = payoutAmount;

        // Calculate missing values
        if (fullPrice > 0) {
          if (discountPercentage > 0 && payoutAmount === 0) {
            calculatedPayout = fullPrice * (discountPercentage / 100);
          } else if (payoutAmount > 0 && discountPercentage === 0) {
            calculatedDiscount = (payoutAmount / fullPrice) * 100;
          }
        }

        return {
          modelName: model.modelName || "",
          fullPrice,
          discountPercentage: calculatedDiscount,
          payoutAmount: calculatedPayout
        };
      });

      // Calculate monthly scheme totals
      const enhancedMonthlySchemes = (parsed.monthlySchemes || []).map((scheme: any) => ({
        month: scheme.month || "",
        targetQuantity: Number(scheme.targetQuantity) || 0,
        achievedQuantity: Number(scheme.achievedQuantity) || 0,
        payoutPerUnit: Number(scheme.payoutPerUnit) || 0,
        totalPayout: (Number(scheme.achievedQuantity) || 0) * (Number(scheme.payoutPerUnit) || 0)
      }));

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
          monthlySchemes: enhancedMonthlySchemes
        },
        rawText: parsed.extractedText || response.text || "",
        modelUsed: config.modelId
      };
    } catch (e) {
      console.error("AI parsing error:", e);
      throw new Error("Failed to parse AI response. Ensure the document contains readable model information.");
    }
  }

  // OpenAI/Groq Fallback
  if (config.provider === AIProvider.OPENAI || config.provider === AIProvider.GROQ) {
    const isOpenAI = config.provider === AIProvider.OPENAI;
    const url = isOpenAI
      ? "https://api.openai.com/v1/chat/completions"
      : "https://api.groq.com/openai/v1/chat/completions";

    const apiKey = isOpenAI ? config.keys.OPENAI : config.keys.GROQ;
    if (!apiKey) throw new Error(`Missing API Key for ${config.provider}.`);

    let content: any[] = [{ type: "text", text: SYSTEM_PROMPT }];

    if (mimeType === 'text/plain' && textContent) {
      content.push({ type: "text", text: `Source Text:\n${textContent}` });
    } else if (mimeType.startsWith('image/')) {
      content.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64Pure}` }
      });
    } else {
      throw new Error(`${config.provider} currently only supports images and text files. Use Gemini for PDFs.`);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.modelId,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: "Unknown API error" } }));
      throw new Error(err.error?.message || `API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const parsed = JSON.parse(resultText);

    // Apply same enhancements
    const enhancedDiscountModels = (parsed.discountModels || []).map((model: any) => {
      const fullPrice = Number(model.fullPrice) || 0;
      const discountPercentage = Number(model.discountPercentage) || 0;
      const payoutAmount = Number(model.payoutAmount) || 0;

      let calculatedDiscount = discountPercentage;
      let calculatedPayout = payoutAmount;

      if (fullPrice > 0) {
        if (discountPercentage > 0 && payoutAmount === 0) {
          calculatedPayout = fullPrice * (discountPercentage / 100);
        } else if (payoutAmount > 0 && discountPercentage === 0) {
          calculatedDiscount = (payoutAmount / fullPrice) * 100;
        }
      }

      return {
        modelName: model.modelName || "",
        fullPrice,
        discountPercentage: calculatedDiscount,
        payoutAmount: calculatedPayout
      };
    });

    const enhancedMonthlySchemes = (parsed.monthlySchemes || []).map((scheme: any) => ({
      month: scheme.month || "",
      targetQuantity: Number(scheme.targetQuantity) || 0,
      achievedQuantity: Number(scheme.achievedQuantity) || 0,
      payoutPerUnit: Number(scheme.payoutPerUnit) || 0,
      totalPayout: (Number(scheme.achievedQuantity) || 0) * (Number(scheme.payoutPerUnit) || 0)
    }));

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
        monthlySchemes: enhancedMonthlySchemes
      },
      rawText: parsed.extractedText || resultText,
      modelUsed: config.modelId
    };
  }


  throw new Error("Unsupported AI Provider.");
};
