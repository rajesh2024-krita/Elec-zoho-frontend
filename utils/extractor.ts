const extractClaimDataFrontend = async (
  file: FileData,
  vendorName: string
): Promise<ExtractionResult> => {

  // ⚠️ This is mock logic – replace with AI / OCR later
  return {
    claimData: {
      supplierName: vendorName,
      vendorName: vendorName,
      companyBrandName: "",
      claimType: "General Information",
      schemeType: "",
      schemeStartDate: "",
      schemeEndDate: "",
      claimDetails: file.textContent || "",
      additionalFields: []
    },
    confidence: 0.85
  };
};
