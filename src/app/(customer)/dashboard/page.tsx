import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Server, Ticket, ArrowRight, Activity, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const [devices, tickets, alerts] = await Promise.all([
    prisma.device.findMany({
      where: { userId: session.user.id },
      include: {
        telemetry: { orderBy: { timestamp: "desc" }, take: 1 }
      }
    }),
    prisma.ticket.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.deviceAlert.findMany({
      where: { device: { userId: session.user.id }, resolved: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { device: true }
    })
  ]);

  const onlineCount = devices.filter(d => d.status === 'ONLINE').length;
  const offlineCount = devices.filter(d => d.status === 'OFFLINE').length;
  const warningCount = devices.filter(d => d.status === 'WARNING').length;
  const criticalCount = devices.filter(d => d.status === 'CRITICAL').length;
  
  const avgHealth = devices.length > 0 ? Math.round(devices.reduce((acc, d) => acc + d.healthScore, 0) / devices.length) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Overview</h1>
          <p className="text-zinc-400 mt-1">Welcome back, {session.user.name?.split(" ")[0]}. Here is your IoT device status.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">AI Support Online</span>
        </div>
      </div>

      {/* IoT Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl col-span-2 md:col-span-1">
          <CardContent className="p-6 flex flex-col justify-center items-center h-full text-center">
            <span className="text-4xl font-bold text-zinc-100">{devices.length}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Total Devices</span>
          </CardContent>
        </Card>
        
        <Card className="bg-emerald-500/5 border-emerald-500/20 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <span className="text-3xl font-bold text-emerald-400">{onlineCount}</span>
            <span className="text-xs text-emerald-500/70 uppercase tracking-widest mt-2 block">Online</span>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <span className="text-3xl font-bold text-zinc-400">{offlineCount}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-widest mt-2 block">Offline</span>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-500/5 border-amber-500/20 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <span className="text-3xl font-bold text-amber-400">{warningCount}</span>
            <span className="text-xs text-amber-500/70 uppercase tracking-widest mt-2 block">Warning</span>
          </CardContent>
        </Card>
        
        <Card className="bg-red-500/5 border-red-500/20 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <span className="text-3xl font-bold text-red-400">{criticalCount}</span>
            <span className="text-xs text-red-500/70 uppercase tracking-widest mt-2 block">Critical</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl hover:border-indigo-500/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Ask AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 mb-4">Run diagnostics or ask questions about your fleet health.</p>
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Link href="/chat">Start Chat</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl hover:border-indigo-500/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-400" />
              My Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 mb-4">View real-time telemetry and health data for your devices.</p>
            <Button asChild variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800">
              <Link href="/devices">View Devices</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl hover:border-indigo-500/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Overall Fleet Health
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-[90px]">
             <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-zinc-300">System Integrity</span>
                <span className={`text-xl font-bold ${avgHealth < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>{avgHealth}%</span>
             </div>
             <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className={`h-2 rounded-full ${avgHealth < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${avgHealth}%` }}></div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Recent Alerts</CardTitle>
              <CardDescription>Anomalies detected across your fleet</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-6 text-zinc-500">No active alerts.</div>
            ) : (
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-md ${alert.severity === 'CRITICAL' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                        <AlertTriangle className={`w-5 h-5 ${alert.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-zinc-500">{alert.device.name} • {new Date(alert.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline" className={
                        alert.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Open Tickets</CardTitle>
              <CardDescription>Your ongoing support requests</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
              <Link href="/tickets">View all <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-6 text-zinc-500">No open tickets. You're all caught up!</div>
            ) : (
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block group">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50 group-hover:border-indigo-500/50 group-hover:bg-zinc-800/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-500/10 rounded-md group-hover:bg-indigo-500/20 transition-colors">
                          <Ticket className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[200px] group-hover:text-indigo-300 transition-colors">{ticket.subject}</p>
                          <p className="text-xs text-zinc-500">Updated {new Date(ticket.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div>
                        <Badge variant="outline" className={
                          ticket.status === 'OPEN' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-zinc-800/50'
                        }>
                          {ticket.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
