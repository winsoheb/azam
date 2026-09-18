"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, CheckCircle2, AlertTriangle, Lightbulb, Wrench, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
}

interface AIContext {
  intent: string;
  sentiment: string;
  confidence: number;
  priority: string;
  toolsUsed: string[];
  knowledgeSources: string[];
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    { id: "initial", role: "ASSISTANT", content: `Hello ${session?.user?.name?.split(' ')[0] || ''}! I'm Nexa, your AI support assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [aiContext, setAiContext] = useState<AIContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "USER", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, conversationId }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      const data = await res.json();
      
      setConversationId(data.conversationId);
      
      setAiContext({
        intent: data.response.intent,
        sentiment: data.response.sentiment,
        confidence: data.response.confidence,
        priority: data.response.priority,
        toolsUsed: data.response.toolsUsed,
        knowledgeSources: data.response.knowledgeSources
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ASSISTANT",
        content: data.response.response
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "SYSTEM",
        content: "Sorry, I encountered an error. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (score >= 70) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] lg:h-screen lg:border-r border-zinc-800/50">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 max-w-[85%]",
                    msg.role === "USER" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    msg.role === "USER" ? "bg-indigo-600" : "bg-zinc-800",
                    msg.role === "SYSTEM" && "bg-red-500/20 text-red-400"
                  )}>
                    {msg.role === "USER" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl",
                    msg.role === "USER" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-zinc-800/50 border border-zinc-800 rounded-tl-sm"
                  )}>
                    {msg.role === "USER" ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="text-sm prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 max-w-[85%]"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="px-4 py-4 rounded-2xl bg-zinc-800/50 border border-zinc-800 rounded-tl-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800/50">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="pr-12 py-6 bg-zinc-900/50 border-zinc-800 focus-visible:ring-indigo-500 rounded-xl"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="absolute right-1.5 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </form>
            <p className="text-center text-xs text-zinc-500 mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Nexa AI can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>
      </div>

      {/* AI Context Panel - Desktop Only */}
      <div className="hidden lg:block w-80 bg-zinc-950/50 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" /> AI Diagnostics
          </h2>
        </div>

        {aiContext ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key={messages.length} // Re-animate when messages change
            className="space-y-6"
          >
            <Card className="bg-zinc-900/40 border-zinc-800/50 shadow-none">
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Detected Intent</div>
                  <Badge variant="outline" className="bg-zinc-800/50 text-zinc-200 border-zinc-700">
                    {aiContext.intent.replace(/_/g, ' ')}
                  </Badge>
                </div>
                
                <div>
                  <div className="text-xs text-zinc-500 mb-1 flex justify-between">
                    <span>Confidence Score</span>
                    <span className={cn("font-medium", 
                      aiContext.confidence >= 90 ? "text-emerald-400" : 
                      aiContext.confidence >= 70 ? "text-amber-400" : "text-red-400"
                    )}>{aiContext.confidence}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${aiContext.confidence}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn("h-full", 
                        aiContext.confidence >= 90 ? "bg-emerald-500" : 
                        aiContext.confidence >= 70 ? "bg-amber-500" : "bg-red-500"
                      )}
                    />
                  </div>
                  {aiContext.confidence < 70 && (
                    <div className="mt-2 text-xs flex items-start gap-1 text-red-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      Low confidence. Escalation recommended.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Sentiment</div>
                    <div className={cn("text-sm font-medium", 
                      aiContext.sentiment === 'ANGRY' ? "text-red-400" :
                      aiContext.sentiment === 'CONCERNED' ? "text-amber-400" : "text-zinc-300"
                    )}>
                      {aiContext.sentiment}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Priority</div>
                    <div className="text-sm font-medium text-zinc-300">{aiContext.priority}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {aiContext.toolsUsed.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 mb-3 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Actions Performed
                </h3>
                <div className="space-y-2">
                  {aiContext.toolsUsed.map((tool, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono text-xs">{tool}()</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiContext.knowledgeSources.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 mb-3 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Knowledge Sources
                </h3>
                <div className="space-y-2">
                  {aiContext.knowledgeSources.map((source, idx) => (
                    <div key={idx} className="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 leading-snug">
                      {source}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-3 opacity-50">
            <Bot className="w-12 h-12 text-zinc-700" />
            <p className="text-sm max-w-[200px]">Send a message to see real-time AI analytics and intent detection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
