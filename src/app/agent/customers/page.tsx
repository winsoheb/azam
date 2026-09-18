import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Mail, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AgentCustomersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
    return null;
  }

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      _count: {
        select: { orders: true, tickets: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-zinc-400 mt-1">Directory of all registered customers.</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/80 border-b border-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium text-center">Orders</th>
                  <th className="px-6 py-4 font-medium text-center">Tickets</th>
                  <th className="px-6 py-4 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                          <div className="font-medium text-zinc-200">{customer.name}</div>
                          <div className="text-xs text-zinc-500 font-mono mt-0.5">{customer.customerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-zinc-400 mt-1 text-xs">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          {customer.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-300">
                      {customer._count.orders}
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-300">
                      {customer._count.tickets}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-400">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
