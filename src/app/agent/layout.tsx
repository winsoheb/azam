"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { LayoutDashboard, Inbox, MessageSquare, Ticket, Users, Book } from "lucide-react";

const agentNavItems = [
  { title: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
  { title: "Inbox", href: "/agent/inbox", icon: Inbox },
  { title: "Conversations", href: "/agent/conversations", icon: MessageSquare },
  { title: "Tickets", href: "/agent/tickets", icon: Ticket },
  { title: "Customers", href: "/agent/customers", icon: Users },
  { title: "Knowledge Base", href: "/agent/knowledge", icon: Book },
];

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout navItems={agentNavItems} title="Agent Workspace">
      {children}
    </DashboardLayout>
  );
}
