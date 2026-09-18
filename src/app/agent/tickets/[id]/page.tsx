import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Activity, Clock, Bot, Send, CheckCircle2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { TicketReplyForm } from "@/components/agent/TicketReplyForm";
import { TicketStatusActions } from "@/components/agent/TicketStatusActions";

export default async function AgentTicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
    return null;
  }

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      customer: {
        include: { 
          orders: true, 
          tickets: { select: { id: true, status: true } },
          devices: {
            include: {
              telemetry: {
                orderBy: { timestamp: "desc" },
                take: 1
              }
            }
          }
        }
      },
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!ticket) return notFound();

  // For demo, if there's no aiSummary but it's an escalated ticket, we assume the description has the context.
  // We'll generate a mock "Suggested Reply"
  const suggestedReply = `Hi ${ticket.customer.name?.split(' ')[0]},\n\nI understand you are experiencing issues regarding: ${ticket.subject}. I have reviewed your account and recent interactions. Our team is currently investigating this priority ${ticket.priority} issue.\n\nCould you please provide a bit more context if possible? I will ensure this gets resolved as quickly as possible.`;

  return (
    <div className="p-6 lg:p-8 h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-6 overflow-hidden">
      
      {/* Middle: Conversation / Ticket Details */}
      <div className="flex-1 flex flex-col h-full bg-zinc-900/30 rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-start bg-zinc-900/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold">{ticket.subject}</h2>
              <Badge variant="outline" className="bg-zinc-800">{ticket.status}</Badge>
              <Badge variant="outline" className="bg-zinc-800 text-amber-400 border-amber-400/20">{ticket.priority}</Badge>
            </div>
            <p className="text-sm text-zinc-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 
              Created {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
          <TicketStatusActions ticketId={ticket.id} currentStatus={ticket.status} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Original Request */}
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-1">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-zinc-800/50 border border-zinc-800 rounded-tl-sm">
              <div className="text-sm prose prose-invert max-w-none">
                <ReactMarkdown>{ticket.description}</ReactMarkdown>
              </div>
            </div>
          </div>

          {ticket.messages && ticket.messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.isAgent ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.isAgent ? 'bg-indigo-500/20' : 'bg-zinc-800'}`}>
                {msg.isAgent ? <Bot className="w-4 h-4 text-indigo-400" /> : <User className="w-4 h-4 text-zinc-400" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl border ${msg.isAgent ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-sm' : 'bg-zinc-800/50 border-zinc-800 rounded-tl-sm'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${msg.isAgent ? 'text-indigo-200' : 'text-zinc-500'}`}>{msg.isAgent ? 'You' : ticket.customer.name}</span>
                  <span className={`text-[10px] ${msg.isAgent ? 'text-indigo-300' : 'text-zinc-600'}`}>• {new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className={`text-sm prose prose-invert max-w-none ${msg.isAgent ? 'prose-p:text-white prose-a:text-indigo-200' : ''}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Box */}
        <TicketReplyForm ticketId={ticket.id} suggestedReply={suggestedReply} />
      </div>

      {/* Right: Context Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto">
        <Card className="bg-zinc-900/30 border-zinc-800/50 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-zinc-500">Customer Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium">{ticket.customer.name}</div>
              <div className="text-sm text-zinc-400">{ticket.customer.email}</div>
              <div className="text-xs text-zinc-500 mt-1 font-mono">{ticket.customer.customerId}</div>
            </div>
            
            <div className="pt-4 border-t border-zinc-800/50">
              <div className="text-xs text-zinc-500 mb-2">History</div>
              <div className="flex justify-between text-sm">
                <span>Total Orders</span>
                <span className="font-medium">{ticket.customer.orders.length}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Total Tickets</span>
                <span className="font-medium">{ticket.customer.tickets.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/30 border-zinc-800/50 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Activity className="w-4 h-4" /> AI Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-zinc-500 mb-1">AI Summary</div>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950 p-2 rounded-md border border-zinc-800/50">
                {ticket.aiSummary || "No AI summary available for this ticket."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Sentiment</div>
                <div className={`text-sm font-medium ${ticket.sentiment === 'ANGRY' ? 'text-red-400' : 'text-zinc-300'}`}>
                  {ticket.sentiment || "Unknown"}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Confidence</div>
                <div className="text-sm font-medium text-amber-400">
                  {ticket.aiConfidence ? `${ticket.aiConfidence}%` : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {ticket.customer.devices && ticket.customer.devices.length > 0 && (
          <Card className="bg-zinc-900/30 border-zinc-800/50 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Telemetry Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.customer.devices.map(device => (
                <div key={device.id} className="pt-3 first:pt-0 border-t first:border-0 border-zinc-800/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{device.name}</span>
                    <Badge variant="outline" className={device.status === 'CRITICAL' ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10'}>
                      {device.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-zinc-500 mb-2">ID: {device.deviceId}</div>
                  
                  {device.telemetry && device.telemetry.length > 0 ? (
                    <div className="bg-zinc-950 p-2 rounded-md border border-zinc-800/50">
                      <pre className="text-[10px] text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono">
                        {JSON.stringify(device.telemetry[0].payload, null, 2)}
                      </pre>
                      <div className="text-[9px] text-zinc-500 mt-2 text-right border-t border-zinc-800/50 pt-1">
                        {new Date(device.telemetry[0].timestamp).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 italic">No telemetry data available.</div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
