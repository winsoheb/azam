import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket, Clock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AgentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
    return null;
  }

  // Fetch some metrics for the dashboard
  const [openTickets, resolvedTickets, recentTickets, iotEscalations] = await Promise.all([
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "RESOLVED" } }),
    prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: true }
    }),
    prisma.deviceAlert.count({ where: { severity: "CRITICAL", resolved: false } })
  ]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Workspace</h1>
        <p className="text-zinc-400 mt-1">Here is your daily overview, {session.user.name}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Open Tickets</CardTitle>
            <Ticket className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
            <p className="text-xs text-zinc-500 mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Resolved</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedTickets}</div>
            <p className="text-xs text-zinc-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Avg Handle Time</CardTitle>
            <Clock className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12m 40s</div>
            <p className="text-xs text-emerald-500 mt-1">-2m from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">IoT Escalations</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{iotEscalations}</div>
            <p className="text-xs text-zinc-500 mt-1">Critical unresolved alerts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Queue</CardTitle>
              <CardDescription>Latest incoming support requests</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
              <Link href="/agent/inbox">Go to Inbox <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{ticket.subject}</span>
                      <Badge variant="outline" className="bg-zinc-800/50 text-[10px] px-1.5 py-0 h-4">{ticket.priority}</Badge>
                    </div>
                    <div className="text-xs text-zinc-500 flex gap-2">
                      <span>{ticket.customer.name}</span>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <Button asChild variant="secondary" size="sm" className="bg-zinc-800 hover:bg-zinc-700 h-7 text-xs">
                    <Link href={`/agent/tickets/${ticket.id}`}>View</Link>
                  </Button>
                </div>
              ))}
              
              {recentTickets.length === 0 && (
                <div className="text-center py-6 text-zinc-500">Queue is empty.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
