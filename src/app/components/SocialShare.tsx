"use client";

import React from "react";
import { FaWhatsapp, FaLinkedin, FaTwitter } from "react-icons/fa";

type SocialShareProps = {
  title: string;
};

export const SocialShare = ({ title }: SocialShareProps) => {
  const shareToPlatform = (platform: "whatsapp" | "linkedin" | "twitter") => {
    if (typeof window === "undefined") return;
    
    const url = encodeURIComponent(window.location.href);
    const encodedTitle = encodeURIComponent(title || "Check out this campaign!");
    
    let shareUrl = "";
    
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedTitle} ${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${url}`;
        break;
    }
    
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-4 mt-8 animate-in fade-in duration-1000">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Share:</span>
      <button
        onClick={() => shareToPlatform("twitter")}
        className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/30 transition-all active:scale-95"
        title="Share on Twitter"
      >
        <FaTwitter size={18} />
      </button>
      <button
        onClick={() => shareToPlatform("linkedin")}
        className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30 transition-all active:scale-95"
        title="Share on LinkedIn"
      >
        <FaLinkedin size={18} />
      </button>
      <button
        onClick={() => shareToPlatform("whatsapp")}
        className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/30 transition-all active:scale-95"
        title="Share on WhatsApp"
      >
        <FaWhatsapp size={18} />
      </button>
    </div>
  );
};
