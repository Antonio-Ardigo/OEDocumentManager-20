import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, Trash2, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProcessDocument } from "@shared/schema";

interface ProcessDocumentsProps {
  processId: string;
}

export function ProcessDocuments({ processId }: ProcessDocumentsProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: [`/api/processes/${processId}/documents`],
    enabled: !!processId,
  });

  const addDocumentMutation = useMutation({
    mutationFn: async (documentData: {
      title: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      mimeType?: string;
    }) => {
      return apiRequest(`/api/processes/${processId}/documents`, {
        method: "POST",
        body: JSON.stringify(documentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/processes/${processId}/documents`],
      });
      setIsUploadDialogOpen(false);
      setDocumentTitle("");
      toast({
        title: "Document added",
        description: "Document has been successfully attached to the process.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add document",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return apiRequest(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/processes/${processId}/documents`],
      });
      toast({
        title: "Document deleted",
        description: "Document has been removed from the process.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    if (!documentTitle.trim()) {
      throw new Error("Please enter a document title first");
    }

    const response = await apiRequest(`/api/processes/${processId}/documents/upload`, {
      method: "POST",
      body: JSON.stringify({ fileName: `${documentTitle.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}` }),
    });

    return {
      method: "PUT" as const,
      url: response.uploadURL,
    };
  };

  const handleUploadComplete = (fileUrl: string, fileName: string, fileSize: number) => {
    const mimeType = fileName.split('.').pop()?.toLowerCase();
    const mimeTypeMap: { [key: string]: string } = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };

    addDocumentMutation.mutate({
      title: documentTitle.trim(),
      fileName,
      fileUrl,
      fileSize,
      mimeType: mimeType ? mimeTypeMap[mimeType] : undefined,
    });
  };

  const handleDownload = (document: ProcessDocument) => {
    window.open(document.fileUrl, '_blank');
  };

  const handleDelete = (documentId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocumentMutation.mutate(documentId);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <FileText className="h-5 w-5" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileText className="h-5 w-5 text-green-500" />;
    if (mimeType.includes('image')) return <FileText className="h-5 w-5 text-purple-500" />;
    return <FileText className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Attached Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading documents...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Attached Documents
            {documents && documents.length > 0 && (
              <Badge variant="secondary">{documents.length}</Badge>
            )}
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Document to Process</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="document-title">Document Title</Label>
                  <Input
                    id="document-title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Enter document title..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Upload File</Label>
                  <div className="mt-2">
                    <ObjectUploader
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleUploadComplete}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                      maxFileSize={25 * 1024 * 1024} // 25MB
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </ObjectUploader>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported: PDF, Word, Excel, Text, Images (max 25MB)
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!documents || documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents attached to this process</p>
            <p className="text-sm">Add documents to provide additional resources and references</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document: ProcessDocument) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(document.mimeType)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{document.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {document.fileName} • {formatFileSize(document.fileSize)}
                    </p>
                    {document.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(document.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(document)}
                    data-testid={`download-document-${document.id}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                    className="text-destructive hover:text-destructive"
                    data-testid={`delete-document-${document.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}