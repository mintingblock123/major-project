'use client';

import { client } from "@/app/client";
import Link from "next/link";
import { ConnectButton, lightTheme, useActiveAccount } from "thirdweb/react";

const Navbar = () => {
  const account = useActiveAccount();

  return (
    <nav className="bg-slate-100 border-b-2 border-b-slate-300">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">

          {/* Left Side */}
          <div className="flex items-center space-x-6">
            <Link href="/">
              <p className="text-xl font-bold text-slate-800">
                FundFlow Crowdfunding
              </p>
            </Link>

            <Link href="/">
              <p className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-black">
                Campaigns
              </p>
            </Link>

            {account && (
              <Link href={`/dashboard/${account.address}`}>
                <p className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-black">
                  Dashboard
                </p>
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div>
            <ConnectButton
              client={client}
              theme={lightTheme({
                colors: {
                  primaryButtonBg: "#0f172a",
                  primaryButtonText: "#ffffff",
                },
              })}
              detailsButton={{
                style: {
                  height: "42px",
                  borderRadius: "8px",
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
