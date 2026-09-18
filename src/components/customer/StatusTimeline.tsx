import { CheckCircle2, Clock, Package, Truck, Home, XCircle } from "lucide-react";
import { OrderStatus } from "@prisma/client";

interface StatusTimelineProps {
  status: OrderStatus;
  createdAt: Date;
  expectedDelivery: Date | null;
}

const STEPS = [
  { id: "PENDING", label: "Order Placed", icon: Clock },
  { id: "PROCESSING", label: "Processing", icon: Package },
  { id: "SHIPPED", label: "Shipped", icon: Truck },
  { id: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { id: "DELIVERED", label: "Delivered", icon: Home },
];

export function StatusTimeline({ status, createdAt, expectedDelivery }: StatusTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center justify-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
        <XCircle className="w-8 h-8 text-red-500 mr-3" />
        <div>
          <h4 className="text-red-500 font-semibold text-lg">Order Cancelled</h4>
          <p className="text-red-400/80 text-sm">This order has been cancelled and cannot be tracked.</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === status);
  
  // Calculate mock dates for previous steps based on createdAt to make it look realistic
  const baseDate = new Date(createdAt).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  
  const getStepDate = (index: number) => {
    if (index > currentStepIndex) return null;
    if (index === 0) return new Date(baseDate).toLocaleDateString();
    
    // Add 1-2 days per step
    const date = new Date(baseDate + (index * dayMs * 1.5));
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full py-8 px-4">
      <div className="relative flex justify-between items-start max-w-4xl mx-auto">
        {/* Progress Bar Background */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-zinc-800 -z-10 rounded-full"></div>
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-5 left-8 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-1000 ease-in-out"
          style={{ width: `calc(${Math.max(0, currentStepIndex)} * (100% / ${STEPS.length - 1}))` }}
        ></div>

        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          const StepIcon = isCompleted ? CheckCircle2 : step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center w-24 relative">
              {/* Step Circle */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors duration-500 ${
                  isCompleted ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" : 
                  isActive ? "bg-indigo-500 text-white ring-4 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.6)]" : 
                  "bg-zinc-800 text-zinc-500 border-2 border-zinc-700"
                }`}
              >
                <StepIcon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
              </div>
              
              {/* Step Label */}
              <div className="text-center">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                  isActive || isCompleted ? "text-zinc-200" : "text-zinc-600"
                }`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {getStepDate(index) || "--/--/----"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {expectedDelivery && status !== "DELIVERED" && status !== "CANCELLED" && (
        <div className="mt-8 text-center bg-indigo-500/10 border border-indigo-500/20 rounded-lg py-3 px-6 inline-block mx-auto flex flex-col">
          <span className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-1">Estimated Delivery</span>
          <span className="text-lg text-indigo-100 font-bold">{new Date(expectedDelivery).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      )}
    </div>
  );
}
