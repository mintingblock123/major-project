"use client";

import { useState } from "react";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
import { sepolia } from "thirdweb/chains";

type Tier = {
  name: string;
  amount: bigint;
  backers: bigint;
};

type Props = {
  tier: Tier;
  index: number;
  contract: any;
  isEditing: boolean;
  onTransactionConfirmed: () => void;
};

export default function TierCard({ tier, index, contract, isEditing, onTransactionConfirmed }: Props) {
  const { mutateAsync: sendTx, isPending } = useSendTransaction();
  const [isRemoving, setIsRemoving] = useState(false);

  const amountEth = Number(tier.amount) / 1e18;

  // 1. Funding Logic
  const handleFund = async () => {
    try {
      const tx = prepareContractCall({
        contract,
        method: "function fund(uint256) payable",
        params: [BigInt(index)],
        value: tier.amount,
      });
      await sendTx(tx);
      onTransactionConfirmed();
    } catch (err) {
      console.error("Funding Error:", err);
    }
  };

  // 2. Remove Tier Logic
  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      const tx = prepareContractCall({
        contract,
        method: "function removeTier(uint256)",
        params: [BigInt(index)],
      });
      await sendTx(tx);
      onTransactionConfirmed();
    } catch (err) {
      console.error("Remove Error:", err);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="relative group">
      {/* Background Glow Effect on Hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-500" />
      
      <div className="relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 flex flex-col h-full shadow-2xl overflow-hidden">
        
        {/* Tier Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-left">
            <h3 className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-cyan-400 transition-colors">
              {tier.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl">👥</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {tier.backers.toString()} Backers
              </span>
            </div>
          </div>
          <div className="bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
             <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Active</span>
          </div>
        </div>

        {/* Amount Display */}
        <div className="mb-8 text-left">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Minimum Contribution</p>
          <p className="text-4xl font-black tracking-tighter text-white">
            {amountEth.toFixed(4)} <span className="text-sm text-gray-500 font-bold">ETH</span>
          </p>
        </div>

        {/* Actions Section */}
        <div className="mt-auto space-y-3">
          <button
            onClick={handleFund}
            disabled={isPending}
            className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-cyan-400 transition-all active:scale-95 shadow-xl shadow-white/5 disabled:opacity-50"
          >
            {isPending ? "Syncing..." : "Support this Tier"}
          </button>

          {isEditing && (
            <button
              onClick={handleRemove}
              disabled={isRemoving || isPending}
              className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 hover:text-red-400 transition-all border border-red-500/10 rounded-xl hover:bg-red-500/5"
            >
              {isRemoving ? "Deleting..." : "Remove Tier"}
            </button>
          )}
        </div>

        {/* Bottom Abstract Decoration */}
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-cyan-500/5 blur-3xl -z-10" />
      </div>
    </div>
  );
}