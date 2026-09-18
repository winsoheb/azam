import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the most recent conversation
    const conversation = await prisma.conversation.findFirst({
      where: { 
        userId: session.user.id,
        // we can optionally filter by status: "ACTIVE" if we want to ignore resolved/escalated ones,
        // but for simplicity, let's just get the most recent one.
      },
      orderBy: { createdAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ conversation: null });
    }

    return NextResponse.json({ conversation });

  } catch (error) {
    console.error("[CHAT_HISTORY_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
