import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TelemetryChart } from "@/components/customer/TelemetryChart";
import { ArrowLeft, Server, Activity, Thermometer, Battery, Wifi, Droplets, Zap, Navigation, AlertTriangle, RefreshCw, MessageSquare } from "lucide-react";
import Link from "next/link";
import { DeviceType } from "@prisma/client";

function getDeviceIcon(type: DeviceType) {
  switch (type) {
    case "SENSOR_TEMP_HUMIDITY": return Thermometer;
    case "SENSOR_DOOR": return Server;
    case "SENSOR_AIR_QUALITY": return Activity;
    case "METER_ENERGY": return Zap;
    case "SENSOR_WATER": return Droplets;
    case "TRACKER_GPS": return Navigation;
    default: return Server;
  }
}

// Generate mock telemetry history based on the latest value
function generateMockHistory(baseValue: number, variance: number, points: number) {
  const data = [];
  let current = baseValue;
  const now = Date.now();
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now - i * 5 * 60000); // every 5 mins
    // Random walk
    current = current + (Math.random() * variance * 2 - variance);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat(current.toFixed(1))
    });
  }
  // Ensure the last point matches the actual current value
  data[data.length - 1].value = baseValue;
  return data;
}

export default async function DeviceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const { id } = await params;

  const device = await prisma.device.findUnique({
    where: { id, userId: session.user.id },
    include: {
      telemetry: { orderBy: { timestamp: "desc" }, take: 1 },
      alerts: { orderBy: { createdAt: "desc" }, take: 3 }
    }
  });

  if (!device) return notFound();

  const Icon = getDeviceIcon(device.type);
  const latestTelemetry: any = device.telemetry[0]?.payload || {};
  
  // Generate charts for available metrics
  const charts = [];
  if (latestTelemetry.temperature !== undefined) {
    charts.push({ title: "Temperature (°C)", data: generateMockHistory(latestTelemetry.temperature, 0.5, 24), color: "#f43f5e" });
  }
  if (latestTelemetry.humidity !== undefined) {
    charts.push({ title: "Humidity (%)", data: generateMockHistory(latestTelemetry.humidity, 1, 24), color: "#0ea5e9" });
  }
  if (latestTelemetry.voltage !== undefined) {
    charts.push({ title: "Voltage (V)", data: generateMockHistory(latestTelemetry.voltage, 2, 24), color: "#eab308" });
  }
  if (latestTelemetry.pm25 !== undefined) {
    charts.push({ title: "PM2.5 (µg/m³)", data: generateMockHistory(latestTelemetry.pm25, 2, 24), color: "#a855f7" });
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <Link href="/devices" className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Devices
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 ${
          device.status === 'ONLINE' ? 'bg-emerald-500' :
          device.status === 'WARNING' ? 'bg-amber-500' :
          device.status === 'CRITICAL' ? 'bg-red-500' : 'bg-zinc-500'
        }`}></div>

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-zinc-950 flex items-center justify-center shrink-0 border border-zinc-800 shadow-inner">
            <Icon className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">{device.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded">{device.deviceId}</span>
              <Badge variant="outline" className={
                device.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                device.status === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' :
                device.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-zinc-800/50 text-zinc-400 border-zinc-700'
              }>
                {device.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <MessageSquare className="w-4 h-4 mr-2" /> Ask AI
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics & Health */}
        <div className="space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400 uppercase tracking-wider">Device Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mb-2">
                <span className="text-4xl font-bold text-zinc-100">{device.healthScore}<span className="text-2xl text-zinc-500">%</span></span>
                <span className={`text-sm font-medium ${device.healthScore < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {device.healthScore >= 90 ? 'Optimal' : device.healthScore >= 70 ? 'Fair' : 'Critical'}
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 mb-6">
                <div className={`h-2 rounded-full ${device.healthScore < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${device.healthScore}%` }}></div>
              </div>

              <div className="space-y-4">
                {device.battery !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400 flex items-center gap-2"><Battery className="w-4 h-4"/> Battery Level</span>
                    <span className={`font-semibold ${device.battery < 20 ? 'text-red-400' : 'text-zinc-200'}`}>{device.battery}%</span>
                  </div>
                )}
                {device.signal !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400 flex items-center gap-2"><Wifi className="w-4 h-4"/> Signal Strength</span>
                    <span className="font-semibold text-zinc-200">{device.signal} dBm</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Firmware</span>
                  <span className="font-semibold text-zinc-200 font-mono text-sm">{device.firmwareVersion}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Last Seen</span>
                  <span className="font-semibold text-zinc-200 text-sm">{device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {device.alerts.length === 0 ? (
                <p className="text-sm text-zinc-500">No active alerts for this device.</p>
              ) : (
                <div className="space-y-4">
                  {device.alerts.map((alert) => (
                    <div key={alert.id} className="border-l-2 border-amber-500 pl-3">
                      <p className="text-sm font-medium text-zinc-200">{alert.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{alert.message}</p>
                      <p className="text-[10px] text-zinc-600 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Telemetry Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {charts.map((chart, idx) => (
              <Card key={idx} className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-medium text-zinc-300">{chart.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <TelemetryChart data={chart.data} dataKey="value" color={chart.color} />
                </CardContent>
              </Card>
            ))}
            {charts.length === 0 && (
              <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl col-span-2">
                <CardContent className="p-12 text-center text-zinc-500">
                  <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>No historical telemetry available for this device type.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
