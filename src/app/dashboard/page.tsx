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
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-[#111827] rounded-full flex items-center justify-center mb-6 border border-white/[0.06] shadow-sm">
          <span className="text-3xl">🔒</span>
        </div>
        <p className="text-2xl font-black mb-2 tracking-tighter text-[#E5E7EB]">Connection Required</p>
        <p className="text-[#9CA3AF] mb-8 font-medium">Please connect your Web3 wallet to access your dashboard.</p>
        <button className="px-8 py-3 bg-[#E5E7EB] text-[#111827] hover:bg-white font-bold rounded-xl transition-all duration-300">Connect Wallet</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-32 px-6 relative overflow-hidden text-left">
      <div className="absolute inset-0 bg-web3-grid opacity-30 pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#111827]/50 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-[#E5E7EB]">Dashboard</h1>
            <p className="text-[#9CA3AF] font-medium max-w-xl">Manage your active deployments and fund flow protocol.</p>
          </div>
          <Link
            href="/create"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold text-sm hover:scale-[1.02] transition-all shadow-sm active:scale-[0.98] flex items-center gap-2"
          >
            + New Project
          </Link>
        </div>

        {!loading && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 relative z-10">
            <DashboardStat label="Total Projects" value={campaigns.length} icon="📂" />
            <DashboardStat label="Wallet" value="Active" icon="💰" />
            <DashboardStat label="Network" value="Sepolia" icon="🛡️" />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[450px] bg-[#111827] border border-white/[0.06] rounded-2xl animate-shimmer overflow-hidden flex flex-col">
                <div className="h-44 bg-white/[0.02]" />
                <div className="p-8 flex-1 space-y-6">
                   <div className="h-6 w-3/4 bg-white/[0.04] rounded" />
                   <div className="h-3 w-1/2 bg-white/[0.02] rounded" />
                   <div className="space-y-3 pt-6">
                      <div className="flex justify-between">
                         <div className="h-10 w-24 bg-white/[0.04] rounded" />
                         <div className="h-10 w-24 bg-white/[0.02] rounded" />
                      </div>
                      <div className="h-2 w-full bg-white/[0.04] rounded-full" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {campaigns.map((campaign, index) => (
              <DashboardFilter key={index} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#111827] border border-dashed border-white/[0.06] rounded-2xl relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#0B0F19] border border-white/[0.06] rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl text-[#9CA3AF]">📂</span>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-[#E5E7EB]">No Active Campaigns</h2>
            <p className="text-[#9CA3AF] mb-8 max-w-sm">You haven't created any campaigns yet. Start building your project on the blockchain today.</p>
            <Link href="/create" className="px-6 py-3 bg-[#E5E7EB] text-[#111827] font-bold rounded-xl transition-all duration-300 hover:scale-[1.02]">Start Your First Campaign</Link>
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
    if (isExpired) return "bg-red-500/10 text-red-400 border-red-500/20";
    switch(safeStatus) {
      case 1: return "bg-green-500/10 text-green-400 border-green-500/20"; // Verified
      case 2: return "bg-red-500/10 text-red-400 border-red-500/20"; // Rejected
      default: return "bg-orange-500/10 text-orange-400 border-orange-500/20"; // Pending
    }
  };

  const statusText = isExpired ? "Closed" : (safeStatus === 1 ? "Verified" : "Pending");
  const coverImg = CATEGORY_DATA[activeCategory]?.img || CATEGORY_DATA["Default"].img;

  return (
    <div className={`group bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col h-full glass-card-hover ${isExpired ? 'opacity-75 grayscale-[0.2]' : ''}`}>
      
      <div className="relative h-44 overflow-hidden">
        <img src={coverImg} alt="Campaign" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
        
        <div className="absolute top-4 left-4 flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${getBadgeTheme()}`}>
            {statusText}
          </div>
          {!isExpired && safeStatus === 0 && <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" />}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="text-left">
          <h3 className="text-xl font-bold mb-1 truncate text-[#E5E7EB] group-hover:text-[#22D3EE] transition-colors">
            {campaign.name}
          </h3>
          <p className="text-[10px] font-mono text-[#9CA3AF]/60 mb-6 truncate tracking-widest uppercase">
            {campaign.campaignAddress.slice(0, 8)}...{campaign.campaignAddress.slice(-4)}
          </p>

          <div className="space-y-4 mb-6 pt-4 border-t border-white/[0.06]">
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Goal: {goalEth} ETH</p>
                  <p className="text-xl font-black text-[#22D3EE]">{raisedEth.toFixed(3)} Raised</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Time Left</p>
                  <p className={`text-xl font-black ${isExpired ? 'text-red-400' : 'text-[#E5E7EB]'}`}>
                    {isExpired ? "Ended" : `${daysLeft} Days`}
                  </p>
               </div>
            </div>

            <div className="w-full h-1 bg-[#0B0F19] rounded-full overflow-hidden border border-white/[0.06]">
              <div 
                className={`h-full transition-all duration-1000 ${isExpired ? 'bg-gray-600' : 'bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6]'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {isExpired ? (
            <button disabled className="w-full py-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[#9CA3AF] font-bold text-xs uppercase cursor-not-allowed">
              Funding Closed
            </button>
          ) : safeStatus === 1 ? (
            <Link
              href={`/campaign/${campaign.campaignAddress}`}
              className="flex items-center justify-center w-full py-3.5 rounded-xl bg-[#E5E7EB] text-[#111827] font-bold text-sm transition-all hover:bg-white hover:scale-[1.02] active:scale-[0.98]"
            >
              Manage & Fund
            </Link>
          ) : (
             <div className="p-3 bg-orange-500/5 rounded-xl border border-orange-500/10 flex items-center justify-center gap-2">
                <span className="text-sm">⏳</span>
                <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Awaiting Approval</p>
             </div>
          )}
          
          <Link 
            href={`/admin/docs/${campaign.campaignAddress}`}
            className="block w-full text-center py-2 text-[10px] font-bold text-[#9CA3AF] hover:text-[#E5E7EB] transition uppercase tracking-widest"
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
    <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-8 text-left transition-all duration-300 group relative overflow-hidden glass-card-hover">
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-lg bg-[#0B0F19] p-3 rounded-lg border border-white/[0.06] flex items-center justify-center group-hover:border-[#22D3EE]/30 transition-colors duration-300">{icon}</span>
          <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-4xl font-black tracking-tight text-[#E5E7EB] group-hover:text-[#22D3EE] transition-colors duration-300">{value}</p>
      </div>
    </div>
  );
}