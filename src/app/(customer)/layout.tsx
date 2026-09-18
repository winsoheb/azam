"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { MessageSquare, LayoutDashboard, Ticket, Server, Activity, User } from "lucide-react";
import { ChatWidget } from "@/components/chat/ChatWidget";

const customerNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Devices", href: "/devices", icon: Server },
  { title: "AI Support", href: "/chat", icon: MessageSquare },
  { title: "My Tickets", href: "/tickets", icon: Ticket },
  { title: "Profile", href: "/profile", icon: User },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout navItems={customerNavItems} title="Customer Portal">
      {children}
      <ChatWidget />
    </DashboardLayout>
  );
}
