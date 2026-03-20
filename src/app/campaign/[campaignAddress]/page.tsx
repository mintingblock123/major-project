"use client";

import { client } from "@/app/client";
import TierCard from "@/app/components/TierCard";
import { useParams } from "next/navigation";
import { useState } from "react";
import { getContract, prepareContractCall } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";

export default function CampaignPage() {
  const params = useParams();
  const address = params?.campaignAddress as string;

  const account = useActiveAccount();
  const { mutateAsync: sendTx, isPending } = useSendTransaction();

  const [tierName, setTierName] = useState("");
  const [tierAmount, setTierAmount] = useState("");
  const [addingTier, setAddingTier] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Guard Clause for Loading
  if (!address) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const contract = getContract({
    client,
    chain: sepolia,
    address: address,
  });

  /* ---------------- READ DATA ---------------- */
  const { data: name } = useReadContract({ contract, method: "function name() view returns (string)" });
  const { data: description } = useReadContract({ contract, method: "function description() view returns (string)" });
  const { data: owner } = useReadContract({ contract, method: "function owner() view returns (address)" });
  const { data: goal } = useReadContract({ contract, method: "function goal() view returns (uint256)" });
  const { data: balance } = useReadContract({ contract, method: "function getContractBalance() view returns (uint256)" });
  const { data: status } = useReadContract({ contract, method: "function status() view returns (uint8)" });
  const { data: tiers } = useReadContract({
    contract,
    method: "function getTiers() view returns ((string name,uint256 amount,uint256 backers)[])",
    queryOptions: { refetchInterval: refresh ? 1500 : undefined },
  });

  /* ---------------- DERIVED DATA ---------------- */
  const statusMap = ["PENDING", "VERIFIED", "REJECTED", "COMPLETED"];
  const statusText = statusMap[Number(status || 0)] ?? "UNKNOWN";
  const goalEth = Number(goal || 0) / 1e18;
  const raisedEth = Number(balance || 0) / 1e18;
  const progress = goalEth > 0 ? Math.min((raisedEth / goalEth) * 100, 100) : 0;

  const isOwner = owner && account?.address && owner.toLowerCase() === account.address.toLowerCase();
  const canEditTiers = !!(isOwner && statusText === "VERIFIED");

  const handleAddTier = async () => {
    if (!tierName || !tierAmount) { alert("Fill tier name and amount"); return; }
    try {
      setAddingTier(true);
      const tx = prepareContractCall({
        contract,
        method: "function addTier(string,uint256)",
        params: [tierName, BigInt(Math.floor(Number(tierAmount) * 1e18))],
      });
      await sendTx(tx);
      setTierName(""); setTierAmount(""); setRefresh((p) => p + 1);
    } catch (err) { console.error(err); } finally { setAddingTier(false); }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white py-16 px-6 relative overflow-x-hidden">
      {/* Background Decor - Premium Glows */}
      <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HERO SECTION */}
        <div className="flex flex-col lg:flex-row gap-16 items-start mb-24">
          <div className="flex-1 text-left animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
              <span className={`px-5 py-2 rounded-full border text-[10px] font-black tracking-[0.2em] uppercase backdrop-blur-3xl ${
                statusText === "VERIFIED" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
              }`}>
                {statusText}
              </span>
              <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest font-mono bg-white/5 px-3 py-2 rounded-lg">
                Campaign ID: {address.slice(-6)}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9] text-white">
              {name || "Untitled Campaign"}
            </h1>
            
            <p className="text-gray-400 text-lg md:text-2xl leading-relaxed max-w-3xl font-medium opacity-80">
              {description}
            </p>
          </div>

          {/* FLOATING STATS CARD */}
          <div className="w-full lg:w-[450px] animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="bg-white/[0.02] border border-white/10 rounded-[3.5rem] p-10 backdrop-blur-3xl shadow-3xl relative">
              <div className="space-y-10 text-left">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Raised</p>
                    <p className="text-6xl font-black tracking-tighter">{raisedEth.toFixed(3)} <span className="text-xl text-gray-500">ETH</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 text-sm font-black">{progress.toFixed(1)}%</p>
                  </div>
                </div>

                {/* NEON PROGRESS BAR */}
                <div className="relative">
                  <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(6,182,212,0.5)]" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                  <div>
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-1">Target Goal</p>
                    <p className="text-2xl font-black tracking-tight">{goalEth.toFixed(2)} ETH</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-1">Total Backers</p>
                    <p className="text-2xl font-black tracking-tight">{tiers?.reduce((acc, t) => acc + Number(t.backers), 0) || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TIERS & ACTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start text-left">
          
          {/* LEFT: TIERS LIST (7 columns) */}
          <div className="lg:col-span-7 space-y-12">
            <div className="flex items-center gap-6">
              <h2 className="text-4xl font-black tracking-tighter uppercase">Funding Tiers</h2>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tiers && tiers.length > 0 ? (
                tiers.map((tier: any, index: number) => (
                  <div key={index} className="hover:translate-y-[-8px] transition-transform duration-300">
                    <TierCard
                      tier={tier}
                      index={index}
                      contract={contract}
                      isEditing={canEditTiers}
                      onTransactionConfirmed={() => setRefresh((p) => p + 1)}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full py-24 text-center bg-white/[0.01] rounded-[3rem] border border-dashed border-white/10">
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Waiting for deployment...</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: CREATE TIER (5 columns - Sticky) */}
          {canEditTiers && (
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="bg-[#0f172a]/30 border border-white/10 rounded-[3.5rem] p-10 backdrop-blur-3xl shadow-2xl">
                <h3 className="text-3xl font-black mb-10 tracking-tighter">CREATE NEW TIER</h3>
                
                <div className="space-y-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 mb-3 block">Tier Title</label>
                    <input
                      placeholder="e.g. Platinum Backer"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm focus:border-cyan-500 outline-none transition-all placeholder:text-gray-700 group-hover:border-white/20"
                      value={tierName}
                      onChange={(e) => setTierName(e.target.value)}
                    />
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 mb-3 block">Min. Contribution (ETH)</label>
                    <input
                      placeholder="0.05"
                      type="number"
                      step="0.0001"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm focus:border-cyan-500 outline-none transition-all placeholder:text-gray-700 group-hover:border-white/20"
                      value={tierAmount}
                      onChange={(e) => setTierAmount(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleAddTier}
                    disabled={addingTier || isPending}
                    className="w-full bg-white text-black font-black py-6 rounded-2xl hover:bg-cyan-400 transition-all uppercase text-xs tracking-[0.3em] shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingTier ? "PROCESSING..." : "DEPLOY TIER"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}