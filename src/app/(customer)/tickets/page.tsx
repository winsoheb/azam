import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket as TicketIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function TicketsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const tickets = await prisma.ticket.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
          <p className="text-zinc-400 mt-1">View and manage your support requests.</p>
        </div>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardContent className="p-0">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <TicketIcon className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p>You have no support tickets.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {tickets.map(ticket => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block group">
                  <div className="p-6 group-hover:bg-zinc-800/50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium group-hover:text-indigo-400 transition-colors">{ticket.subject}</h3>
                        <p className="text-sm text-zinc-400 mt-1 line-clamp-2 pr-4">{ticket.description}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                          <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>ID: {ticket.id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={
                            ticket.status === 'OPEN' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                            ticket.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            'bg-zinc-800/50'
                          }>
                            {ticket.status.replace(/_/g, ' ')}
                          </Badge>
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                            {ticket.priority}
                          </Badge>
                        </div>
                        <div className="hidden sm:flex items-center text-xs text-zinc-500 group-hover:text-indigo-400 transition-colors mt-auto font-medium">
                          View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
