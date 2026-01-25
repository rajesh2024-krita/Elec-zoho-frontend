// vendorAiService.ts — Enhanced for Vendor & Item Extraction
import { GoogleGenAI } from "@google/genai";
import { VendorExtractionResult, VendorFileData } from "@/vendorTypes";
import CryptoJS from "crypto-js";
import axios from "axios";
import { AIProvider } from "@/types";

// ---------------- ENHANCED SYSTEM PROMPT FOR VENDOR + ITEM EXTRACTION ----------------
const SYSTEM_PROMPT = `
You are an expert in extracting vendor/supplier information AND purchase order/item details from invoices, quotations, purchase orders, bills, business cards, GST certificates, and registration documents.

EXTRACT BOTH VENDOR INFORMATION AND PURCHASE ITEMS:

IMPORTANT: First extract vendor information, then look for item tables/line items in the document.

VENDOR INFORMATION FIELDS (fill what you find):
{
  "Vendor_Name": "string (company/supplier name)",
  "Email": "string",
  "Phone": "string",
  "Website": "string",
  "Owner_Name": "string",
  "Supplier_Code": "string (generate from name if missing)",
  "Vendor_Owner": "string (contact person)",
  "Payment_Terms": "string",
  "Currency": "string (default: INR)",
  "Source": "string",
  "GSTIN_NUMBER": "string (15 characters if available)",
  "Type_of_Supplier": "string (Registered/Unregistered/Composition/SEZ/Deemed Export)",
  "Street": "string",
  "City": "string",
  "State": "string",
  "Zip_Code": "string",
  "Country": "string (default: India)",
  "Description": "string",
  "accountNumber": "string",
  "ifscCode": "string",
  "bankName": "string",
  "branch": "string",
  "gstin": "string (alternate GST field)"
}

PURCHASE ITEM EXTRACTION RULES:
1. Look for item tables, product lists, line items in invoices/purchase orders
2. Extract ALL items you find
3. For each item, extract:
   - name: product/service name
   - sku: SKU code if available (if not, generate from name)
   - quantity: number quantity
   - rate: unit price/rate
   - tax_percentage: tax percentage (GST rate)
   - hsn_sac: HSN/SAC code if mentioned
   - description: product description
   - unit: unit of measurement (Nos, Kg, Ltr, Meter, Box, Set, etc.)

4. Common patterns to look for:
   - Item tables with columns: Description, Qty, Rate, Amount, HSN/SAC, GST%
   - Line items starting with numbers or bullet points
   - Product lists with prices
   - Invoice line items

5. If you see an invoice or purchase order, ALWAYS extract items
6. If no items found, return empty array

RETURN FORMAT:
{
  "vendorData": { ...vendor fields above... },
  "purchaseRequestData": {
    "items": [
      {
        "name": "Product ABC",
        "sku": "ABC123",
        "quantity": 10,
        "rate": 100.50,
        "tax_percentage": 18,
        "hsn_sac": "123456",
        "description": "Product description",
        "unit": "Nos"
      }
    ],
    "warehouse": "Default",
    "expected_delivery_date": "",
    "tag": "From Vendor Creation",
    "exchange_rate": 1
  }
}

DEFAULTS:
- Currency: "INR"
- Country: "India"
- Payment_Terms: "Default"
- Supplier_Code: Generate from vendor name (first 3 letters)
- tax_percentage: 18% if not specified
- unit: "Nos" if not specified
- warehouse: "Default"
- tag: "From Vendor Creation"
- exchange_rate: 1

EXTRACTION EXAMPLES:
Invoice Example:
"Item: Laptop, Qty: 2, Rate: ₹45,000, HSN: 8471, GST: 18%"
→ Extract: name: "Laptop", quantity: 2, rate: 45000, hsn_sac: "8471", tax_percentage: 18

Purchase Order Example:
"1. Cement Bag - 50kg, Quantity: 100, Rate: ₹350 per bag, HSN Code: 2523"
→ Extract: name: "Cement Bag", quantity: 100, rate: 350, hsn_sac: "2523", unit: "Bag"

ALWAYS extract all available items from tables or lists.
`;

let encryptedKey = "";

// ================================
// LOAD ENCRYPTED KEY FROM BACKEND
// ================================
export async function loadVendorEncryptedKey() {
  const res = await axios.get("https://elec-zoho-backend-snowy.vercel.app/config/encrypted-key");
  encryptedKey = res.data.encryptedKey;
  console.log("🔐 Vendor Encrypted key loaded:", encryptedKey);
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

// ---------------- MAIN EXTRACTION FUNCTION ----------------
export const extractVendorInfo = async (
  fileData: VendorFileData,
  config: any
): Promise<{
  vendorData: any;
  purchaseRequestData: any;
  rawText: string;
  modelUsed: string;
  confidenceScore: number;
}> => {
  const { base64, mimeType, textContent } = fileData;
  const base64Pure = base64.split(",")[1] || base64;

  if (config.provider === AIProvider.GEMINI) {
    // 1️⃣ DECRYPT KEY HERE
    const decryptedKey = decrypt(encryptedKey);

    if (!decryptedKey) throw new Error("Gemini key decryption failed.");

    const ai = new GoogleGenAI({ apiKey: decryptedKey });

    let parts: any[] = [{ text: SYSTEM_PROMPT }];

    if (mimeType === "text/plain" && textContent) {
      parts.push({ text: `Source Text Content:\n${textContent}` });
    } else {
      parts.push({
        inlineData: { data: base64Pure, mimeType }
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: config.modelId,
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          temperature: 0.1, // Lower temperature for more consistent extraction
          topP: 0.9,
          topK: 40
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      console.log("📦 AI Parsed Response:", parsed);
      
      // Extract both vendor and purchase data
      const vendorData = parsed.vendorData || parsed;
      let purchaseRequestData = parsed.purchaseRequestData || {
        items: [],
        warehouse: "Default",
        expected_delivery_date: "",
        tag: "From Vendor Creation",
        exchange_rate: 1
      };

      // ------ FIX DEFAULT VALUES FOR VENDOR ------
      if (!vendorData.Supplier_Code || vendorData.Supplier_Code.trim() === "")
        vendorData.Supplier_Code = generateSupplierCode(vendorData.Vendor_Name || "");

      vendorData.Currency = vendorData.Currency || "INR";
      vendorData.Country = vendorData.Country || "India";
      vendorData.Payment_Terms = vendorData.Payment_Terms || "Default";
      vendorData.Source = vendorData.Source || "Document Upload";
      vendorData.Description = vendorData.Description || "Vendor extracted from uploaded document";
      vendorData.Type_of_Supplier = vendorData.Type_of_Supplier || "Registered";

      // ------ PROCESS PURCHASE ITEMS ------
      // If purchase items are directly in parsed object (not in purchaseRequestData)
      if (!purchaseRequestData.items && parsed.items) {
        purchaseRequestData = {
          items: parsed.items,
          warehouse: parsed.warehouse || "Default",
          expected_delivery_date: parsed.expected_delivery_date || "",
          tag: parsed.tag || "From Vendor Creation",
          exchange_rate: parsed.exchange_rate || 1
        };
      }

      // Ensure items is an array
      if (!Array.isArray(purchaseRequestData.items)) {
        purchaseRequestData.items = [];
      }

      // Clean and format purchase items
      purchaseRequestData.items = purchaseRequestData.items.map((item: any, index: number) => {
        // Calculate total if not present
        const subtotal = (item.quantity || 1) * (item.rate || 0);
        const tax = subtotal * ((item.tax_percentage || 18) / 100);
        
        return {
          name: item.name || item.description || item.product || `Item ${index + 1}`,
          sku: item.sku || item.code || generateSKU(item.name || `ITEM${index + 1}`),
          quantity: parseFloat(item.quantity) || 1,
          rate: parseFloat(item.rate) || parseFloat(item.price) || parseFloat(item.amount) || 0,
          tax_percentage: parseFloat(item.tax_percentage) || parseFloat(item.tax) || parseFloat(item.gst) || 18,
          hsn_sac: item.hsn_sac || item.hsn || item.sac || item.hsn_code || "",
          description: item.description || item.name || "",
          unit: item.unit || item.uom || detectUnit(item.name) || "Nos",
          total: subtotal + tax
        };
      });

      // Filter out empty items (where name is just "Item X")
      purchaseRequestData.items = purchaseRequestData.items.filter((item: any) => 
        item.name && !item.name.startsWith("Item ") || item.rate > 0
      );

      console.log("✅ Processed Purchase Items:", purchaseRequestData.items);

      return {
        vendorData,
        purchaseRequestData,
        rawText: vendorData.extractedText || response.text || "",
        modelUsed: config.modelId,
        confidenceScore: purchaseRequestData.items.length > 0 ? 0.95 : 0.85
      };
    } catch (err) {
      console.error("Vendor extraction error:", err);
      throw new Error("Failed to extract vendor and purchase details.");
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
        messages: [{ role: "user", content }],
        temperature: 0.1
      })
    });

    const result = await response.json();
    const resultText = result.choices[0].message.content;
    const parsed = JSON.parse(resultText);

    // Extract both vendor and purchase data
    const vendorData = parsed.vendorData || parsed;
    let purchaseRequestData = parsed.purchaseRequestData || {
      items: [],
      warehouse: "Default",
      expected_delivery_date: "",
      tag: "From Vendor Creation",
      exchange_rate: 1
    };

    // Same default handling for vendor
    if (!vendorData.Supplier_Code || vendorData.Supplier_Code.trim() === "")
      vendorData.Supplier_Code = generateSupplierCode(vendorData.Vendor_Name || "");

    vendorData.Currency = vendorData.Currency || "INR";
    vendorData.Country = vendorData.Country || "India";
    vendorData.Payment_Terms = vendorData.Payment_Terms || "Default";

    // Process purchase items
    if (!purchaseRequestData.items && parsed.items) {
      purchaseRequestData = {
        items: parsed.items,
        warehouse: parsed.warehouse || "Default",
        expected_delivery_date: parsed.expected_delivery_date || "",
        tag: parsed.tag || "From Vendor Creation",
        exchange_rate: parsed.exchange_rate || 1
      };
    }

    // Ensure items is an array
    if (!Array.isArray(purchaseRequestData.items)) {
      purchaseRequestData.items = [];
    }

    // Clean and format purchase items
    purchaseRequestData.items = purchaseRequestData.items.map((item: any, index: number) => {
      const subtotal = (item.quantity || 1) * (item.rate || 0);
      const tax = subtotal * ((item.tax_percentage || 18) / 100);
      
      return {
        name: item.name || item.description || item.product || `Item ${index + 1}`,
        sku: item.sku || item.code || generateSKU(item.name || `ITEM${index + 1}`),
        quantity: parseFloat(item.quantity) || 1,
        rate: parseFloat(item.rate) || parseFloat(item.price) || parseFloat(item.amount) || 0,
        tax_percentage: parseFloat(item.tax_percentage) || parseFloat(item.tax) || parseFloat(item.gst) || 18,
        hsn_sac: item.hsn_sac || item.hsn || item.sac || item.hsn_code || "",
        description: item.description || item.name || "",
        unit: item.unit || item.uom || detectUnit(item.name) || "Nos",
        total: subtotal + tax
      };
    });

    // Filter out empty items
    purchaseRequestData.items = purchaseRequestData.items.filter((item: any) => 
      item.name && !item.name.startsWith("Item ") || item.rate > 0
    );

    return {
      vendorData,
      purchaseRequestData,
      rawText: vendorData.extractedText || resultText,
      modelUsed: config.modelId,
      confidenceScore: purchaseRequestData.items.length > 0 ? 0.95 : 0.85
    };
  }

  throw new Error("Unsupported AI Provider.");
};

// ---------------- UTIL FUNCTIONS ----------------
function generateSupplierCode(name: string): string {
  if (!name) return "SUP";
  const parts = name.toUpperCase().split(/\s+/);
  // Take first 3 words and get first letter of each
  return parts.slice(0, 3).map(w => w.charAt(0)).join("") || "SUP";
}

function generateSKU(itemName: string): string {
  if (!itemName) return "SKU001";
  const words = itemName.toUpperCase().split(/\s+/);
  // Create SKU from first 3 characters of each word (max 3 words)
  const sku = words.slice(0, 3).map(word => word.substring(0, 3)).join("");
  return sku || "SKU" + Math.floor(100 + Math.random() * 900);
}

function detectUnit(itemName: string): string {
  if (!itemName) return "Nos";
  
  const itemLower = itemName.toLowerCase();
  
  // Common unit detection patterns
  if (itemLower.includes('kg') || itemLower.includes('kilo') || itemLower.includes('kilogram')) return "Kg";
  if (itemLower.includes('liter') || itemLower.includes('litre') || itemLower.includes('ltr')) return "Ltr";
  if (itemLower.includes('meter') || itemLower.includes('metre') || itemLower.includes('mtr')) return "Meter";
  if (itemLower.includes('box') || itemLower.includes('case') || itemLower.includes('carton')) return "Box";
  if (itemLower.includes('set') || itemLower.includes('kit')) return "Set";
  if (itemLower.includes('pair')) return "Pair";
  if (itemLower.includes('dozen')) return "Dozen";
  if (itemLower.includes('pack') || itemLower.includes('packet')) return "Pack";
  if (itemLower.includes('bag') || itemLower.includes('sack')) return "Bag";
  if (itemLower.includes('roll')) return "Roll";
  if (itemLower.includes('bottle')) return "Bottle";
  if (itemLower.includes('can')) return "Can";
  if (itemLower.includes('jar')) return "Jar";
  if (itemLower.includes('tube')) return "Tube";
  
  return "Nos";
}

// Export type for purchase items
export interface PurchaseItem {
  name: string;
  sku: string;
  quantity: number;
  rate: number;
  tax_percentage: number;
  hsn_sac: string;
  description: string;
  unit: string;
  total?: number;
}