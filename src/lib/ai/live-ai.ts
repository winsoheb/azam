import { prisma } from "@/lib/prisma";
import { AIResponse } from "./mock-ai";

export async function processLiveAIRequest(message: string, user: any): Promise<AIResponse> {
  const [devices, tickets, knowledgeChunks] = await Promise.all([
    prisma.device.findMany({ 
      where: { userId: user.id },
      include: { telemetry: { orderBy: { timestamp: "desc" }, take: 1 } }
    }),
    prisma.ticket.findMany({ where: { customerId: user.id }, take: 3 }),
    prisma.knowledgeChunk.findMany({ include: { document: true } })
  ]);
  
  const systemPrompt = `You are Nexa, an advanced IoT Diagnostic Copilot for NexaSupport.
Your job is to analyze the customer's message, classify their intent, determine sentiment and confidence, and formulate a helpful response.
You have access to the user's IoT fleet telemetry. Use it to diagnose problems.
If the confidence is below 70%, or the user is ANGRY, or they explicitly ask for a human/escalation, you MUST set requires_human to true.

You MUST respond ONLY with a valid JSON object matching this exact structure:
{
  "intent": "string (e.g., DIAGNOSTICS, STATUS_CHECK, TROUBLESHOOTING, COMPLAINT, etc.)",
  "sentiment": "string (one of: POSITIVE, NEUTRAL, CONCERNED, ANGRY, CONFUSED)",
  "confidence": number (0-100),
  "priority": "string (one of: LOW, MEDIUM, HIGH, URGENT)",
  "response": "string (The text response to send to the customer)",
  "requires_human": boolean,
  "toolsUsed": ["string"],
  "knowledgeSources": ["string"]
}

Customer Name: ${user.name}

Context - IoT Devices:
${JSON.stringify(devices.map(d => ({ 
  id: d.deviceId, 
  name: d.name, 
  status: d.status, 
  health: d.healthScore, 
  telemetry: d.telemetry[0]?.payload 
})))}

Context - Open Tickets:
${JSON.stringify(tickets.map(t => ({ id: t.id, status: t.status, subject: t.subject })))}

Context - Knowledge Base (Manuals & Troubleshooting):
${knowledgeChunks.map(c => `[Source: ${c.document.title}]\n${c.content}`).join('\n\n')}
`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 350
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI API Error:", res.status, err);
      throw new Error("OpenAI API failed");
    }

    const data = await res.json();
    
    // Extract JSON from potential markdown
    let rawContent = data.choices[0].message.content;
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      rawContent = jsonMatch[1];
    }
    
    const object = JSON.parse(rawContent.trim());
    return object as AIResponse;
  } catch (error) {
    console.error("Live AI Error:", error);
    return {
      intent: "SYSTEM_ERROR",
      sentiment: "NEUTRAL",
      confidence: 0,
      priority: "HIGH",
      response: "I'm currently experiencing connectivity issues with my diagnostic core. Let me connect you with a human engineer.",
      requires_human: true,
      toolsUsed: [],
      knowledgeSources: []
    };
  }
}
