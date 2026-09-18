import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Upload, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default async function KnowledgeBasePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  const documents = await prisma.knowledgeDocument.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { chunks: true }
      }
    }
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-zinc-400 mt-1">Manage RAG documents for the AI support agent.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
          <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
          <CardTitle className="text-lg">Indexed Documents</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="w-full pl-9 bg-zinc-950/50 border-zinc-800 focus-visible:ring-indigo-500"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/80 border-y border-zinc-800/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Document</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium text-center">Chunks</th>
                  <th className="px-6 py-3 font-medium">Last Updated</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-200">{doc.title}</p>
                          <p className="text-xs text-zinc-500 truncate max-w-[200px]">{doc.content}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-zinc-800/50 text-zinc-300">
                        {doc.category || "General"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-400">
                      {doc._count.chunks}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Active
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-800">
                            <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                          <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">Edit Document</DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">Re-index Vectors</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      No documents found. Upload one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
