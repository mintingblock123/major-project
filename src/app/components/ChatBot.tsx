"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Hi! I'm your FundFlow helper. 👋 How can I assist you today?" },
  ]);

  const qaPairs = [
    {
      q: "How to create campaign?",
      keywords: ["create", "start", "make", "launch", "campaign"],
      a: "Click on 'Start a Campaign' in the hero section or the 'Create' link in the navbar. Fill in your project details, set a goal in ETH, and upload your verification docs.",
    },
    {
      q: "What docs are required?",
      keywords: ["doc", "docs", "document", "documents", "required", "proof"],
      a: "You need a Government ID (Aadhaar, PAN, Passport, or Voter ID) and a 'Campaign Proof' document (like medical bills or project plans) to verify your cause.",
    },
    {
      q: "Why admin verification?",
      keywords: ["admin", "verify", "verification", "verified"],
      a: "To prevent fraud. Our admins review uploaded documents to ensure every campaign is legitimate, protecting our backers' funds.",
    },
    {
      q: "Is my personal info secure?",
      keywords: ["secure", "security", "safe", "personal", "info", "data"],
      a: "Yes. All user data is encrypted and stored securely and wallet addresses remain protected by blockchain security standards.",
    },
    {
      q: "Why was my campaign rejected?",
      keywords: ["reject", "rejected", "decline", "declined", "fail"],
      a: "Common reasons include missing details, guideline violations, or failed verification.",
    },
    {
      q: "How do backers fund?",
      keywords: ["fund", "backer", "backers", "donate", "contribute", "pay"],
      a: "Backers connect their wallet and contribute using supported cryptocurrencies like ETH.",
    },
    {
      q: "Are there platform fees?",
      keywords: ["fee", "fees", "cost", "charge", "platform"],
      a: "Yes. A small nominal fee is deducted from successful campaigns to keep the platform running.",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isTyping]);

  const simulateBotResponse = (userText: string, customAnswer?: string) => {
    setIsTyping(true);

    setTimeout(() => {
      let botAnswer = customAnswer;

      if (!botAnswer) {
        const lowerInput = userText.toLowerCase();
        const matchedPair = qaPairs.find(p => p.keywords.some(k => lowerInput.includes(k)));

        if (matchedPair) {
          botAnswer = matchedPair.a;
        } else {
          botAnswer = "I'm not exactly sure about that. Could you try asking one of the suggested questions below or rephrase your question?";
        }
      }

      setHistory((prev) => [...prev, { role: "bot", text: botAnswer as string }]);
      setIsTyping(false);
    }, 800 + Math.random() * 500); 
  };

  const handleQuestionSelect = (q: string, a: string) => {
    setHistory((prev) => [...prev, { role: "user", text: q }]);
    simulateBotResponse(q, a);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setHistory((prev) => [...prev, { role: "user", text: userText }]);
    setInputText("");
    simulateBotResponse(userText);
  };

  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* CHAT WINDOW */}
      <div
        className={`mb-4 w-[90vw] md:w-96 bg-[#111827] border border-white/[0.06] rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none absolute bottom-16 right-0'
          }`}
      >
        <div className="p-4 bg-[#0B0F19] flex justify-between items-center border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] animate-pulse"></div>
            <span className="font-bold tracking-wide text-[#E5E7EB] text-sm">FundFlow Helper</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#9CA3AF] hover:text-[#E5E7EB] p-1.5 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-[#111827] scrollbar-thin scrollbar-thumb-white/[0.1] scrollbar-track-transparent">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded bg-[#0B0F19] border border-white/[0.06] flex-shrink-0 mr-2 mt-1 flex items-center justify-center">
                  <span className="text-[#E5E7EB] text-[10px] font-bold">FF</span>
                </div>
              )}
              <div className={`max-w-[80%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === "user"
                  ? "bg-white/[0.08] text-[#E5E7EB] rounded-tr-sm"
                  : "bg-[#0B0F19] border border-white/[0.06] text-[#E5E7EB] rounded-tl-sm"
                }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in">
              <div className="w-7 h-7 rounded bg-[#0B0F19] border border-white/[0.06] flex-shrink-0 mr-2 mt-1 flex items-center justify-center">
                <span className="text-[#E5E7EB] text-[10px] font-bold">FF</span>
              </div>
              <div className="bg-[#0B0F19] rounded-2xl rounded-tl-sm border border-white/[0.06] p-3.5 px-4 flex items-center gap-1.5 h-[42px]">
                <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/[0.06] bg-[#0B0F19]">
          <p className="text-[10px] text-[#9CA3AF] uppercase font-bold px-1 mb-2 tracking-wider flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Suggested Topics
          </p>
          <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1">
            {qaPairs.map((pair, i) => (
              <button
                key={i}
                onClick={() => handleQuestionSelect(pair.q, pair.a)}
                disabled={isTyping}
                className="text-left text-[11px] bg-[#111827] hover:bg-white/[0.06] text-[#9CA3AF] hover:text-[#E5E7EB] border border-white/[0.06] hover:border-[#22D3EE]/50 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pair.q}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your question..."
              disabled={isTyping}
              className="w-full bg-[#111827] text-[13px] text-[#E5E7EB] placeholder-[#9CA3AF] rounded-xl px-4 py-3 pr-12 border border-white/[0.06] focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/40 transition-all duration-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="absolute right-1.5 p-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-lg disabled:opacity-50 hover:shadow-lg hover:shadow-[#22D3EE]/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* FLOATING BUTTON */}
      <button
        onClick={toggleChat}
        className="group relative w-14 h-14 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 z-50 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-[#111827] relative z-10 transition-transform duration-300 rotate-0 hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-[#111827] relative z-10 transition-transform group-hover:-rotate-12 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
}