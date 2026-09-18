"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { customerSendTicketReply } from "@/app/actions/ticket-actions";
import { useRouter } from "next/navigation";

export function CustomerTicketReplyForm({ ticketId }: { ticketId: string }) {
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  async function handleSend() {
    if (!reply.trim()) return;
    setIsSending(true);
    await customerSendTicketReply(ticketId, reply);
    setReply("");
    setIsSending(false);
    alert("Reply sent to support successfully!");
    router.refresh();
  }

  return (
    <div className="pt-6 border-t border-zinc-800/50 mt-8">
      <h3 className="text-sm font-medium mb-3">Add a Reply</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <Textarea 
          placeholder="Type your reply or additional information here..." 
          className="min-h-[80px] bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500 resize-none flex-1"
          value={reply}
          onChange={e => setReply(e.target.value)}
        />
        <Button className="h-auto bg-indigo-600 hover:bg-indigo-700 px-6 sm:w-auto w-full" onClick={handleSend} disabled={isSending || !reply.trim()}>
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
}
