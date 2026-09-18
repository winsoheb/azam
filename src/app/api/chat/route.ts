import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { processMockAIRequest } from "@/lib/ai/mock-ai";
import { processLiveAIRequest } from "@/lib/ai/live-ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let currentConversationId = conversationId;

    // Create a new conversation if one isn't provided
    if (!currentConversationId) {
      const conv = await prisma.conversation.create({
        data: {
          userId: session.user.id,
        },
      });
      currentConversationId = conv.id;
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: currentConversationId,
        role: "USER",
        content: message,
      },
    });

    const aiMode = "mock"; // Forcing mock mode since NVIDIA API key is invalid/expired
    let aiResult;

    if (aiMode === "mock") {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));
      aiResult = await processMockAIRequest(message, session.user);
    } else {
      aiResult = await processLiveAIRequest(message, session.user);
    }

    // Save AI response
    await prisma.message.create({
      data: {
        conversationId: currentConversationId,
        role: "ASSISTANT",
        content: aiResult.response,
        toolCalls: aiResult.toolsUsed.length > 0 ? aiResult.toolsUsed : undefined,
      },
    });

    // Log AI Action for audit
    await prisma.aIAction.create({
      data: {
        conversationId: currentConversationId,
        intent: aiResult.intent,
        confidence: aiResult.confidence,
        sentiment: aiResult.sentiment,
        toolsUsed: aiResult.toolsUsed,
        knowledgeUsed: aiResult.knowledgeSources,
        result: aiResult.requires_human ? "Escalated" : "Resolved",
      },
    });

    // Escalate if required
    if (aiResult.requires_human) {
      await prisma.ticket.create({
        data: {
          subject: `Escalated: ${aiResult.intent}`,
          description: `Customer Message: ${message}\nAI Summary: ${aiResult.response}`,
          priority: aiResult.priority as any,
          customerId: session.user.id,
          aiSummary: aiResult.response,
          aiConfidence: aiResult.confidence,
          sentiment: aiResult.sentiment,
        },
      });
      await prisma.conversation.update({
        where: { id: currentConversationId },
        data: { status: "ESCALATED" },
      });
    }

    return NextResponse.json({
      response: aiResult,
      conversationId: currentConversationId
    });

  } catch (error) {
    console.error("[CHAT_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
