"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getContract, readContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { client } from "@/app/client";
import { CROWDFUNDING_FACTORY } from "@/app/constants/contracts";

type Campaign = readonly [string, string, string, bigint];
type Tier = readonly [string, bigint, bigint];

const DUMMY_CAMPAIGNS = [
  {
    id: 1,
    category: "Medical",
    title: "Emergency Heart Surgery: Baby Liam",
    goal: "10.0",
    raised: "7.2",
    deadline: "12 Days Left",
    address: "0x71C...4E21",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400&h=250&fit=crop"
  },
  {
    id: 2,
    category: "Education",
    title: "Books & Laptops for Rural Schools",
    goal: "5.0",
    raised: "4.8",
    deadline: "2 Days Left",
    address: "0x3A2...9B10",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&h=250&fit=crop"
  },
  {
    id: 3,
    category: "Technology",
    title: "Eco-Friendly Blockchain Infrastructure",
    goal: "25.0",
    raised: "12.5",
    deadline: "45 Days Left",
    address: "0x88D...2F11",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&h=250&fit=crop"
  },
  {
    id: 4,
    category: "Animal",
    title: "Stray Dog Shelter Expansion",
    goal: "3.5",
    raised: "1.2",
    deadline: "20 Days Left",
    address: "0x123...A1B2",
    img: "https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?q=80&w=400&h=250&fit=crop"
  },
  {
    id: 5,
    category: "Emergency",
    title: "Flood Relief: Urgent Food Supplies",
    goal: "15.0",
    raised: "14.1",
    deadline: "6 Hours Left",
    address: "0xBC2...77D1",
    img: "https://images.unsplash.com/photo-1516550135131-fe3dcb0bedc7?q=80&w=400&h=250&fit=crop"
  },
  {
    id: 6,
    category: "Business",
    title: "Zero-Waste Grocery Startup",
    goal: "8.0",
    raised: "2.4",
    deadline: "30 Days Left",
    address: "0x44E...001A",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&h=250&fit=crop"
  }
];

export default function HomePage() {
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [totalFunds, setTotalFunds] = useState("0.0000");
  const [totalBackers, setTotalBackers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const factory = getContract({
        client,
        chain: sepolia,
        address: CROWDFUNDING_FACTORY,
      });

      const campaigns = (await readContract({
        contract: factory,
        method: "function getAllCampaigns() view returns ((address,address,string,uint256)[])",
      })) as readonly Campaign[];

      setTotalCampaigns(campaigns.length);

      let totalWei = 0n;
      let backersCount = 0;

      await Promise.all(
        campaigns.map(async (c) => {
          const campaignContract = getContract({
            client,
            chain: sepolia,
            address: c[0],
          });

          const [balance, tiers] = await Promise.all([
            readContract({
              contract: campaignContract,
              method: "function getContractBalance() view returns (uint256)",
            }),
            readContract({
              contract: campaignContract,
              method: "function getTiers() view returns ((string,uint256,uint256)[])",
            }),
          ]);

          totalWei += (balance as bigint);
          (tiers as readonly Tier[]).forEach((t) => {
            backersCount += Number(t[2]);
          });
        })
      );

      const totalEth = Number(totalWei) / 1e18;
      setTotalFunds(totalEth.toFixed(4));
      setTotalBackers(backersCount);
    } catch (err) {
      console.error("HOME PAGE STATS ERROR:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
          <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            FUNDFLOW
          </h1>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="/" className="text-cyan-400">Home</Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Explore</Link>
            <Link href="/create" className="text-gray-400 hover:text-white transition">Create</Link>
            <Link href="/admin" className="text-red-500/80 hover:text-red-400 transition">Admin</Link>
          </div>
          <Link href="/dashboard" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-cyan-400 transition">
            Connect Wallet
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="px-4 py-1.5 rounded-full border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest bg-cyan-500/5">
            The Next Gen Crowdfunding
          </span>
          <h1 className="mt-8 text-6xl md:text-8xl font-black leading-tight tracking-tight">
            Fund the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">Future</span>.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-gray-400 text-lg md:text-xl leading-relaxed">
            Eliminate middlemen and build trust. FundFlow uses smart contracts to ensure 
            every penny reaches the right cause with 100% transparency.
          </p>
          <div className="mt-12 flex justify-center gap-4 flex-wrap">
            <Link href="/create" className="px-8 py-4 rounded-2xl font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-all hover:scale-105">
              Start a Campaign
            </Link>
            <Link href="/dashboard" className="px-8 py-4 rounded-2xl font-bold border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all hover:border-white/20">
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      {/* LIVE ACTIVITY TICKER */}
      <div className="bg-white/5 border-y border-white/5 py-3 overflow-hidden">
        <div className="flex gap-12 animate-pulse whitespace-nowrap text-[10px] uppercase tracking-widest text-gray-500 font-bold justify-center">
          <span>🚀 New: Emergency Heart Surgery Fund</span>
          <span className="hidden md:inline">💎 Recent: 0.5 ETH to Rural Schools</span>
          <span>✅ Verified: Eco-Friendly Infrastructure</span>
          <span className="hidden md:inline">🚀 New: Stray Dog Shelter Expansion</span>
        </div>
      </div>

      {/* STATS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard value={`${totalCampaigns}+`} label="Active Campaigns" isLoading={isLoading} />
          <StatCard value={`${totalFunds} ETH`} label="Funds Raised" isLoading={isLoading} />
          <StatCard value={`${totalBackers}+`} label="Global Backers" isLoading={isLoading} />
        </div>
      </section>

      {/* CAMPAIGN SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 blur-[80px] -z-10" />
          <div className="w-full md:w-1/2 aspect-video rounded-3xl overflow-hidden border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800" 
              className="w-full h-full object-cover" 
              alt="Spotlight"
            />
          </div>
          <div className="w-full md:w-1/2 text-left">
            <span className="text-cyan-400 font-bold text-xs uppercase tracking-widest">Featured Spotlight</span>
            <h2 className="text-3xl md:text-5xl font-black mt-4 mb-6">Innovating the Web3 Infrastructure</h2>
            <p className="text-gray-400 text-lg mb-8">This campaign is leading the way in building carbon-neutral node systems for the next generation of decentralized applications.</p>
            <Link href="/dashboard" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 transition">View Details</Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <h2 className="text-3xl font-bold mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <CategoryCard title="Medical" img="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=200&h=200" />
            <CategoryCard title="Education" img="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=200&h=200" />
            <CategoryCard title="Emergency" img="https://images.unsplash.com/photo-1516550135131-fe3dcb0bedc7?auto=format&fit=crop&q=80&w=200&h=200" />
            <CategoryCard title="Animal" img="https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?auto=format&fit=crop&q=80&w=200&h=200" />
            <CategoryCard title="Business" img="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=200&h=200" />
            <CategoryCard title="Technology" img="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200&h=200" />
          </div>
        </div>
      </section>

      {/* TRENDING CAMPAIGNS SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-3xl font-bold">Trending Campaigns</h2>
            <p className="text-gray-500 mt-2">Explore projects that are making waves on the blockchain.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <input 
              type="text" 
              placeholder="Search..." 
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition w-full md:w-64"
            />
            <Link href="/dashboard" className="text-cyan-400 hover:underline font-medium text-sm whitespace-nowrap pt-2">
              View All →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DUMMY_CAMPAIGNS.map((campaign) => (
            <CampaignCard key={campaign.id} {...campaign} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION (VERTICAL STEPPER) */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-left">
        <h2 className="text-3xl font-bold text-center mb-20">How FundFlow Works</h2>
        <div className="space-y-16 relative">
          <div className="absolute left-[23px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-cyan-500 to-purple-600 hidden md:block opacity-20" />
          
          <Step 
            number="01" 
            title="Connect Your Wallet" 
            desc="Link your Web3 wallet (MetaMask, Coinbase, etc.) to securely interact with the platform and confirm transactions on the Sepolia network." 
          />
          <Step 
            number="02" 
            title="Create & Verify" 
            desc="Fill in your campaign details and upload your identity documents. Our admin team verifies every campaign to maintain high trust levels." 
          />
          <Step 
            number="03" 
            title="Flow the Funds" 
            desc="Once verified, your campaign goes live. Funds flow directly from backers to the smart contract, ready for withdrawal once goals are met." 
          />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold">Why Blockchain?</h2>
          <p className="text-gray-500 mt-4">Security and transparency come standard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon="🛡️"
            title="Immutable" 
            desc="Every donation is recorded on Sepolia testnet forever." 
          />
          <FeatureCard 
            icon="⚡"
            title="Instant Flow" 
            desc="Funds are distributed directly through smart contracts." 
          />
          <FeatureCard 
            icon="🌍"
            title="Global Reach" 
            desc="Anyone with a wallet can support your cause." 
          />
          <FeatureCard 
            icon="💎"
            title="Zero Fees" 
            desc="Minimal overhead compared to traditional platforms." 
          />
        </div>
      </section>

      {/* TRUST BADGES / TECH STACK */}
      <div className="py-20 border-t border-white/5 opacity-20 grayscale hover:grayscale-0 transition-all flex flex-wrap justify-center gap-10 md:gap-20">
        <span className="font-bold text-xl tracking-tighter">THIRDWEB</span>
        <span className="font-bold text-xl tracking-tighter">NEXT.JS</span>
        <span className="font-bold text-xl tracking-tighter">SEPOLIA</span>
        <span className="font-bold text-xl tracking-tighter">TAILWIND</span>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 mt-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-500 text-sm italic">
            Built with ❤️ for the Web3 Community.
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <Link href="#">Twitter</Link>
            <Link href="#">Github</Link>
            <Link href="#">Documentation</Link>
          </div>
          <div className="text-gray-500 text-sm">
            © 2026 FundFlow • Sepolia Mainnet
          </div>
        </div>
      </footer>

      {/* CHATBOT CALL */}
      <ChatBot />
    </main>
  );
}

/* HELPER COMPONENTS */

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="flex gap-8 items-start group">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 font-black z-10 group-hover:border-cyan-500 transition-colors">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed max-w-2xl">{desc}</p>
      </div>
    </div>
  );
}

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Hi! I'm your FundFlow helper. How can I assist you today?" },
  ]);

  const qaPairs = [
    {
      q: "How to create campaign?",
      a: "Click on 'Start a Campaign' in the hero section or the 'Create' link in the navbar. Fill in your project details, set a goal in ETH, and upload your verification docs.",
    },
    {
      q: "What docs are required?",
      a: "You need a Government ID (Aadhaar, PAN, Passport, or Voter ID) and a 'Campaign Proof' document (like medical bills or project plans) to verify your cause.",
    },
    {
      q: "Why admin verification?",
      a: "To prevent fraud. Our admins review uploaded documents to ensure every campaign is legitimate, protecting our backers' funds.",
    },
  ];

  const handleQuestion = (q: string, a: string) => {
    setHistory((prev) => [...prev, { role: "user", text: q }, { role: "bot", text: a }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5">
          <div className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 flex justify-between items-center">
            <span className="font-bold text-white">FundFlow Helper</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">✕</button>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-black/20 text-left">
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === "user" ? "bg-cyan-600 text-white" : "bg-white/10 text-gray-200"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/10 space-y-2">
            <p className="text-[10px] text-gray-500 uppercase font-bold px-1 text-left">Common Questions</p>
            <div className="flex flex-wrap gap-2">
              {qaPairs.map((pair, i) => (
                <button
                  key={i}
                  onClick={() => handleQuestion(pair.q, pair.a)}
                  className="text-left text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-lg transition"
                >
                  {pair.q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-cyan-500 hover:bg-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40 transition-transform hover:scale-110 active:scale-95"
      >
        {isOpen ? (
          <span className="text-black font-bold text-xl">✕</span>
        ) : (
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function CampaignCard({ category, title, goal, raised, deadline, address, img }: any) {
  const percentage = Math.min((parseFloat(raised) / parseFloat(goal)) * 100, 100);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 transition-all text-left">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-4 left-4">
          <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-cyan-400 border border-white/10">
            {category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold mb-1 line-clamp-1">{title}</h3>
        <p className="text-[10px] text-gray-500 mb-6 font-mono tracking-tighter">{address}</p>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-cyan-400">{raised} ETH</span>
            <span className="text-gray-400">{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-1000" 
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-[10px] text-gray-500 text-right uppercase tracking-tighter">
            Goal: {goal} ETH
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-white/5 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Time Left</span>
            <span className="text-sm font-semibold">{deadline}</span>
          </div>
          <Link 
            href="/dashboard" 
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition border border-white/5"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, isLoading }: { value: string; label: string; isLoading: boolean }) {
  return (
    <div className="relative group bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden transition-all hover:border-cyan-500/50">
      {isLoading ? (
        <div className="animate-pulse space-y-3 text-center">
          <div className="h-10 w-32 bg-white/10 rounded-lg mx-auto"></div>
          <div className="h-4 w-24 bg-white/5 rounded-lg mx-auto"></div>
        </div>
      ) : (
        <>
          <p className="text-5xl font-black tracking-tighter text-white group-hover:text-cyan-400 transition-colors text-center">
            {value}
          </p>
          <p className="text-gray-400 font-medium mt-2 uppercase text-xs tracking-widest text-center">{label}</p>
        </>
      )}
    </div>
  );
}

function CategoryCard({ title, img }: { title: string; img: string }) {
  return (
    <div className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-square border border-white/10 transition-transform hover:scale-95">
      <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      <div className="absolute bottom-4 left-4">
        <p className="font-bold text-white text-lg">{title}</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all text-center">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}