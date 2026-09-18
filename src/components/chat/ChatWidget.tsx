"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Plus, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface Message {
  role: "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";
  content: string;
}

const faqs = [
  "My device is offline",
  "How do I check my telemetry?",
  "What is my fleet health?",
];

export function ChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Fetch history on mount
  useEffect(() => {
    if (session?.user && isOpen && messages.length === 0 && !conversationId) {
      fetch("/api/chat/history")
        .then((res) => res.json())
        .then((data) => {
          if (data.conversation) {
            setConversationId(data.conversation.id);
            setMessages(data.conversation.messages);
          }
        })
        .catch(console.error);
    }
  }, [session, isOpen]);

  if (!session || session.user.role !== "CUSTOMER") {
    return null; // Only show for customers
  }

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "USER", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
      });

      const data = await response.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "ASSISTANT", content: data.response.response },
        ]);
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setMessages([]);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 p-0 flex items-center justify-center z-50 transition-transform hover:scale-105"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] shadow-2xl flex flex-col z-50 bg-zinc-950 border-zinc-800 animate-in slide-in-from-bottom-5">
          <CardHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between bg-zinc-900/50 rounded-t-xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Copilot</CardTitle>
                <p className="text-xs text-zinc-500">NexaSupport Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={startNewChat} className="h-8 w-8 text-zinc-400 hover:text-white" title="New Chat">
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-zinc-400 hover:text-white" title="Close">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 text-center text-zinc-500">
                <div className="w-16 h-16 bg-zinc-900/80 rounded-2xl flex items-center justify-center border border-zinc-800/50 shadow-inner">
                  <Bot className="w-8 h-8 text-indigo-400/80" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-300">How can I help you today?</p>
                  <p className="text-xs mt-1 max-w-[200px] mx-auto text-zinc-500">Select a quick question or type your message below.</p>
                </div>
                <div className="flex flex-col gap-2 w-full mt-4 max-w-[260px] mx-auto">
                  {faqs.map((faq, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200 justify-start text-xs h-auto py-2.5 px-3 font-normal transition-colors"
                      onClick={() => handleSend(faq)}
                    >
                      {faq}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3 max-w-[90%]",
                    msg.role === "USER" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    {msg.role === "USER" ? (
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                      msg.role === "USER"
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm prose prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-a:text-indigo-400 max-w-none"
                    )}
                  >
                    {msg.role === "USER" ? (
                      msg.content
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3 max-w-[90%] mr-auto">
                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-zinc-500/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500/50 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-px w-full" />
          </CardContent>

          <CardFooter className="p-3 border-t border-zinc-800 bg-zinc-900/50 rounded-b-xl shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex w-full items-center gap-2"
            >
              <Input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500 h-10 rounded-full px-4 text-sm"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 h-10 w-10 rounded-full shrink-0 shadow-sm transition-transform active:scale-95">
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
