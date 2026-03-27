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
    <div className="min-h-screen pt-28 pb-16 px-6 relative flex justify-center items-start overflow-hidden">
      <div className="absolute inset-0 bg-web3-grid opacity-30 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-0" />
      
      {isUploading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0F19]/90 backdrop-blur-md">
          <div className="w-12 h-12 border-4 border-[#22D3EE] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-medium tracking-wide text-[#E5E7EB]">{statusMessage}</p>
          <p className="text-sm mt-2 text-[#9CA3AF]">Please approve the transaction in your wallet.</p>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/95 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/[0.06] p-10 rounded-2xl max-w-sm w-full text-center shadow-xl">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[#E5E7EB]">Success!</h2>
            <p className="text-[#9CA3AF] mb-8">Campaign is live. Awaiting verification.</p>
            <button
              onClick={() => router.push(`/admin/docs/${finalAddress}`)}
              className="w-full bg-[#E5E7EB] text-[#111827] hover:bg-white py-3 rounded-xl font-bold transition-colors"
            >
              Review in Admin Panel
            </button>
          </div>
        </div>
      )}

      <div className="max-w-xl w-full bg-[#111827] border border-white/[0.06] rounded-2xl p-8 mt-4 shadow-sm relative z-10 transition-all">
        <h1 className="text-3xl font-black mb-2 relative z-10 text-[#E5E7EB] tracking-tight">Deploy Campaign</h1>
        <p className="text-[#9CA3AF] text-sm font-medium mb-8 pb-6 border-b border-white/[0.06] relative z-10">Configure your smart contract parameters.</p>

        <div className="space-y-8 relative z-10">
          
          {/* SECTION: CAMPAIGN INFO */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-[#E5E7EB] uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22D3EE]"></span> Campaign Info
            </h3>
          <div>
            <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5 block">Category</label>
            <select
              className="w-full p-3.5 bg-[#0B0F19] border border-white/[0.06] rounded-xl focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/40 outline-none transition-all duration-200 text-[#E5E7EB] appearance-none"
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
            <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5 block">Title</label>
            <input
              className="w-full p-3.5 bg-[#0B0F19] border border-white/[0.06] rounded-xl focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/40 outline-none transition-all duration-200 text-[#E5E7EB] placeholder-[#9CA3AF]/50"
              placeholder="Give your project a name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5 block">Description</label>
            <textarea
              className="w-full p-3.5 bg-[#0B0F19] border border-white/[0.06] rounded-xl focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/40 outline-none transition-all duration-200 text-[#E5E7EB] placeholder-[#9CA3AF]/50 resize-y"
              placeholder="Explain why you are raising funds..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          </div>

          {/* SECTION: FUNDING DETAILS */}
          <div className="space-y-6 pt-2 border-t border-white/[0.06]">
            <h3 className="text-xs font-bold text-[#E5E7EB] uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span> Funding Config
            </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5 block">Goal (ETH)</label>
              <input
                className="w-full p-3.5 bg-[#0B0F19] border border-white/[0.06] rounded-xl focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/40 outline-none transition-all duration-200 text-[#E5E7EB]"
                type="number"
                placeholder="0.0"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              <p className="text-[10px] text-[#9CA3AF] mt-1.5">Target amount</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5 block">Duration (Days)</label>
              <input
                className="w-full p-3.5 bg-[#0B0F19] border border-white/[0.06] rounded-xl focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/40 outline-none transition-all duration-200 text-[#E5E7EB]"
                type="number"
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <p className="text-[10px] text-[#9CA3AF] mt-1.5">Ends in days</p>
            </div>
          </div>
          </div>

          {/* SECTION: VERIFICATION */}
          <div className="p-6 bg-[#0B0F19] border border-white/[0.06] rounded-xl space-y-5 relative">
            <h3 className="text-xs font-bold tracking-widest text-[#E5E7EB] uppercase flex items-center gap-2">
              <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              Secure Verification
            </h3>
            <p className="text-[11px] text-[#9CA3AF] leading-relaxed">Submit your identity docs to allow our admins to securely verify your project. Documents are encrypted and kept strictly confidential.</p>

            <select
              className="w-full p-3.5 bg-[#111827] border border-white/[0.06] rounded-xl focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/40 outline-none text-[#E5E7EB] appearance-none transition-all duration-200"
              value={govIdType}
              onChange={(e) => setGovIdType(e.target.value)}
            >
              <option value="">Select Government ID Type</option>
              <option value="Aadhaar">Aadhaar Card</option>
              <option value="PAN">PAN Card</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
            </select>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest block mb-1">Upload Gov ID (PDF/PNG)</label>
              <input
                type="file"
                className="block w-full text-sm text-[#9CA3AF] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#111827] file:text-[#E5E7EB] file:border file:border-white/[0.06] hover:file:bg-white/[0.05] cursor-pointer transition-all border border-white/[0.06] p-1.5 rounded-xl bg-[#111827]"
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

            <div className="space-y-1.5 mt-4">
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest block mb-1">Upload Campaign Proof</label>
              <input
                type="file"
                className="block w-full text-sm text-[#9CA3AF] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#111827] file:text-[#E5E7EB] file:border file:border-white/[0.06] hover:file:bg-white/[0.05] cursor-pointer transition-all border border-white/[0.06] p-1.5 rounded-xl bg-[#111827]"
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
            className="w-full mt-8 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-sm hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-3"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deploying...
              </>
            ) : "Deploy Contract"}
          </button>
        </div>
      </div>
    </div>
  );
}