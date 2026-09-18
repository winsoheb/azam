"use server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TicketStatus } from "@prisma/client";

export async function sendTicketReply(ticketId: string, reply: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.ticketMessage.create({
    data: {
      ticketId,
      userId: session.user.id,
      content: reply,
      isAgent: true
    }
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "WAITING_FOR_CUSTOMER" }
  });
  
  revalidatePath(`/agent/tickets/${ticketId}`);
  return { success: true };
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status }
  });
  
  revalidatePath(`/agent/tickets/${ticketId}`);
  revalidatePath(`/agent/inbox`);
  return { success: true };
}

export async function customerSendTicketReply(ticketId: string, reply: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.ticketMessage.create({
    data: {
      ticketId,
      userId: session.user.id,
      content: reply,
      isAgent: false
    }
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "WAITING_FOR_AGENT" }
  });
  
  revalidatePath(`/tickets/${ticketId}`);
  return { success: true };
}
