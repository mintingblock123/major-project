export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Campaign Address extraction
    const rawCampaignAddress = formData.get("campaignAddress") as string;
    const campaignAddress = rawCampaignAddress.toLowerCase(); 
    
    // Category extraction (Create page se aa rahi hai)
    const category = formData.get("category") as string; 

    // Document Files
    const govId = formData.get("govId") as File;
    const proof = formData.get("proof") as File;

    if (!campaignAddress || !govId || !proof) {
      return NextResponse.json({ error: "Missing campaign data or files" }, { status: 400 });
    }

    // Directory Path: public/uploads/[address]
    const uploadDir = path.join(process.cwd(), "public", "uploads", campaignAddress);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Helper function to save file with its original extension
    const saveFile = async (file: File, prefix: string) => {
      const bytes = await file.arrayBuffer();
      // Original extension nikal rahe hain (e.g., .pdf, .jpg)
      const extension = path.extname(file.name);
      const fileName = `${prefix}${extension}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, Buffer.from(bytes));
      return `/uploads/${campaignAddress}/${fileName}`;
    };

    // 1. Files save kar rahe hain aur unka URL nikal rahe hain
    const govIdUrl = await saveFile(govId, "govId");
    const proofUrl = await saveFile(proof, "proof");

    // 2. Metadata save kar rahe hain (CampaignCard isi file ko read karke image dikhayega)
    const metadata = {
      campaignAddress,
      category: category || "Default",
      createdAt: new Date().toISOString(),
      documents: {
        govId: govIdUrl,
        proof: proofUrl
      }
    };

    fs.writeFileSync(
      path.join(uploadDir, "metadata.json"), 
      JSON.stringify(metadata, null, 2)
    );

    return NextResponse.json({
      success: true,
      category: metadata.category,
      campaignAddress: metadata.campaignAddress,
      metadataUrl: `/uploads/${campaignAddress}/metadata.json`
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error during upload" }, { status: 500 });
  }
}