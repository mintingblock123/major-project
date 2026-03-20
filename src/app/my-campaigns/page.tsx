"use client";

import { useActiveAccount, useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { client } from "@/app/client";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";
import Link from "next/link";

export default function MyCampaignsPage() {
  const account = useActiveAccount();

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Connect wallet to see your campaigns
      </div>
    );
  }

  const factoryContract = getContract({
    client,
    chain: sepolia,
    address: CROWDFUNDING_FACTORY,
  });

  const { data: myCampaigns, isLoading } = useReadContract({
    contract: factoryContract,
    method:
      "function getUserCampaigns(address _user) view returns ((address campaignAddress,address owner,string name,uint256 creationTime)[])",
    params: [account.address],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-black text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-10">My Campaigns</h1>

        {isLoading ? (
          <p>Loading...</p>
        ) : myCampaigns && myCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {myCampaigns.map((c: any, i: number) => (
              <CampaignCard key={i} campaign={c} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No campaigns created yet.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- CARD ---------------- */

function CampaignCard({ campaign }: any) {
  const contract = getContract({
    client,
    chain: sepolia,
    address: campaign.campaignAddress,
  });

  const { data: status } = useReadContract({
    contract,
    method: "function status() view returns (uint8)",
  });

  const { data: phase } = useReadContract({
    contract,
    method: "function currentPhase() view returns (uint256)",
  });

  const statusMap = ["PENDING", "VERIFIED", "REJECTED", "COMPLETED"];
  const phasePercent = [20, 50, 80, 100];

  const statusText = statusMap[Number(status || 0)];
  const phaseText = phasePercent[Number(phase || 0)];

  const statusColor = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    VERIFIED: "bg-green-500/20 text-green-400",
    REJECTED: "bg-red-500/20 text-red-400",
    COMPLETED: "bg-purple-500/20 text-purple-400",
  }[statusText];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-2">{campaign.name}</h2>

      <p className="text-sm text-gray-400">
        Address: {campaign.campaignAddress.slice(0, 6)}...
        {campaign.campaignAddress.slice(-4)}
      </p>

      <div className="flex justify-between items-center mt-4">
        <span className={`px-3 py-1 rounded-full text-xs ${statusColor}`}>
          {statusText}
        </span>

        <span className="text-sm text-cyan-400">
          Phase: {phaseText}%
        </span>
      </div>

      <Link
        href={`/campaign/${campaign.campaignAddress}`}
        className="block mt-5 text-center bg-gradient-to-r from-cyan-400 to-purple-600 text-black py-2 rounded-lg font-semibold"
      >
        Open Campaign →
      </Link>
    </div>
  );
}
