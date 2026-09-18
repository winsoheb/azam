import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Bot, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminAILogsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") return null;

  const logs = await prisma.aIAction.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Action Logs</h1>
        <p className="text-zinc-400 mt-1">Audit trail of automated AI decisions and actions.</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/80 border-b border-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Intent Detected</th>
                  <th className="px-6 py-4 font-medium text-center">Confidence</th>
                  <th className="px-6 py-4 font-medium">Tools Used</th>
                  <th className="px-6 py-4 font-medium text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-indigo-400" />
                        <span className="font-medium text-zinc-200">{log.intent}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={log.confidence >= 90 ? "text-emerald-400" : log.confidence >= 70 ? "text-amber-400" : "text-red-400"}>
                        {log.confidence}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {log.toolsUsed.map((tool, i) => (
                          <Badge key={i} variant="outline" className="bg-zinc-800/50 text-[10px] px-1.5 py-0">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="outline" className={log.result === 'Escalated' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}>
                        {log.result === 'Escalated' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {log.result}
                      </Badge>
                    </td>
                  </tr>
                ))}
                
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      No AI logs found.
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
