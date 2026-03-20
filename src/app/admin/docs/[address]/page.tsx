import fs from "fs";
import path from "path";
import Link from "next/link";

type FileItem = {
  name: string;
  url: string;
};

type PageProps = {
  params: Promise<{
    address: string;
  }>;
};

export default async function AdminDocsPage({ params }: PageProps) {
  // 🔥 params ko await karo
  const { address: rawAddress } = await params;
  const address = rawAddress.toLowerCase(); // normalize

  const dirPath = path.join(process.cwd(), "public", "uploads", address);

  let files: FileItem[] = [];

  if (fs.existsSync(dirPath)) {
    const fileNames = fs.readdirSync(dirPath);
    files = fileNames.map((file) => ({
      name: file,
      url: `/uploads/${address}/${file}`,
    }));
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Campaign Documents</h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Back
          </Link>
        </div>

        <p className="text-gray-400 mb-8 break-all">
          Campaign Address: {address}
        </p>

        {/* EMPTY STATE */}
        {files.length === 0 && (
          <p className="text-gray-400">
            No documents uploaded for this campaign.
          </p>
        )}

        {/* FILE LIST */}
        {files.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="border border-white/10 rounded-lg p-4 bg-white/5"
              >
                <p className="mb-2 text-sm break-all">{file.name}</p>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline"
                >
                  Open File
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
