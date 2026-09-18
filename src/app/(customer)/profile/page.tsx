import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Mail, Shield, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-zinc-400 mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-zinc-400 mb-4">{user.email}</p>
              <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                {user.role}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> Full Name
                  </div>
                  <div className="font-medium text-sm p-2 bg-zinc-950 rounded-md border border-zinc-800">{user.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email Address
                  </div>
                  <div className="font-medium text-sm p-2 bg-zinc-950 rounded-md border border-zinc-800">{user.email}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Role
                  </div>
                  <div className="font-medium text-sm p-2 bg-zinc-950 rounded-md border border-zinc-800 capitalize">{user.role.toLowerCase()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    <Building className="w-3 h-3" /> Account ID
                  </div>
                  <div className="font-medium text-sm p-2 bg-zinc-950 rounded-md border border-zinc-800 font-mono text-zinc-400 truncate">{user.id}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
