import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, File, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  processId: string;
  onUploadComplete?: () => void;
}

interface FileUploadData {
  title: string;
  file: File | null;
}

export default function FileUpload({ processId, onUploadComplete }: FileUploadProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState<FileUploadData>({
    title: '',
    file: null,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData(prev => ({
        ...prev,
        file,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""), // Remove extension for title
      }));
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a file and provide a title.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Get upload URL from server
      const uploadResponse = await apiRequest(`/api/processes/${processId}/documents/upload`, {
        method: 'POST',
        body: JSON.stringify({
          fileName: uploadData.file.name,
        }),
      });

      const { uploadURL } = uploadResponse;

      // Step 2: Upload file to object storage
      const uploadFileResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: uploadData.file,
        headers: {
          'Content-Type': uploadData.file.type,
        },
      });

      if (!uploadFileResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // Step 3: Save document record to database
      await apiRequest(`/api/processes/${processId}/documents`, {
        method: 'POST',
        body: JSON.stringify({
          title: uploadData.title.trim(),
          fileName: uploadData.file.name,
          fileUrl: uploadURL,
          fileSize: uploadData.file.size,
          mimeType: uploadData.file.type,
        }),
      });

      toast({
        title: "File Uploaded",
        description: `"${uploadData.title}" has been attached to the process.`,
      });

      // Reset form
      setUploadData({ title: '', file: null });
      setIsOpen(false);
      onUploadComplete?.();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setUploadData(prev => ({ ...prev, file: null }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-upload-file">
          <Upload className="w-4 h-4 mr-2" />
          Attach File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attach File to Process</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file-input">Select File</Label>
            <Input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
              data-testid="input-file-select"
            />
            {uploadData.file && (
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{uploadData.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFile}
                    data-testid="button-clear-file"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title-input">Document Title</Label>
            <Input
              id="title-input"
              type="text"
              value={uploadData.title}
              onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a descriptive title for this document"
              data-testid="input-document-title"
            />
          </div>

          {/* Upload Button */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadData.file || !uploadData.title.trim() || isUploading}
              data-testid="button-upload-confirm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}