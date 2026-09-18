import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Receipt } from "lucide-react";
import { StatusTimeline } from "@/components/customer/StatusTimeline";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-zinc-400 mt-1">Track your recent purchases and shipments.</p>
        </div>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p>You have no recent orders.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="p-6 bg-zinc-900/50 border border-zinc-800/80 rounded-xl hover:border-indigo-500/30 transition-all group overflow-hidden relative">
                  {/* Decorative background glow for delivered/active orders */}
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/4 ${
                    order.status === 'DELIVERED' ? 'from-emerald-500 to-transparent' : 'from-indigo-500 to-transparent'
                  }`}></div>

                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {/* Product Image Placeholder */}
                    <div className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:border-indigo-500/30 transition-colors">
                      <Package className="w-10 h-10 text-zinc-600" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-zinc-100">{order.product.name}</h3>
                          <div className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            Order <span className="font-mono text-zinc-300">#{order.orderNumber}</span>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-zinc-100 tracking-tight">
                          ₹{order.amount.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-4">
                        <Badge variant="outline" className="bg-zinc-800/80 text-zinc-300 border-zinc-700/50">
                          Purchased: {new Date(order.createdAt).toLocaleDateString()}
                        </Badge>
                        <Badge variant="outline" className="bg-zinc-800/80 text-zinc-300 border-zinc-700/50">
                          Payment: <span className="text-emerald-400 ml-1">{order.paymentStatus}</span>
                        </Badge>
                        {order.cancellationEligible && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                            Cancellation Eligible
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tracking Timeline Section */}
                  <div className="mt-6 pt-6 border-t border-zinc-800/60 bg-zinc-950/30 -mx-6 -mb-6 px-6 pb-6">
                    <StatusTimeline 
                      status={order.status} 
                      createdAt={order.createdAt} 
                      expectedDelivery={order.expectedDelivery} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
