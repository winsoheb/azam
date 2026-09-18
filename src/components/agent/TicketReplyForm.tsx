"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot } from "lucide-react";
import { sendTicketReply } from "@/app/actions/ticket-actions";
import { useRouter } from "next/navigation";

export function TicketReplyForm({ ticketId, suggestedReply }: { ticketId: string, suggestedReply: string }) {
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  async function handleSend() {
    if (!reply.trim()) return;
    setIsSending(true);
    await sendTicketReply(ticketId, reply);
    setReply("");
    setIsSending(false);
    alert("Reply sent to customer successfully! Ticket status updated to Waiting for Customer.");
    router.refresh();
  }

  return (
    <div className="p-4 bg-zinc-950/80 border-t border-zinc-800/50">
      <div className="mb-3 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg relative group">
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="secondary" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setReply(suggestedReply)}>
            Use Reply
          </Button>
        </div>
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          <Bot className="w-3.5 h-3.5" /> AI Suggested Reply
        </div>
        <p className="text-sm text-zinc-300 whitespace-pre-wrap">{suggestedReply}</p>
      </div>
      
      <div className="flex gap-2">
        <Textarea 
          placeholder="Type your reply here..." 
          className="min-h-[80px] bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500 resize-none"
          value={reply}
          onChange={e => setReply(e.target.value)}
        />
        <Button className="h-auto bg-indigo-600 hover:bg-indigo-700 px-6" onClick={handleSend} disabled={isSending || !reply.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
