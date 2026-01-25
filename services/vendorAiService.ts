// vendorAiService.ts — Enhanced for Vendor & Item Extraction (Crypto removed)
import { GoogleGenAI } from "@google/genai";
import { VendorExtractionResult, VendorFileData } from "@/vendorTypes";
import axios from "axios";
import { AIProvider } from "@/types";

// ---------------- SYSTEM PROMPT ----------------
const SYSTEM_PROMPT = `
You are an expert in extracting vendor/supplier information AND purchase order/item details...
(KEEP YOUR ENTIRE ORIGINAL PROMPT HERE — unchanged)
`;

let encryptedKey = "";

// ================================
// LOAD ENCRYPTED KEY FROM BACKEND
// ================================
export async function loadVendorEncryptedKey() {
  const res = await axios.get(
    "http://localhost:5000/config/encrypted-key"
  );
  encryptedKey = res.data.encryptedKey;
  console.log("🔐 Vendor Encrypted key loaded:", encryptedKey);
}

// ================================
// AES-GCM DECRYPT (WebCrypto)
// ================================
async function decryptAES(encryptedBase64: string) {
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

    // Decode base64 payload
    const bytes = Uint8Array.from(atob(encryptedBase64), (c) =>
      c.charCodeAt(0)
    );

    // Extract IV (first 12 bytes)
    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error("Vendor decrypt AES failed:", err);
    return "";
  }
}

// ---------------- MAIN EXTRACTION FUNCTION ----------------
export const extractVendorInfo = async (
  fileData: VendorFileData,
  config: any
) => {
  const { base64, mimeType, textContent } = fileData;
  const base64Pure = base64.split(",")[1] || base64;

  if (config.provider === AIProvider.GEMINI) {
    // Decrypt key
    const decryptedKey = await decryptAES(encryptedKey);
    if (!decryptedKey) throw new Error("Gemini key decryption failed.");

    const ai = new GoogleGenAI({ apiKey: decryptedKey });

    let parts: any[] = [{ text: SYSTEM_PROMPT }];

    if (mimeType === "text/plain" && textContent) {
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
          temperature: 0.1,
          topP: 0.9,
          topK: 40,
        },
      });

      const parsed = JSON.parse(response.text || "{}");

      const vendorData = parsed.vendorData || parsed;
      let purchaseRequestData =
        parsed.purchaseRequestData || defaultPurchaseRequest();

      // Vendor defaults
      if (!vendorData.Supplier_Code)
        vendorData.Supplier_Code = generateSupplierCode(
          vendorData.Vendor_Name || ""
        );

      vendorData.Currency = vendorData.Currency || "INR";
      vendorData.Country = vendorData.Country || "India";
      vendorData.Payment_Terms = vendorData.Payment_Terms || "Default";
      vendorData.Source = vendorData.Source || "Document Upload";

      // Items
      if (!Array.isArray(purchaseRequestData.items))
        purchaseRequestData.items = [];

      purchaseRequestData.items = purchaseRequestData.items.map(
        formatItem
      );

      purchaseRequestData.items = purchaseRequestData.items.filter(
        cleanItem
      );

      return {
        vendorData,
        purchaseRequestData,
        rawText: vendorData.extractedText || response.text || "",
        modelUsed: config.modelId,
        confidenceScore:
          purchaseRequestData.items.length > 0 ? 0.95 : 0.85,
      };
    } catch (err) {
      console.error("Vendor extraction error:", err);
      throw new Error("Failed to extract vendor and purchase details.");
    }
  }

  // ---------------- OPENAI + GROQ ----------------
  if (config.provider === "OPENAI" || config.provider === "GROQ") {
    const isOpenAI = config.provider === "OPENAI";
    const url = isOpenAI
      ? "https://api.openai.com/v1/chat/completions"
      : "https://api.groq.com/openai/v1/chat/completions";

    const apiKey = isOpenAI
      ? config.keys.OPENAI
      : config.keys.GROQ;

    if (!apiKey)
      throw new Error(`Missing API Key for ${config.provider}.`);

    let content: any[] = [{ type: "text", text: SYSTEM_PROMPT }];

    if (mimeType === "text/plain" && textContent) {
      content.push({ type: "text", text: textContent });
    } else if (mimeType.startsWith("image/")) {
      content.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64Pure}` },
      });
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
        temperature: 0.1,
      }),
    });

    const result = await response.json();
    const parsed = JSON.parse(result.choices[0].message.content);

    const vendorData = parsed.vendorData || parsed;
    let purchaseRequestData =
      parsed.purchaseRequestData || defaultPurchaseRequest();

    if (!vendorData.Supplier_Code)
      vendorData.Supplier_Code = generateSupplierCode(
        vendorData.Vendor_Name || ""
      );

    vendorData.Currency = vendorData.Currency || "INR";
    vendorData.Country = vendorData.Country || "India";
    vendorData.Payment_Terms = vendorData.Payment_Terms || "Default";

    if (!Array.isArray(purchaseRequestData.items))
      purchaseRequestData.items = [];

    purchaseRequestData.items =
      purchaseRequestData.items.map(formatItem);

    purchaseRequestData.items =
      purchaseRequestData.items.filter(cleanItem);

    return {
      vendorData,
      purchaseRequestData,
      rawText: vendorData.extractedText || result,
      modelUsed: config.modelId,
      confidenceScore:
        purchaseRequestData.items.length > 0 ? 0.95 : 0.85,
    };
  }

  throw new Error("Unsupported AI Provider.");
};

// ---------------- UTIL FUNCTIONS ----------------
function defaultPurchaseRequest() {
  return {
    items: [],
    warehouse: "Default",
    expected_delivery_date: "",
    tag: "From Vendor Creation",
    exchange_rate: 1,
  };
}

function generateSupplierCode(name: string): string {
  if (!name) return "SUP";
  const parts = name.toUpperCase().split(/\s+/);
  return (
    parts
      .slice(0, 3)
      .map((w) => w.charAt(0))
      .join("") || "SUP"
  );
}

function generateSKU(itemName: string): string {
  if (!itemName) return "SKU001";
  const words = itemName.toUpperCase().split(/\s+/);
  return (
    words
      .slice(0, 3)
      .map((w) => w.substring(0, 3))
      .join("") || "SKU" + Math.floor(100 + Math.random() * 900)
  );
}

function detectUnit(name: string): string {
  if (!name) return "Nos";
  const item = name.toLowerCase();
  if (item.includes("kg")) return "Kg";
  if (item.includes("ltr") || item.includes("liter")) return "Ltr";
  if (item.includes("meter") || item.includes("mtr")) return "Meter";
  if (item.includes("box")) return "Box";
  if (item.includes("set")) return "Set";
  if (item.includes("pair")) return "Pair";
  if (item.includes("pack")) return "Pack";
  if (item.includes("bag")) return "Bag";
  return "Nos";
}

function formatItem(item: any, i: number) {
  const subtotal = (item.quantity || 1) * (item.rate || 0);
  const tax = subtotal * ((item.tax_percentage || 18) / 100);

  return {
    name: item.name || item.description || `Item ${i + 1}`,
    sku: item.sku || generateSKU(item.name || `ITEM${i + 1}`),
    quantity: parseFloat(item.quantity) || 1,
    rate:
      parseFloat(item.rate) ||
      parseFloat(item.price) ||
      parseFloat(item.amount) ||
      0,
    tax_percentage:
      parseFloat(item.tax_percentage) ||
      parseFloat(item.tax) ||
      parseFloat(item.gst) ||
      18,
    hsn_sac: item.hsn_sac || item.hsn || "",
    description: item.description || item.name || "",
    unit: item.unit || detectUnit(item.name) || "Nos",
    total: subtotal + tax,
  };
}

function cleanItem(item: any) {
  return (
    (item.name && !item.name.startsWith("Item ")) ||
    item.rate > 0
  );
}