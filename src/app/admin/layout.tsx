"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { LayoutDashboard, Users, UserCog, Ticket, Book, LineChart, Activity, Settings } from "lucide-react";

const adminNavItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Agents", href: "/admin/agents", icon: UserCog },
  { title: "Tickets", href: "/admin/tickets", icon: Ticket },
  { title: "Knowledge Base", href: "/admin/knowledge", icon: Book },
  { title: "Analytics", href: "/admin/analytics", icon: LineChart },
  { title: "AI Logs", href: "/admin/ai-logs", icon: Activity },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout navItems={adminNavItems} title="System Administration">
      {children}
    </DashboardLayout>
  );
}
