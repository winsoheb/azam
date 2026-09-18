import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default async function AgentKnowledgePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "AGENT" && session.user.role !== "ADMIN")) {
    return null;
  }

  const documents = await prisma.knowledgeDocument.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-zinc-400 mt-1">Access the same internal resources as the AI agent.</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              type="search"
              placeholder="Search articles, guides, and policies..."
              className="pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800/50">
            {documents.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-zinc-800/30 transition-colors">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{doc.title}</h3>
                    <div className="flex items-center gap-3 mt-1 mb-3">
                      <Badge variant="outline" className="bg-zinc-800/50 text-zinc-300">
                        {doc.category || "General"}
                      </Badge>
                      <span className="text-xs text-zinc-500">
                        Updated {new Date(doc.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-3">
                      {doc.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {documents.length === 0 && (
              <div className="p-8 text-center text-zinc-500">
                No knowledge base articles available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
