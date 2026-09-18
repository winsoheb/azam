import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function AgentInbox() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
    return null;
  }

  const tickets = await prisma.ticket.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "HIGH": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "MEDIUM": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default: return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  const columns = [
    { id: "OPEN", title: "New", icon: AlertCircle, color: "text-amber-400" },
    { id: "IN_PROGRESS", title: "In Progress", icon: Clock, color: "text-indigo-400" },
    { id: "WAITING_FOR_CUSTOMER", title: "Waiting", icon: Clock, color: "text-orange-400" },
    { id: "RESOLVED", title: "Resolved", icon: CheckCircle2, color: "text-emerald-400" },
  ];

  return (
    <div className="p-6 lg:p-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Ticket Inbox</h1>
        <p className="text-zinc-400 mt-1">Manage and resolve customer requests.</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
        {columns.map((col) => {
          const colTickets = tickets.filter(t => t.status === col.id);
          
          return (
            <div key={col.id} className="flex-none w-80 flex flex-col bg-zinc-900/30 rounded-xl border border-zinc-800/50 overflow-hidden">
              <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <col.icon className={`w-4 h-4 ${col.color}`} />
                  <h3 className="font-semibold">{col.title}</h3>
                </div>
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                  {colTickets.length}
                </Badge>
              </div>
              
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {colTickets.map(ticket => (
                    <Link href={`/agent/tickets/${ticket.id}`} key={ticket.id}>
                      <Card className="bg-zinc-900/80 border-zinc-700/50 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs text-zinc-500 font-mono">#{ticket.id.slice(-6).toUpperCase()}</span>
                            <Badge variant="outline" className={`text-[10px] uppercase px-1.5 py-0 h-4 ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-sm font-medium leading-snug group-hover:text-indigo-300 transition-colors">
                            {ticket.subject}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span className="truncate max-w-[120px]">{ticket.customer.name}</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>

                          {ticket.sentiment && (
                            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-800/50">
                              <span className="text-[10px] text-zinc-500">AI Sentiment:</span>
                              <span className={`text-[10px] font-medium ${ticket.sentiment === 'ANGRY' ? 'text-red-400' : 'text-zinc-300'}`}>
                                {ticket.sentiment}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  
                  {colTickets.length === 0 && (
                    <div className="text-center py-8 text-sm text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                      No tickets
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
