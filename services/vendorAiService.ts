// vendorAiService.ts — SAME FORMAT AS aiService.ts (FULL WORKING)
import { GoogleGenAI } from "@google/genai";
import { VendorExtractionResult, VendorFileData } from "@/vendorTypes";

// ---------------- PROMPT ----------------
const SYSTEM_PROMPT = `
You are an expert in extracting vendor/supplier information from invoices, business cards, GST certificates, and registration documents.

Return ONLY a JSON object:

{
  "Vendor_Name": "string",
  "Email": "string",
  "Phone": "string",
  "Website": "string",
  "Owner_Name": "string",
  "Supplier_Code": "string",
  "Vendor_Owner": "string",
  "Payment_Terms": "string",
  "Currency": "string",
  "Source": "string",
  "GSTIN_NUMBER": "string",
  "Type_of_Supplier": "string",
  "Street": "string",
  "City": "string",
  "State": "string",
  "Zip_Code": "string",
  "Country": "string",
  "Description": "string",
  "extractedText": "string",
  "accountNumber": "string",
  "ifscCode": "string",
  "bankName": "string",
  "branch": "string",
  "gstin": "string"
}

RULES:
- GSTIN must be exactly 15 characters.
- Extract full address and split.
- Supplier_Code = initials if missing.
- Currency default = INR.
- Country default = India.
- Payment_Terms default = Default.
- Keep missing fields empty "".
`;

// ---------------- MAIN FUNCTION ----------------
export const extractVendorInfo = async (
  fileData: VendorFileData,
  config: any
): Promise<VendorExtractionResult> => {

  const { base64, mimeType, textContent } = fileData;
  const base64Pure = base64.split(",")[1] || base64;

  if (config.provider === "GEMINI") {
    const apiKey = config.keys.GEMINI;
    if (!apiKey) throw new Error("No Gemini API key found.");

    const ai = new GoogleGenAI({ apiKey });

    // SAME structure as aiService.ts
    let parts: any[] = [{ text: SYSTEM_PROMPT }];

    if (mimeType === "text/plain" && textContent) {
      parts.push({ text: `Source Text Content:\n${textContent}` });
    } else {
      parts.push({
        inlineData: { data: base64Pure, mimeType }
      });
    }

    try {
      // EXACTLY SAME request structure as aiService.ts
      const response = await ai.models.generateContent({
        model: config.modelId,
        contents: { parts },
        config: {
          responseMimeType: "application/json"
        }
      });

      // EXACT SAME PARSE LOGIC as aiService.ts
      const parsed = JSON.parse(response.text || "{}");

      // ------ FIX DEFAULT VALUES ------
      if (!parsed.Supplier_Code || parsed.Supplier_Code.trim() === "")
        parsed.Supplier_Code = generateSupplierCode(parsed.Vendor_Name || "");

      parsed.Currency = parsed.Currency || "INR";
      parsed.Country = parsed.Country || "India";
      parsed.Payment_Terms = parsed.Payment_Terms || "Default";
      parsed.Source = parsed.Source || "Document Upload";
      parsed.Description =
        parsed.Description || "Vendor extracted from uploaded document";

      return {
        vendorData: parsed,
        rawText: parsed.extractedText || response.text || "",
        modelUsed: config.modelId,
        confidenceScore: 0.95
      };
    } catch (err) {
      console.error("Vendor extraction error:", err);
      throw new Error("Failed to extract vendor details.");
    }
  }

  // ---------------- OPENAI + GROQ SAME FORMAT ----------------
  if (config.provider === "OPENAI" || config.provider === "GROQ") {
    const isOpenAI = config.provider === "OPENAI";
    const url = isOpenAI
      ? "https://api.openai.com/v1/chat/completions"
      : "https://api.groq.com/openai/v1/chat/completions";

    const apiKey = isOpenAI ? config.keys.OPENAI : config.keys.GROQ;
    if (!apiKey) throw new Error(`Missing API Key for ${config.provider}.`);

    let content: any[] = [{ type: "text", text: SYSTEM_PROMPT }];

    if (mimeType === "text/plain" && textContent) {
      content.push({ type: "text", text: `Source Text:\n${textContent}` });
    } else if (mimeType.startsWith("image/")) {
      content.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64Pure}` }
      });
    } else {
      throw new Error(`${config.provider} supports only text & images.`);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.modelId,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content }]
      })
    });

    const result = await response.json();
    const resultText = result.choices[0].message.content;
    const parsed = JSON.parse(resultText);

    // Same default handling
    if (!parsed.Supplier_Code || parsed.Supplier_Code.trim() === "")
      parsed.Supplier_Code = generateSupplierCode(parsed.Vendor_Name || "");

    parsed.Currency = parsed.Currency || "INR";
    parsed.Country = parsed.Country || "India";
    parsed.Payment_Terms = parsed.Payment_Terms || "Default";

    return {
      vendorData: parsed,
      rawText: parsed.extractedText || resultText,
      modelUsed: config.modelId,
      confidenceScore: 0.95
    };
  }

  throw new Error("Unsupported AI Provider.");
};

// ---------------- UTIL ----------------
function generateSupplierCode(name: string): string {
  if (!name) return "SUP";
  const parts = name.toUpperCase().split(/\s+/);
  return parts.slice(0, 3).map(w => w.charAt(0)).join("") || "SUP";
}
