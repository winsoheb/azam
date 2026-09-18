import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { UserCog, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminAgentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") return null;

  const agents = await prisma.user.findMany({
    where: { role: { in: ["AGENT", "ADMIN"] } },
    include: {
      _count: {
        select: { assignedTickets: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents & Staff</h1>
          <p className="text-zinc-400 mt-1">Manage support team members.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Add Agent</Button>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/80 border-b border-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium text-center">Assigned Tickets</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <UserCog className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <span className="font-medium text-zinc-200 block">{agent.name}</span>
                          <span className="text-xs text-zinc-500">{agent.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={agent.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-zinc-800/50 text-zinc-300'}>
                        {agent.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-300">
                      {agent._count.assignedTickets}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Active
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
