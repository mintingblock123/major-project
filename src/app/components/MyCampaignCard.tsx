"use client";

import Link from "next/link";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";
import { client } from "@/app/client";

type Props = {
  contractAddress: string;
};

export function MyCampaignCard({ contractAddress }: Props) {
  const contract = getContract({
    client,
    chain: sepolia,
    address: contractAddress,
  });

  // Blockchain Data Fetching
  const { data: name } = useReadContract({
    contract,
    method: "function name() view returns (string)",
  });

  const { data: description } = useReadContract({
    contract,
    method: "function description() view returns (string)",
  });

  const { data: balance } = useReadContract({
    contract,
    method: "function getContractBalance() view returns (uint256)",
  });

  const { data: goal } = useReadContract({
    contract,
    method: "function goal() view returns (uint256)",
  });

  const { data: status } = useReadContract({
    contract,
    method: "function status() view returns (uint8)",
  });

  // Constants & Conversions
  const statusMap = ["PENDING", "VERIFIED", "REJECTED", "COMPLETED"];
  const safeStatus = typeof status === "bigint" ? Number(status) : Number(status || 0);
  const statusText = statusMap[safeStatus] || "UNKNOWN";

  const raisedEth = Number(balance || 0) / 1e18;
  const goalEth = Number(goal || 0) / 1e18;
  const progress = goalEth > 0 ? Math.min((raisedEth / goalEth) * 100, 100) : 0;

  // Theme Logic for Status
  const getStatusTheme = () => {
    switch (statusText) {
      case "VERIFIED":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "COMPLETED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }
  };

  return (
    <div className="group bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col transition-all hover:-translate-y-2 hover:border-white/20 shadow-2xl">
      
      {/* Banner with Overlay Gradient */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={`https://picsum.photos/seed/${contractAddress}/600/300`}
          alt="Campaign Banner"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase backdrop-blur-md ${getStatusTheme()}`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-2xl font-black mb-2 text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {name || "Loading..."}
          </h3>

          <p className="text-gray-500 text-sm mb-8 line-clamp-2 leading-relaxed">
            {description || "No description provided for this smart contract campaign."}
          </p>

          {/* Progress Bar UI */}
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Raised Progress</span>
              <span className="text-xs font-black text-cyan-400">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-[10px] font-bold text-white">{raisedEth.toFixed(3)} ETH</span>
              <span className="text-[10px] font-bold text-gray-600 uppercase">Goal: {goalEth.toFixed(2)} ETH</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href={`/campaign/${contractAddress}`}
            className="block w-full text-center py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            Manage Campaign
          </Link>
          
          <Link 
            href={`/admin/docs/${contractAddress}`}
            className="block w-full text-center py-2 text-[10px] font-bold text-gray-500 hover:text-white transition uppercase tracking-widest"
          >
            Review Docs
          </Link>
        </div>
      </div>
    </div>
  );
}