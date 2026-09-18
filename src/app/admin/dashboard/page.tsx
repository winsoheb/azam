"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Server, Database, BrainCircuit, Activity, Cpu, CheckCircle2, ShieldAlert } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Mon', total: 120, resolved: 105, escalated: 15 },
  { name: 'Tue', total: 150, resolved: 130, escalated: 20 },
  { name: 'Wed', total: 180, resolved: 165, escalated: 15 },
  { name: 'Thu', total: 140, resolved: 120, escalated: 20 },
  { name: 'Fri', total: 200, resolved: 175, escalated: 25 },
  { name: 'Sat', total: 90, resolved: 85, escalated: 5 },
  { name: 'Sun', total: 110, resolved: 95, escalated: 15 },
];

export default function AdminDashboard() {
  const { data: session } = useSession();
  const isMockMode = true; // Hardcoded for demo UI

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health & Analytics</h1>
        <p className="text-zinc-400 mt-1">Overview of application performance and support metrics.</p>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Application</CardTitle>
            <Server className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> All services operational
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Database</CardTitle>
            <Database className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Connected</div>
            <p className="text-xs text-zinc-500 mt-1">Latency: 12ms</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">AI Mode</CardTitle>
            <BrainCircuit className={isMockMode ? "w-4 h-4 text-amber-400" : "w-4 h-4 text-emerald-400"} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isMockMode ? "Demo Mode" : "Live AI"}</div>
            <p className="text-xs text-zinc-500 mt-1">Using local deterministic AI</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Resource Usage</CardTitle>
            <Cpu className="w-4 h-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Low</div>
            <p className="text-xs text-zinc-500 mt-1">Memory: 45MB / CPU: 2%</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Conversation Volume</CardTitle>
            <CardDescription>Total conversations over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>AI Resolution vs Human Escalation</CardTitle>
            <CardDescription>Performance of AI support agent</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="resolved" name="AI Resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="escalated" name="Human Escalated" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-white mb-2">87.4%</div>
            <div className="text-sm text-emerald-400 font-medium">AI Resolution Rate</div>
            <div className="text-xs text-zinc-500 mt-2">+2.4% from last week</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-white mb-2">1.8 sec</div>
            <div className="text-sm text-indigo-400 font-medium">Avg Response Time</div>
            <div className="text-xs text-zinc-500 mt-2">-0.2s from last week</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-white mb-2">94.2%</div>
            <div className="text-sm text-emerald-400 font-medium">RAG Success Rate</div>
            <div className="text-xs text-zinc-500 mt-2">Knowledge retrieval accuracy</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
