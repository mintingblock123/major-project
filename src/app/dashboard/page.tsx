"use client";

import { useActiveAccount, useReadContract } from "thirdweb/react";
import { getContract, readContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import Link from "next/link";
import { useEffect, useState } from "react";

import { client } from "@/app/client";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";

type Campaign = {
  campaignAddress: string;
  owner: string;
  name: string;
  creationTime: bigint;
};

const CATEGORY_DATA: { [key: string]: { img: string } } = {
  "Medical": { img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600" },
  "Technology": { img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600" },
  "Business": { img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600" },
  "Animal": { img: "https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?q=80&w=600" },
  "Emergency": { img: "https://images.unsplash.com/photo-1516550135131-fe3dcb0bedc7?q=80&w=600" },
  "Education": { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600" },
  "Default": { img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600" }
};

export default function DashboardPage() {
  const account = useActiveAccount();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const factoryContract = getContract({
    client,
    chain: sepolia,
    address: CROWDFUNDING_FACTORY,
  });

  useEffect(() => {
    const loadCampaigns = async () => {
      if (!account) return;
      try {
        const data: readonly Campaign[] = await readContract({
          contract: factoryContract,
          method: "function getUserCampaigns(address _user) view returns ((address campaignAddress,address owner,string name,uint256 creationTime)[])",
          params: [account.address],
        });
        setCampaigns([...data].reverse());
      } catch (err) {
        console.error("Error loading campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCampaigns();
  }, [account, factoryContract]);

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
          <span className="text-3xl animate-pulse">🔒</span>
        </div>
        <p className="text-2xl font-black mb-2 tracking-tighter text-center">Connection Required</p>
        <button className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-xl">Connect Wallet</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white py-16 px-6 relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">Dashboard</h1>
            <p className="text-gray-500 font-medium max-w-xl italic">Manage your active deployments and fund flow protocol.</p>
          </div>
          <Link
            href="/create"
            className="px-8 py-4 rounded-2xl bg-cyan-500 text-black font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition shadow-xl active:scale-95"
          >
            + New Project
          </Link>
        </div>

        {!loading && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <DashboardStat label="Total Projects" value={campaigns.length} icon="📂" />
            <DashboardStat label="Wallet" value="Active" icon="💰" />
            <DashboardStat label="Network" value="Sepolia" icon="🛡️" />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-white/5 animate-pulse rounded-[2.5rem] border border-white/5" />
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {campaigns.map((campaign, index) => (
              <DashboardFilter key={index} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
            <h2 className="text-2xl font-black mb-4">Registry Empty</h2>
            <Link href="/create" className="text-cyan-400 font-bold hover:underline">Start Your First Campaign →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardFilter({ campaign }: { campaign: Campaign }) {
  const contract = getContract({ client, chain: sepolia, address: campaign.campaignAddress });
  const { data: status } = useReadContract({ contract, method: "function status() view returns (uint8)" });
  const safeStatus = Number(status || 0);

  if (safeStatus === 2) return null;

  return <CampaignCard campaign={campaign} />;
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [activeCategory, setActiveCategory] = useState("Default");
  const campaignContract = getContract({ client, chain: sepolia, address: campaign.campaignAddress });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`/uploads/${campaign.campaignAddress.toLowerCase()}/metadata.json?v=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.category) setActiveCategory(data.category);
        }
      } catch (err) { console.error("Metadata error:", err); }
    };
    fetchMetadata();
  }, [campaign.campaignAddress]);

  const { data: status } = useReadContract({ contract: campaignContract, method: "function status() view returns (uint8)" });
  const { data: goal } = useReadContract({ contract: campaignContract, method: "function goal() view returns (uint256)" });
  const { data: raised } = useReadContract({ contract: campaignContract, method: "function amountCollected() view returns (uint256)" });
  const { data: deadline } = useReadContract({ contract: campaignContract, method: "function deadline() view returns (uint256)" });

  const safeStatus = Number(status || 0);
  const goalEth = Number(goal || 0) / 1e18;
  const raisedEth = Number(raised || 0) / 1e18;
  const progress = goalEth > 0 ? Math.min((raisedEth / goalEth) * 100, 100) : 0;
  
  const now = Math.floor(Date.now() / 1000);
  const deadlineNum = Number(deadline || 0);
  const isExpired = now >= deadlineNum;
  const daysLeft = !isExpired ? Math.ceil((deadlineNum - now) / 86400) : 0;

  const getBadgeTheme = () => {
    if (isExpired) return "bg-red-500/20 text-red-400 border-red-500/30";
    switch(safeStatus) {
      case 1: return "bg-green-500/20 text-green-400 border-green-500/30"; // Verified
      case 2: return "bg-red-500/20 text-red-400 border-red-500/30"; // Rejected
      default: return "bg-orange-500/20 text-orange-400 border-orange-500/30"; // Pending
    }
  };

  const statusText = isExpired ? "Campaign Closed" : (safeStatus === 1 ? "Verified" : "Pending");
  const coverImg = CATEGORY_DATA[activeCategory]?.img || CATEGORY_DATA["Default"].img;

  return (
    <div className={`group bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col h-full transition-all duration-500 hover:scale-[1.02] ${isExpired ? 'opacity-75 grayscale-[0.2]' : ''}`}>
      
      <div className="relative h-44 overflow-hidden">
        <img src={coverImg} alt="Campaign" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
        
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-md ${getBadgeTheme()}`}>
            {statusText}
          </div>
          {!isExpired && safeStatus === 0 && <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping" />}
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col justify-between">
        <div className="text-left">
          <h3 className="text-2xl font-black tracking-tighter mb-2 truncate uppercase group-hover:text-cyan-400 transition-colors">
            {campaign.name}
          </h3>
          <p className="text-[10px] font-mono text-gray-600 mb-8 truncate tracking-widest uppercase">
            {campaign.campaignAddress.slice(0, 8)}...{campaign.campaignAddress.slice(-4)}
          </p>

          <div className="space-y-6 mb-8 mt-6">
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Goal: {goalEth} ETH</p>
                  <p className="text-xl font-black text-cyan-400">{raisedEth.toFixed(3)} Raised</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Time Left</p>
                  <p className={`text-xl font-black ${isExpired ? 'text-red-500' : 'text-white'}`}>
                    {isExpired ? "Ended" : `${daysLeft} Days`}
                  </p>
               </div>
            </div>

            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-1000 ${isExpired ? 'bg-gray-500' : 'bg-gradient-to-r from-cyan-500 to-blue-600'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isExpired ? (
            <button disabled className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-gray-600 font-black text-xs uppercase tracking-widest cursor-not-allowed">
              Funding Closed
            </button>
          ) : safeStatus === 1 ? (
            <Link
              href={`/campaign/${campaign.campaignAddress}`}
              className="flex items-center justify-center w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all active:scale-95 shadow-xl"
            >
              Manage & Fund →
            </Link>
          ) : (
             <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-center gap-3">
                <span className="text-lg">⏳</span>
                <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Awaiting Approval</p>
             </div>
          )}
          
          <Link 
            href={`/admin/docs/${campaign.campaignAddress}`}
            className="block w-full text-center py-2 text-[10px] font-bold text-gray-500 hover:text-white transition uppercase tracking-widest"
          >
            Review Uploaded Files
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardStat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 text-left hover:border-cyan-500/30 transition-all group">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-xl bg-white/5 p-2 rounded-xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-4xl font-black tracking-tighter text-white">{value}</p>
    </div>
  );
}