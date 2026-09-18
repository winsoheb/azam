"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";
import { updateTicketStatus } from "@/app/actions/ticket-actions";
import { TicketStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

export function TicketStatusActions({ ticketId, currentStatus }: { ticketId: string, currentStatus: TicketStatus }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  async function handleStatus(status: TicketStatus) {
    setIsUpdating(true);
    await updateTicketStatus(ticketId, status);
    setIsUpdating(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      {currentStatus !== "IN_PROGRESS" && (
        <Button onClick={() => handleStatus("IN_PROGRESS")} disabled={isUpdating} variant="outline" size="sm" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20">
          <Clock className="w-4 h-4 mr-1.5" />
          In Progress
        </Button>
      )}
      
      {currentStatus !== "RESOLVED" && (
        <Button onClick={() => handleStatus("RESOLVED")} disabled={isUpdating} variant="outline" size="sm" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          Resolve
        </Button>
      )}
      
      {currentStatus !== "CLOSED" && (
        <Button onClick={() => handleStatus("CLOSED")} disabled={isUpdating} variant="outline" size="sm" className="bg-zinc-800 hover:bg-zinc-700">
          Close
        </Button>
      )}
    </div>
  );
}
