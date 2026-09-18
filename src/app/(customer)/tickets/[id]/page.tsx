import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowLeft, Bot } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerTicketReplyForm } from "@/components/customer/TicketReplyForm";

export default async function CustomerTicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { 
      id,
      customerId: session.user.id // Ensure customer can only view their own ticket
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!ticket) return notFound();

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
          <Link href="/tickets">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ticket Details</h1>
          <p className="text-sm text-zinc-400 mt-1">ID: {ticket.id}</p>
        </div>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardHeader className="border-b border-zinc-800/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl">{ticket.subject}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className={
                ticket.status === 'OPEN' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                ticket.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                'bg-zinc-800/50'
              }>
                {ticket.status.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                {ticket.priority} Priority
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Created {new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-1 border border-zinc-700">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-zinc-800/50 border border-zinc-800/80 rounded-tl-sm w-full">
              <div className="text-sm prose prose-invert max-w-none">
                <ReactMarkdown>{ticket.description}</ReactMarkdown>
              </div>
            </div>
          </div>
          
          {ticket.messages && ticket.messages.map(msg => (
            <div key={msg.id} className="flex gap-4 mt-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 border ${msg.isAgent ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-zinc-800 border-zinc-700'}`}>
                {msg.isAgent ? <Bot className="w-4 h-4 text-indigo-400" /> : <User className="w-4 h-4 text-zinc-400" />}
              </div>
              <div className={`px-5 py-4 rounded-2xl border rounded-tl-sm w-full ${msg.isAgent ? 'bg-indigo-900/10 border-indigo-500/20' : 'bg-zinc-800/50 border-zinc-800/80'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{msg.isAgent ? 'Support Agent' : 'You'}</span>
                  <span className="text-xs text-zinc-600">• {new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-sm prose prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-8 text-center text-sm text-zinc-500 italic border-t border-zinc-800/50 pt-8 mb-8">
            <p>Our support team is reviewing your request.</p>
            <p className="mt-1">We will reach out to you via email once there is an update.</p>
          </div>
          
          <CustomerTicketReplyForm ticketId={ticket.id} />
        </CardContent>
      </Card>
    </div>
  );
}
