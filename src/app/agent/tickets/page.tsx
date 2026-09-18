import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket as TicketIcon, Clock, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AgentTicketsListPage() {
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

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Tickets</h1>
          <p className="text-zinc-400 mt-1">List view of all support requests.</p>
        </div>
        <Button asChild variant="outline" className="border-zinc-700 hover:bg-zinc-800">
          <Link href="/agent/inbox">View Kanban Board</Link>
        </Button>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/80 border-b border-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Ticket</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium text-center">Priority</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-200">{ticket.subject}</div>
                      <div className="text-xs text-zinc-500 mt-1 font-mono">#{ticket.id.slice(-6).toUpperCase()} • {new Date(ticket.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {ticket.customer.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className={`text-[10px] uppercase px-1.5 py-0 h-4 ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className="bg-zinc-800/50 text-zinc-300">
                        {ticket.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                        <Link href={`/agent/tickets/${ticket.id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
