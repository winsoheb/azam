import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Activity, Thermometer, Battery, Wifi, Droplets, Zap, Navigation } from "lucide-react";
import Link from "next/link";
import { DeviceType, DeviceStatus } from "@prisma/client";

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

function getStatusBadge(status: DeviceStatus) {
  switch (status) {
    case "ONLINE": return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">ONLINE</Badge>;
    case "OFFLINE": return <Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700">OFFLINE</Badge>;
    case "WARNING": return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">WARNING</Badge>;
    case "CRITICAL": return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 animate-pulse">CRITICAL</Badge>;
    case "MAINTENANCE": return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">MAINTENANCE</Badge>;
  }
}

function getHealthBar(score: number) {
  let color = "bg-emerald-500";
  if (score < 80) color = "bg-amber-500";
  if (score < 50) color = "bg-red-500";
  
  return (
    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-1.5">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${score}%` }}></div>
    </div>
  );
}

export default async function DevicesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const devices = await prisma.device.findMany({
    where: { userId: session.user.id },
    include: {
      telemetry: {
        orderBy: { timestamp: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Devices</h1>
        <p className="text-zinc-400 mt-1">Manage and monitor your NexaIoT device fleet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map((device) => {
          const Icon = getDeviceIcon(device.type);
          const latestTelemetry: any = device.telemetry[0]?.payload || {};

          return (
            <Link key={device.id} href={`/devices/${device.id}`}>
              <Card className="bg-zinc-900/50 border-zinc-800/80 backdrop-blur-xl hover:border-indigo-500/50 transition-all cursor-pointer h-full flex flex-col group overflow-hidden relative">
                
                {/* Status Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 ${
                  device.status === 'ONLINE' ? 'bg-emerald-500' :
                  device.status === 'WARNING' ? 'bg-amber-500' :
                  device.status === 'CRITICAL' ? 'bg-red-500' : 'bg-zinc-500'
                }`}></div>

                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/50 group-hover:border-indigo-500/30 transition-colors">
                        <Icon className="w-5 h-5 text-zinc-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-100">{device.name}</h3>
                        <p className="text-xs text-zinc-500 font-mono">{device.deviceId}</p>
                      </div>
                    </div>
                    {getStatusBadge(device.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-6 flex-1">
                    {/* Dynamic Telemetry Display */}
                    {latestTelemetry.temperature !== undefined && (
                      <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Temperature</span>
                        <div className="text-lg font-bold text-zinc-200">{latestTelemetry.temperature}°C</div>
                      </div>
                    )}
                    {latestTelemetry.humidity !== undefined && (
                      <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Humidity</span>
                        <div className="text-lg font-bold text-zinc-200">{latestTelemetry.humidity}%</div>
                      </div>
                    )}
                    {latestTelemetry.voltage !== undefined && (
                      <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Voltage</span>
                        <div className="text-lg font-bold text-zinc-200">{latestTelemetry.voltage}V</div>
                      </div>
                    )}
                    {latestTelemetry.pm25 !== undefined && (
                      <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">PM2.5</span>
                        <div className="text-lg font-bold text-zinc-200">{latestTelemetry.pm25} µg/m³</div>
                      </div>
                    )}
                    {device.battery !== null && (
                      <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold flex items-center gap-1"><Battery className="w-3 h-3"/> Battery</span>
                        <div className={`text-lg font-bold ${device.battery < 20 ? 'text-red-400' : 'text-zinc-200'}`}>{device.battery}%</div>
                      </div>
                    )}
                    {device.signal !== null && (
                      <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold flex items-center gap-1"><Wifi className="w-3 h-3"/> Signal</span>
                        <div className="text-lg font-bold text-zinc-200">{device.signal} dBm</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-zinc-800/50">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-semibold text-zinc-400">Device Health</span>
                      <span className={`text-xs font-bold ${device.healthScore < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>{device.healthScore}%</span>
                    </div>
                    {getHealthBar(device.healthScore)}
                    <div className="text-[10px] text-zinc-500 mt-2 text-right">
                      Updated {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {devices.length === 0 && (
        <div className="p-12 text-center text-zinc-500 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
          <Server className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
          <p>No IoT devices registered to your account.</p>
        </div>
      )}
    </div>
  );
}
