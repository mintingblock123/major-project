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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-2xl shadow-red-500/10">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-3xl font-black tracking-tighter">Admin Access Only</h2>
        <p className="text-gray-500 mt-2">Connect an authorized wallet to manage the network.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 py-16 px-6 lg:px-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 text-left">
        
        {/* Header */}
        <div className="mb-16">
          <span className="px-4 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase border border-blue-500/20">
            Network Governance
          </span>
          <h1 className="text-6xl font-black mt-4 tracking-tighter">Admin Suite</h1>
          <p className="text-gray-500 mt-2 font-medium">Verify deployments or deactivate projects violating policy.</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Ledger Entries</p>
            <p className="text-4xl font-black tracking-tighter">{campaigns?.length || 0}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Pending Verification</p>
            <p className="text-4xl font-black tracking-tighter text-orange-400">
              {campaigns?.filter((c: any) => c.status === 0).length || 0}
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Registry Status</p>
            <p className="text-4xl font-black tracking-tighter text-green-400">Active</p>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Syncing Smart Contracts...</p>
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
    <div className="group bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Project Info */}
      <div className="flex-1 text-left w-full">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-2xl font-black tracking-tighter group-hover:text-cyan-400 transition-colors">
            {campaign.name}
          </h3>
          {/* Status Badge */}
          {safeStatus === 0 && <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest px-2 py-0.5 bg-orange-500/10 rounded-md border border-orange-500/20">Pending</span>}
          {safeStatus === 1 && <span className="text-[9px] font-black text-green-400 uppercase tracking-widest px-2 py-0.5 bg-green-500/10 rounded-md border border-green-500/20">Verified</span>}
          {safeStatus === 2 && <span className="text-[9px] font-black text-red-400 uppercase tracking-widest px-2 py-0.5 bg-red-500/10 rounded-md border border-red-500/20">Rejected / Deleted</span>}
        </div>
        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
          Hash: {campaign.campaignAddress}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        
        {/* Document Review Button */}
        <Link 
          href={`/admin/docs/${campaign.campaignAddress.toLowerCase()}`}
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          Review Files
        </Link>

        {/* Dynamic Verification Button */}
        {safeStatus !== 1 && (
          <button
            disabled={isProcessing}
            onClick={() => handleAction('verify')}
            className="px-6 py-3 bg-white text-black text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-cyan-500/10"
          >
            {isProcessing ? "WAIT" : "Approve"}
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
            className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            {isProcessing ? "..." : "Delete / Hide"}
          </button>
        )}

        {/* Finalized Status Icon */}
        {(safeStatus === 1 || safeStatus === 2) && !isProcessing && (
           <div className={`p-3 rounded-2xl bg-white/5 border ${safeStatus === 1 ? 'border-green-500/20' : 'border-red-500/20'}`}>
              <svg className={`w-5 h-5 ${safeStatus === 1 ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
           </div>
        )}
      </div>
    </div>
  );
}