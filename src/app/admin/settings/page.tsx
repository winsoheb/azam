import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-zinc-400 mt-1">Configure global application parameters.</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>AI Engine Configuration</CardTitle>
          <CardDescription>Manage the underlying AI model and constraints.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Input disabled value="Mock AI (Deterministic)" className="bg-zinc-950 border-zinc-800 text-zinc-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Confidence Threshold for Escalation</Label>
              <Input type="number" defaultValue={70} className="bg-zinc-950 border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label>Max Reply Length</Label>
              <Input type="number" defaultValue={500} className="bg-zinc-950 border-zinc-800" />
            </div>
          </div>

          <Button className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
        </CardContent>
      </Card>
      
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Support Settings</CardTitle>
          <CardDescription>Configure ticket routing and SLA parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Auto-Close Inactive Tickets (Days)</Label>
            <Input type="number" defaultValue={7} className="bg-zinc-950 border-zinc-800" />
          </div>
          
          <Button className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
