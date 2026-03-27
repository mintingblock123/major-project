"use client";

import { useState } from "react";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { client } from "@/app/client";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";
import Link from "next/link";

export default function AdminPage() {
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  const factoryContract = getContract({
    client,
    chain: sepolia,
    address: CROWDFUNDING_FACTORY,
  });

  // Old Logic: Saari campaigns fetch karna review ke liye
  const { data: campaigns, isLoading } = useReadContract({
    contract: factoryContract,
    method: "function getAllCampaigns() view returns ((address campaignAddress,address owner,string name,uint256 creationTime)[])",
  });

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-[#E5E7EB]">
        <div className="w-20 h-20 bg-red-500/5 rounded-full flex items-center justify-center mb-6 border border-red-500/10">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight">Admin Access Only</h2>
        <p className="text-[#9CA3AF] mt-2 font-medium">Connect an authorized wallet to manage the network.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E5E7EB] py-32 px-6 lg:px-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-web3-grid opacity-30 pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#111827]/50 to-transparent pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto relative z-10 text-left">
        
        {/* Header */}
        <div className="mb-16">
          <span className="px-4 py-1.5 rounded-full bg-[#22D3EE]/10 text-[#22D3EE] text-[10px] font-black tracking-[0.2em] uppercase border border-[#22D3EE]/20">
            Network Governance
          </span>
          <h1 className="text-5xl font-black mt-6 tracking-tight">Admin Suite</h1>
          <p className="text-[#9CA3AF] mt-3 font-medium text-lg">Verify deployments or deactivate projects violating policy.</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#111827] border border-white/[0.06] p-8 rounded-2xl transition-all duration-300 hover:border-white/[0.12]">
            <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-3">Total Ledger Entries</p>
            <p className="text-4xl font-black tracking-tight">{campaigns?.length || 0}</p>
          </div>
          <div className="bg-[#111827] border border-white/[0.06] p-8 rounded-2xl transition-all duration-300 hover:border-white/[0.12]">
            <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-3">Pending Verification</p>
            <p className="text-4xl font-black tracking-tight text-orange-400">
              {campaigns?.filter((c: any) => c.status === 0).length || 0}
            </p>
          </div>
          <div className="bg-[#111827] border border-white/[0.06] p-8 rounded-2xl transition-all duration-300 hover:border-white/[0.12]">
            <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-3">Registry Status</p>
            <p className="text-4xl font-black tracking-tight text-green-400">Active</p>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-4 border-[#22D3EE] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-[#9CA3AF] font-bold uppercase tracking-widest text-[10px]">Syncing Smart Contracts...</p>
          </div>
        ) : campaigns?.length === 0 ? (
          <div className="text-center py-24 bg-[#111827] border border-dashed border-white/[0.06] rounded-2xl flex flex-col items-center">
            <div className="w-16 h-16 bg-[#0B0F19] border border-white/[0.06] rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl text-[#9CA3AF]">📭</span>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-[#E5E7EB]">Ledger Empty</h2>
            <p className="text-[#9CA3AF] max-w-sm">No campaigns have been deployed to the network yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns?.map((c: any, i: number) => (
              <AdminCampaignRow key={i} campaign={c} sendTx={sendTx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- ROW COMPONENT (NEW UI) ---------------- */

function AdminCampaignRow({ campaign, sendTx }: any) {
  const [isProcessing, setIsProcessing] = useState(false);

  const campaignContract = getContract({
    client,
    chain: sepolia,
    address: campaign.campaignAddress,
  });

  // Reading status from individual contract
  const { data: status } = useReadContract({
    contract: campaignContract,
    method: "function status() view returns (uint8)",
  });

  const safeStatus = Number(status || 0);

  // Verification & Deletion Logic
  const handleAction = async (type: 'verify' | 'reject') => {
    setIsProcessing(true);
    try {
      const tx = prepareContractCall({
        contract: getContract({ client, chain: sepolia, address: CROWDFUNDING_FACTORY }),
        method: type === 'verify' ? "function verifyCampaign(address)" : "function rejectCampaign(address)",
        params: [campaign.campaignAddress],
      });
      await sendTx(tx);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="group bg-[#111827] border border-white/[0.06] rounded-2xl p-6 md:p-8 transition-all duration-300 hover:border-white/[0.12] flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Project Info */}
      <div className="flex-1 text-left w-full">
        <div className="flex items-center gap-4 mb-2">
          <h3 className="text-xl font-bold tracking-tight text-[#E5E7EB] group-hover:text-[#22D3EE] transition-colors line-clamp-1">
            {campaign.name}
          </h3>
          {/* Status Badge */}
          {safeStatus === 0 && <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20 whitespace-nowrap">Pending</span>}
          {safeStatus === 1 && <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 whitespace-nowrap">Verified</span>}
          {safeStatus === 2 && <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20 whitespace-nowrap">Rejected / Deleted</span>}
        </div>
        <p className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-widest">
          Hash: {campaign.campaignAddress}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        
        {/* Document Review Button */}
        <Link 
          href={`/admin/docs/${campaign.campaignAddress.toLowerCase()}`}
          className="px-5 py-2.5 bg-[#0B0F19] border border-white/[0.06] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-white/[0.05] transition-colors"
        >
          Review Files
        </Link>

        {/* Dynamic Verification Button */}
        {safeStatus !== 1 && (
          <button
            disabled={isProcessing}
            onClick={() => handleAction('verify')}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-sm text-[10px] font-bold rounded-xl uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isProcessing ? "Wait..." : "Approve"}
          </button>
        )}

        {/* Delete / Reject Button (Admin Power) */}
        {safeStatus !== 2 && (
          <button
            disabled={isProcessing}
            onClick={() => {
              if(confirm("Confirm Deletion: This will hide the campaign from the user's dashboard and block all access.")) {
                handleAction('reject');
              }
            }}
            className="px-4 py-2.5 bg-transparent text-red-400 hover:bg-red-500/10 text-[10px] font-bold rounded-xl uppercase tracking-widest transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? "..." : "Delete"}
          </button>
        )}

        {/* Finalized Status Icon */}
        {(safeStatus === 1 || safeStatus === 2) && !isProcessing && (
           <div className={`p-2.5 rounded-xl bg-[#0B0F19] border ${safeStatus === 1 ? 'border-green-500/20' : 'border-red-500/20'}`}>
              <svg className={`w-4 h-4 ${safeStatus === 1 ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
           </div>
        )}
      </div>
    </div>
  );
}