import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bot, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AgentConversationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
    return null;
  }

  const conversations = await prisma.conversation.findMany({
    include: {
      user: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      aiActions: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Conversations</h1>
        <p className="text-zinc-400 mt-1">Live overview of AI customer interactions.</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800/50">
            {conversations.map(conv => (
              <div key={conv.id} className="p-4 hover:bg-zinc-800/30 transition-colors flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{conv.user.name}</span>
                      <Badge variant="outline" className="bg-zinc-800/50 text-[10px] px-1.5 py-0 h-4">
                        {conv.status}
                      </Badge>
                      {conv.status === 'ESCALATED' && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-1 max-w-xl">
                      {conv.messages[0]?.content || "No messages yet."}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <div className="text-xs text-zinc-500">
                    {new Date(conv.updatedAt).toLocaleTimeString()}
                  </div>
                  {conv.aiActions[0] && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800">
                      <Bot className="w-3 h-3 text-indigo-400" />
                      Intent: {conv.aiActions[0].intent} ({conv.aiActions[0].confidence}%)
                    </div>
                  )}
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="p-8 text-center text-zinc-500">
                No active conversations found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
