'use client';

import { client } from "@/app/client";
import Link from "next/link";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";

const Navbar = () => {
  const account = useActiveAccount();

  return (
    <nav className="fixed w-full z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/[0.06] transition-all duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">

          {/* Left Side */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="group flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#111827] border border-white/[0.06] flex flex-shrink-0 items-center justify-center transition-all group-hover:border-[#22D3EE]/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <span className="text-[#E5E7EB] font-black text-lg leading-none group-hover:text-[#22D3EE] transition-colors">F</span>
              </div>
              <p className="text-2xl font-black text-[#E5E7EB] tracking-tighter group-hover:text-[#22D3EE] transition-colors">
                FundFlow
              </p>
            </Link>

            <div className="hidden md:flex items-center space-x-2">
              <Link href="/">
                <p className="rounded-full px-4 py-2 text-sm font-bold text-[#9CA3AF] hover:text-[#22D3EE] hover:bg-white/[0.02] transition-colors duration-200">
                  Campaigns
                </p>
              </Link>

              {account && (
                <Link href={`/dashboard`}>
                  <p className="rounded-full px-4 py-2 text-sm font-bold text-[#9CA3AF] hover:text-[#22D3EE] hover:bg-white/[0.02] transition-colors duration-200">
                    Dashboard
                  </p>
                </Link>
              )}

              <Link href="/admin">
                <p className="rounded-full px-4 py-2 text-sm font-bold text-[#9CA3AF] hover:text-[#22D3EE] hover:bg-white/[0.02] transition-colors duration-200">
                  Admin
                </p>
              </Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <ConnectButton
              client={client}
              theme={darkTheme({
                colors: {
                  primaryButtonBg: "#111827",
                  primaryButtonText: "#E5E7EB",
                  accentText: "#22D3EE",
                  accentButtonBg: "#8B5CF6",
                  primaryText: "#E5E7EB",
                  secondaryText: "#9ca3af",
                },
              })}
              detailsButton={{
                style: {
                  height: "44px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backgroundColor: "#111827",
                  transition: "all 0.2s ease-in-out",
                },
              }}
            />
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
