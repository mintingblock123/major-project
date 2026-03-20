"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall, readContract, waitForReceipt } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { client } from "@/app/client";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";

export default function CreateCampaignPage() {
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();
  const router = useRouter();

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState(""); // NEW: Category state
  const [govIdType, setGovIdType] = useState("");
  const [govId, setGovId] = useState<File | null>(null);
  const [proof, setProof] = useState<File | null>(null);

  // UI States
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [finalAddress, setFinalAddress] = useState("");

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center p-8 border border-gray-800 rounded-2xl bg-gray-900/50">
          <p className="text-xl font-semibold mb-4">Wallet connection required</p>
          <button className="bg-blue-600 px-6 py-2 rounded-lg">Connect Wallet</button>
        </div>
      </div>
    );
  }

  const validateFile = (file: File) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(file.type)) return "Only PDF, JPG, or PNG allowed";
    if (file.size > maxSize) return "File size must be less than 5MB";
    return null;
  };

  const handleCreate = async () => {
    try {
      // NEW: Added category to the validation check
      if (!title || !description || !goal || !duration || !category || !govIdType || !govId || !proof) {
        alert("Please fill all fields, select a category, and upload documents");
        return;
      }

      setIsUploading(true);
      setStatusMessage("Confirming Transaction in Wallet...");

      const factory = getContract({
        client,
        chain: sepolia,
        address: CROWDFUNDING_FACTORY,
      });

      const goalInWei = BigInt(Math.floor(Number(goal) * 1e18));

      const tx = prepareContractCall({
        contract: factory,
        method: "function createCampaing(string,string,uint256,uint256)",
        params: [
          title,
          description,
          goalInWei,
          BigInt(duration),
        ],
      });

      const transaction = await sendTx(tx);

      setStatusMessage("Transaction Confirmed! Finalizing...");
      
      await waitForReceipt({
        client,
        chain: sepolia,
        transactionHash: transaction.transactionHash,
      });

      const allCampaigns: any = await readContract({
        contract: factory,
        method: "function getAllCampaigns() view returns ((address campaignAddress,address owner,string name,uint256 creationTime)[])",
      });

      const myCampaigns = allCampaigns.filter(
        (c: any) => c.owner.toLowerCase() === account.address.toLowerCase()
      );

      const lastCampaign = myCampaigns[myCampaigns.length - 1];
      const campaignAddress = lastCampaign.campaignAddress.toLowerCase();
      setFinalAddress(campaignAddress);

      setStatusMessage("Uploading Documents & Metadata...");
      const formData = new FormData();
      formData.append("campaignAddress", campaignAddress);
      formData.append("category", category); // NEW: Category added to FormData
      formData.append("govIdType", govIdType);
      formData.append("govId", govId);
      formData.append("proof", proof);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setIsUploading(false);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert("Error occurred. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6 flex justify-center items-start">
      {isUploading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-medium tracking-wide">{statusMessage}</p>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95">
          <div className="bg-gray-900 border border-blue-500/30 p-10 rounded-3xl max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Success!</h2>
            <p className="text-gray-400 mb-8">Campaign is live with category: {category}</p>
            <button
              onClick={() => router.push(`/admin/docs/${finalAddress}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition-all"
            >
              View Admin Panel
            </button>
          </div>
        </div>
      )}

      <div className="max-w-xl w-full bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 mt-10 shadow-2xl">
        <h1 className="text-3xl font-extrabold mb-2">Start a Campaign</h1>
        <p className="text-gray-500 mb-8 border-b border-gray-800 pb-6">Enter details to deploy your smart contract.</p>

        <div className="space-y-5">
          {/* CATEGORY SELECTION (NEW) */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Campaign Category</label>
            <select
              className="w-full mt-1 p-3 bg-gray-900 border border-gray-800 rounded-xl focus:border-blue-500 outline-none transition-all text-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Choose a Category</option>
              <option value="Medical">Medical</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Animal">Animal</option>
              <option value="Emergency">Emergency</option>
              <option value="Education">Education</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Title</label>
            <input
              className="w-full mt-1 p-3 bg-gray-900 border border-gray-800 rounded-xl focus:border-blue-500 outline-none transition-all"
              placeholder="Give your project a name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
            <textarea
              className="w-full mt-1 p-3 bg-gray-900 border border-gray-800 rounded-xl focus:border-blue-500 outline-none"
              placeholder="Explain why you are raising funds..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Goal (ETH)</label>
              <input
                className="w-full mt-1 p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none"
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Duration (Days)</label>
              <input
                className="w-full mt-1 p-3 bg-gray-900 border border-gray-800 rounded-xl outline-none"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="p-5 bg-gray-900/50 border border-dashed border-gray-700 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-blue-400 uppercase">Identity Verification</h3>

            <select
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl outline-none text-white appearance-none"
              value={govIdType}
              onChange={(e) => setGovIdType(e.target.value)}
            >
              <option value="">Select Government ID Type</option>
              <option value="Aadhaar">Aadhaar Card</option>
              <option value="PAN">PAN Card</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
            </select>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Upload Gov ID (PDF/PNG) *</label>
              <input
                type="file"
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    const err = validateFile(file);
                    if (err) { alert(err); e.target.value = ""; return; }
                    setGovId(file);
                  }
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Upload Campaign Proof *</label>
              <input
                type="file"
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    const err = validateFile(file);
                    if (err) { alert(err); e.target.value = ""; return; }
                    setProof(file);
                  }
                }}
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            Deploy Campaign
          </button>
        </div>
      </div>
    </div>
  );
}