"use client";

import { client } from "@/app/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";

type CampaignCardProps = {
  campaignAddress: string;
};

// Category to Image and Badge Mapping
const CATEGORY_DATA: { [key: string]: { img: string; color: string } } = {
  "Medical": { img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  "Technology": { img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  "Business": { img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  "Animal": { img: "https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?q=80&w=600", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  "Emergency": { img: "https://images.unsplash.com/photo-1516550135131-fe3dcb0bedc7?q=80&w=600", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  "Education": { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  "Default": { img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
};

export const CampaignCard = ({ campaignAddress }: CampaignCardProps) => {
  const [activeCategory, setActiveCategory] = useState("Default");

  const contract = getContract({
    client,
    chain: sepolia,
    address: campaignAddress,
  });

  // 🔥 Automatic Metadata Fetching
  useEffect(() => {
  const fetchMetadata = async () => {
    try {
      // ?v=${Date.now()} add karne se browser hamesha fresh data fetch karega
      const res = await fetch(`/uploads/${campaignAddress.toLowerCase()}/metadata.json?v=${Date.now()}`);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Metadata Found for:", campaignAddress, data); // Console check karein
        if (data.category) {
          setActiveCategory(data.category);
        }
      } else {
        console.warn("Metadata file not found for:", campaignAddress);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  if (campaignAddress) {
    fetchMetadata();
  }
}, [campaignAddress]);

  /* ---------------- READ BLOCKCHAIN DATA ---------------- */
  const { data: campaignName } = useReadContract({ contract, method: "function name() view returns (string)" });
  const { data: goal } = useReadContract({ contract, method: "function goal() view returns (uint256)" });
  const { data: balance } = useReadContract({ contract, method: "function getContractBalance() view returns (uint256)" });

  const goalEth = Number(goal || 0) / 1e18;
  const balanceEth = Number(balance || 0) / 1e18;

  let progress = goalEth > 0 ? (balanceEth / goalEth) * 100 : 0;
  if (progress > 100) progress = 100;

  const activeData = CATEGORY_DATA[activeCategory] || CATEGORY_DATA["Default"];

  return (
    <div className="group max-w-sm bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all hover:-translate-y-2 hover:border-white/20">

      {/* Image Container with Badge */}
      <div className="relative w-full h-52 overflow-hidden">
        <img
          src={activeData.img}
          alt={campaignName || "Campaign"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border backdrop-blur-md ${activeData.color}`}>
            {activeCategory}
          </span>
        </div>
      </div>

      <div className="p-8">
        {/* Title & Address */}
        <h3 className="text-2xl font-black mb-1 text-white truncate group-hover:text-cyan-400 transition-colors text-left">
          {campaignName || "Loading..."}
        </h3>
        <p className="text-[10px] font-mono text-gray-600 mb-6 tracking-widest uppercase text-left">
          {campaignAddress.slice(0, 6)}...{campaignAddress.slice(-4)}
        </p>

        {/* Progress Section */}
        <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-end mb-3">
              <span className="text-cyan-400 font-bold text-sm">{balanceEth.toFixed(3)} ETH</span>
              <span className="text-gray-500 text-xs font-bold">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex justify-center mt-3">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                    Goal: {goalEth.toFixed(2)} ETH
                </span>
            </div>
        </div>

        {/* View Details Button */}
        <Link href={`/campaign/${campaignAddress}`}>
          <div className="w-full text-center py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all active:scale-95 shadow-xl">
            View Details
          </div>
        </Link>
      </div>
    </div>
  );
};