'use client';

import { client } from "@/app/client";
import Link from "next/link";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";

const Navbar = () => {
  const account = useActiveAccount();

  return (
    <nav className="fixed w-full z-50 bg-[#030014]/50 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">

          {/* Left Side */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="group flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex flex-shrink-0 items-center justify-center neon-border">
                <span className="text-white font-black text-lg leading-none">F</span>
              </div>
              <p className="text-2xl font-black text-white tracking-tighter group-hover:text-cyan-400 transition-colors">
                FundFlow
              </p>
            </Link>

            <div className="hidden md:flex items-center space-x-2">
              <Link href="/">
                <p className="rounded-full px-4 py-2 text-sm font-bold text-gray-300 hover:text-cyan-400 hover:bg-white/5 transition-all">
                  Campaigns
                </p>
              </Link>

              {account && (
                <Link href={`/dashboard`}>
                  <p className="rounded-full px-4 py-2 text-sm font-bold text-gray-300 hover:text-cyan-400 hover:bg-white/5 transition-all">
                    Dashboard
                  </p>
                </Link>
              )}

              <Link href="/admin">
                <p className="rounded-full px-4 py-2 text-sm font-bold text-gray-300 hover:text-cyan-400 hover:bg-white/5 transition-all">
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
                  primaryButtonBg: "#0f172a",
                  primaryButtonText: "#ffffff",
                  accentText: "#00f5ff",
                  accentButtonBg: "#7b61ff",
                  primaryText: "#ffffff",
                  secondaryText: "#9ca3af",
                },
              })}
              detailsButton={{
                style: {
                  height: "44px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "rgba(255,255,255,0.05)",
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
