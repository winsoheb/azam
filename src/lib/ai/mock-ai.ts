import { prisma } from "@/lib/prisma";

export interface AIResponse {
  intent: string;
  sentiment: string;
  confidence: number;
  priority: string;
  response: string;
  requires_human: boolean;
  toolsUsed: string[];
  knowledgeSources: string[];
}

export async function processMockAIRequest(message: string, user: any): Promise<AIResponse> {
  const msgLower = message.toLowerCase();
  
  // Simulated tools
  const toolsUsed: string[] = [];
  const knowledgeSources: string[] = [];
  
  let intent = "GENERAL_INQUIRY";
  let sentiment = "NEUTRAL";
  let confidence = 85;
  let response = "I'm Nexa, your IoT diagnostic copilot. How can I help you monitor or troubleshoot your devices today?";
  let requires_human = false;
  let priority = "LOW";

  // Fetch real KnowledgeBase data to simulate RAG
  const allChunks = await prisma.knowledgeChunk.findMany({
    include: { document: true }
  });

  const cleanMsg = msgLower.replace(/[^\w\s]/g, '');
  const words = cleanMsg.split(/\s+/).filter(w => w.length > 3 && !['what', 'how', 'why', 'when', 'who', 'this', 'that', 'there', 'with'].includes(w));

  let ragMatched = false;
  
  // Check for dynamic intents first
  if (msgLower.includes("status") || msgLower.includes("offline") || msgLower.includes("disconnect")) {
    const userDevices = await prisma.device.findMany({ where: { userId: user.id } });
    if (userDevices.length > 0) {
      const offline = userDevices.filter(d => d.status === 'OFFLINE' || d.status === 'CRITICAL');
      if (offline.length > 0) {
        response = `I found ${offline.length} device(s) requiring attention:\n${offline.map(d => `- ${d.name} (${d.deviceId}) is ${d.status}`).join('\n')}\nWould you like me to run a diagnostic on these?`;
        intent = "STATUS_CHECK";
        sentiment = "CONCERNED";
      } else {
        response = `All your ${userDevices.length} devices are currently ONLINE and functioning normally.`;
        intent = "STATUS_CHECK";
      }
    } else {
      response = "You don't have any devices registered to your account yet.";
    }
  }
  else if (msgLower.includes("temperature") || msgLower.includes("temp") || msgLower.includes("t100")) {
    toolsUsed.push("get_sensor_readings(type='TEMP')");
    knowledgeSources.push("NexaSense T100 User Manual");
    intent = "DIAGNOSTIC_TEMP";
    
    if (msgLower.includes("high") || msgLower.includes("hot") || msgLower.includes("warning")) {
      sentiment = "CONCERNED";
      priority = "HIGH";
      response = "I've checked your NexaSense T100 (DEV-T1002). It is currently reporting an elevated temperature of 68.2°C, which triggered a Warning state. I recommend checking for external heat sources. Would you like me to open a ticket for a hardware inspection?";
      confidence = 92;
    } else if (msgLower.includes("critical")) {
      sentiment = "ANGRY";
      priority = "URGENT";
      requires_human = true;
      response = "I see your DEV-T1003 is in a CRITICAL state at 86.4°C. This exceeds safe operating limits. I am immediately escalating this to our engineering team for intervention.";
      confidence = 98;
    } else {
      response = "Your primary NexaSense T100 (DEV-T1001) is currently ONLINE and reporting a stable temperature of 27.4°C and 48% humidity. Health score is 91%.";
    }
  }
  else if (msgLower.includes("water") || msgLower.includes("leak")) {
    toolsUsed.push("get_device_status('W500')");
    intent = "DIAGNOSTIC_WATER";
    sentiment = "CONCERNED";
    priority = "HIGH";
    response = "Your NexaWater W500 is showing a water level of 88% which triggered a warning. Please check the sensor location for potential flooding.";
    confidence = 90;
  }
  else if (msgLower.includes("human") || msgLower.includes("agent") || msgLower.includes("help") || msgLower.includes("support")) {
    intent = "ESCALATION";
    sentiment = "NEUTRAL";
    priority = "MEDIUM";
    requires_human = true;
    response = "I understand. I am transferring this diagnostic log and conversation to a human support engineer. They will review your fleet telemetry and get back to you shortly.";
  }
  else {
    // Trigger RAG for any non-greeting query
    if (words.length > 0) {
      const matchedChunks = allChunks.filter(chunk => {
        return words.some(w => chunk.content.toLowerCase().includes(w) || chunk.document.title.toLowerCase().includes(w));
      });

      if (matchedChunks.length > 0) {
        knowledgeSources.push(...matchedChunks.map(c => c.document.title));
        response = `Based on our offline documentation (${matchedChunks[0].document.title}): ${matchedChunks[0].content}\n\nLet me know if you need more help with this!`;
        intent = "DOCUMENTATION_SEARCH";
        ragMatched = true;
      } else if (msgLower.includes("?") || msgLower.includes("how") || msgLower.includes("what") || msgLower.includes("why")) {
        response = "I couldn't find an exact match in the local knowledge base. Since I'm currently in Offline Demo Mode, my abilities are limited. Try asking about 'device status', 'temperature warnings', or 'water leaks'!";
        intent = "GENERAL_INQUIRY";
      }
    }
  }

  return {
    intent,
    sentiment,
    confidence,
    priority,
    response,
    requires_human,
    toolsUsed,
    knowledgeSources
  };
}
