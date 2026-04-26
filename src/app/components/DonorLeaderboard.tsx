import React from "react";

// Mock Data
const MOCK_DONORS = [
  { walletAddress: "0x1234abcd5678efgh9012ijkl3456mnop7890qrst", totalDonated: 5.5 },
  { walletAddress: "0x5678efgh9012ijkl3456mnop7890qrst1234abcd", totalDonated: 1.8 },
  { walletAddress: "0xabcd5678efgh9012ijkl3456mnop7890qrst1234", totalDonated: 10.2 },
  { walletAddress: "0xefgh9012ijkl3456mnop7890qrst1234abcd5678", totalDonated: 0.5 },
  { walletAddress: "0x9012ijkl3456mnop7890qrst1234abcd5678efgh", totalDonated: 3.1 },
  { walletAddress: "0xijkl3456mnop7890qrst1234abcd5678efgh9012", totalDonated: 2.2 },
  { walletAddress: "0xmnop7890qrst1234abcd5678efgh9012ijkl3456", totalDonated: 0.9 },
  { walletAddress: "0xqrst1234abcd5678efgh9012ijkl3456mnop7890", totalDonated: 4.0 },
  { walletAddress: "0x3456mnop7890qrst1234abcd5678efgh9012ijkl", totalDonated: 1.1 },
  { walletAddress: "0x7890qrst1234abcd5678efgh9012ijkl3456mnop", totalDonated: 7.3 },
  { walletAddress: "0x1111222233334444555566667777888899990000", totalDonated: 0.2 },
];

export const DonorLeaderboard = () => {
  // Sort donors descending by totalDonated and take top 10
  const topDonors = [...MOCK_DONORS]
    .sort((a, b) => b.totalDonated - a.totalDonated)
    .slice(0, 10);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return <span className="text-gray-500 font-mono text-sm">#{index + 1}</span>;
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8">
      <h2 className="text-3xl font-black mb-8 text-white text-center tracking-tight">
        Top Donors
      </h2>
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-4 px-6 text-center text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Rank</th>
              <th className="py-4 px-6 text-left text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Donor</th>
              <th className="py-4 px-6 text-right text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Donated (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {topDonors.map((donor, index) => (
              <tr 
                key={donor.walletAddress} 
                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td className="py-4 px-6 text-center text-xl align-middle">
                  {getRankBadge(index)}
                </td>
                <td className="py-4 px-6 align-middle">
                  <span className="font-mono text-sm text-gray-400 group-hover:text-white transition-colors">
                    {shortenAddress(donor.walletAddress)}
                  </span>
                </td>
                <td className="py-4 px-6 text-right align-middle font-bold text-cyan-400">
                  {donor.totalDonated.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
