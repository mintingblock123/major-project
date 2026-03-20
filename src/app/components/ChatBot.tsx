"use client";
import { useState } from "react";

export default function ChatBot() {
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
    {
      q: "Is my personal information secure?",
      a: "Yes. All user data is encrypted and stored securely and wallet addresses remain protected by blockchain security standards.",
    },
    {
      q: "Why was my campaign rejected?",
      a: "Common reasons include missing details, guideline violations, or failed verification.",
    },
    {
      q: "How do backers fund a campaign?",
      a: "Backers connect their wallet and contribute using supported cryptocurrencies.",
    },
    {
      q: "Are there platform fees?",
      a: "Yes. A small fee is deducted from successful campaigns.",
    },
  ];

  const handleQuestion = (q: string, a: string) => {
    setHistory((prev) => [...prev, { role: "user", text: q }, { role: "bot", text: a }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5">
          <div className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 flex justify-between items-center">
            <span className="font-bold text-white">FundFlow Helper</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">✕</button>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-black/20">
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
            <p className="text-[10px] text-gray-500 uppercase font-bold px-1">Common Questions</p>
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

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-cyan-500 hover:bg-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40 transition-transform hover:scale-110 active:scale-95"
      >
        {isOpen ? (
          <span className="text-black font-bold">✕</span>
        ) : (
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
}