"use client";

import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useActiveAccount } from "thirdweb/react";
import { useNotification } from "@/app/context/NotificationContext";

type Comment = {
  id: string;
  campaignId: string;
  userId: string;
  message: string;
  timestamp: any;
  isAdmin: boolean;
};

type CommentsProps = {
  campaignId: string;
  isAdminView?: boolean;
};

export const Comments = ({ campaignId, isAdminView = false }: CommentsProps) => {
  const account = useActiveAccount();
  const { showNotification } = useNotification();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!campaignId) return;

    const q = query(
      collection(db, "comments"),
      where("campaignId", "==", campaignId.toLowerCase()),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(fetchedComments);
    }, (error) => {
      console.error("Error fetching comments:", error);
    });

    return () => unsubscribe();
  }, [campaignId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert("Please connect your wallet to comment.");
      return;
    }
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        campaignId: campaignId.toLowerCase(),
        userId: account.address,
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        isAdmin: isAdminView,
      });
      setNewMessage("");
      showNotification("Comment added!", "success");
    } catch (error) {
      console.error("Error adding comment:", error);
      showNotification("Failed to post comment.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
    return new Date(timestamp.toDate()).toLocaleString();
  };

  const shortenAddress = (address: string) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="mt-16 w-full">
      <div className="flex items-center gap-6 mb-8">
        <h2 className="text-3xl font-black tracking-tighter uppercase text-white">Discussion</h2>
        <div className="h-[1px] flex-1 bg-white/10" />
      </div>

      {/* Comments List */}
      <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.01] rounded-2xl border border-dashed border-white/10">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${
                comment.isAdmin 
                  ? "bg-purple-500/10 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
                  : "bg-white/[0.03] border-white/10"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-sm font-bold ${comment.isAdmin ? 'text-purple-400' : 'text-cyan-400'}`}>
                    {shortenAddress(comment.userId)}
                  </span>
                  {comment.isAdmin && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Admin
                    </span>
                  )}
                  {account?.address.toLowerCase() === comment.userId.toLowerCase() && !comment.isAdmin && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-white/10 text-gray-400 border border-white/10">
                      You
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {formatDate(comment.timestamp)}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="bg-black/40 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md relative">
        {!account && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-[2rem] flex items-center justify-center z-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest border border-white/10 px-6 py-3 rounded-full bg-black/80">
              Connect wallet to comment
            </p>
          </div>
        )}
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isAdminView ? "Post an official admin update..." : "Add your comment..."}
          className="w-full bg-transparent text-white placeholder:text-gray-600 outline-none resize-none h-24 mb-4 text-sm"
          disabled={isSubmitting || !account}
        />
        <div className="flex justify-between items-center border-t border-white/10 pt-4">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            {isAdminView ? "Posting as Admin" : "Public Comment"}
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !account || !newMessage.trim()}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isAdminView 
                ? "bg-purple-500 text-white hover:bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]" 
                : "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>
    </div>
  );
};
