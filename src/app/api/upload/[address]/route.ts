export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address: rawAddress } = await params;
    // NEW: Normalize with trim() to remove potential hidden spaces
    const address = rawAddress.trim().toLowerCase(); 

    if (!address) {
      return NextResponse.json({ files: [] });
    }

    const dirPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      address
    );

    if (!fs.existsSync(dirPath)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(dirPath);

    const fileList = files.map((file) => ({
      name: file,
      url: `/uploads/${address}/${file}`,
    }));

    return NextResponse.json({ files: fileList });
  } catch (error) {
    console.error("UPLOAD FETCH ERROR:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}