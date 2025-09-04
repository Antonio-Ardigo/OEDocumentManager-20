import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (fileUrl: string, fileName: string, fileSize: number) => void;
  buttonClassName?: string;
  children?: ReactNode;
  accept?: string;
}

/**
 * A file upload component that renders as a button and provides direct file upload
 * 
 * Features:
 * - Renders as a customizable button that opens file selection
 * - Direct file upload to object storage via presigned URLs
 * - File validation and progress feedback
 * - Completion callback with file details
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL)
 * @param props.onComplete - Callback function called when upload is complete
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 * @param props.accept - File type restrictions (e.g., ".pdf,.doc,.docx")
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  accept,
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Handle single file for now

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get upload parameters
      const { method, url } = await onGetUploadParameters();

      // Upload file to object storage
      const uploadResponse = await fetch(url, {
        method,
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Extract the file URL from the upload URL (remove query parameters)
      const fileUrl = url.split('?')[0];

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      });

      // Call completion callback
      onComplete?.(fileUrl, file.name, file.size);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="file-upload"
        disabled={isUploading}
      />
      <label htmlFor="file-upload">
        <Button 
          type="button" 
          disabled={isUploading}
          className={buttonClassName}
          asChild
        >
          <span style={{ cursor: 'pointer' }}>
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                {children || (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </>
                )}
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
}