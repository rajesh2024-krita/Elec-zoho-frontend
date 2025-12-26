
import { GoogleGenAI } from "@google/genai";
import { AIProvider, AIConfig, ExtractionResult, FileData } from "../types";

const SYSTEM_PROMPT = `Extract claim information from this document/text. 
Return ONLY a JSON object with these fields:
- supplierName: string
- vendorName: string
- companyBrandName: string
- claimType: one of ["General Information", "Price Drop", "Price List", "Monthly Scheme", "Goods Return", "Target Scheme", "DOA", "Other"]
- schemeType: one of ["Sell In", "Sell Out"]
- schemeStartDate: string (format as YYYY-MM-DD if possible)
- schemeEndDate: string (format as YYYY-MM-DD if possible)
- claimDetails: string
- rawText: string (the full extracted text)

If a field is not found, use an empty string.`;

export const extractText = async (
  fileData: FileData,
  config: AIConfig
): Promise<ExtractionResult> => {
  const { base64, mimeType, textContent } = fileData;
  const base64Pure = base64.split(',')[1] || base64;

  if (config.provider === AIProvider.GEMINI) {
    const apiKey = config.keys.GEMINI || process.env.API_KEY || '';
    if (!apiKey) throw new Error("No Gemini API key found.");

    const ai = new GoogleGenAI({ apiKey });
    
    let parts: any[] = [{ text: SYSTEM_PROMPT }];
    
    if (mimeType === 'text/plain' && textContent) {
      parts.push({ text: `Source Text Content:\n${textContent}` });
    } else {
      parts.push({ inlineData: { data: base64Pure, mimeType } });
    }

    const response = await ai.models.generateContent({
      model: config.modelId,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      }
    });
    
    try {
      const parsed = JSON.parse(response.text || "{}");
      return {
        claimData: {
          supplierName: parsed.supplierName || "",
          vendorName: parsed.vendorName || "",
          companyBrandName: parsed.companyBrandName || "",
          claimType: parsed.claimType || "Other",
          schemeType: parsed.schemeType || "",
          schemeStartDate: parsed.schemeStartDate || "",
          schemeEndDate: parsed.schemeEndDate || "",
          claimDetails: parsed.claimDetails || "",
          additionalFields: []
        },
        rawText: parsed.rawText || response.text || "",
        modelUsed: config.modelId
      };
    } catch (e) {
      throw new Error("Failed to parse AI response. Ensure the document is readable.");
    }
  } 

  // OpenAI/Groq Fallback (primarily for images/text)
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
      throw new Error(`${config.provider} currently only supports images and text files in this tool. Use Gemini for PDFs.`);
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

    return {
      claimData: {
        supplierName: parsed.supplierName || "",
        vendorName: parsed.vendorName || "",
        companyBrandName: parsed.companyBrandName || "",
        claimType: parsed.claimType || "Other",
        schemeType: parsed.schemeType || "",
        schemeStartDate: parsed.schemeStartDate || "",
        schemeEndDate: parsed.schemeEndDate || "",
        claimDetails: parsed.claimDetails || "",
        additionalFields: []
      },
      rawText: parsed.rawText || resultText,
      modelUsed: config.modelId
    };
  }

  throw new Error("Unsupported AI Provider.");
};
