import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Upload, FileText, X, CheckCircle, AlertCircle, Loader2, 
  FileImage, File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ApplicationData, UploadedDocument } from "@/pages/Apply";

const requiredDocuments = [
  { type: "passport", name: "Passport (First & Last Page)", required: true },
  { type: "photo", name: "Passport-size Photo", required: true },
  { type: "resume", name: "Resume/CV", required: true },
  { type: "education", name: "Educational Certificates", required: false },
  { type: "experience", name: "Work Experience Letters", required: false },
  { type: "other", name: "Other Supporting Documents", required: false },
];

interface DocumentUploadStepProps {
  data: ApplicationData;
  onUpdate: (data: Partial<ApplicationData>) => void;
  userId: string;
}

export const DocumentUploadStep = ({ data, onUpdate, userId }: DocumentUploadStepProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File, documentType: string) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "You must be logged in to upload documents.",
      });
      return;
    }

    setUploading(documentType);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${documentType}-${Date.now()}.${fileExt}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(fileName, file);

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("application-documents")
        .getPublicUrl(fileName);

      setUploadProgress(100);

      // Add to documents array
      const newDoc: UploadedDocument = {
        id: fileName,
        name: file.name,
        type: documentType,
        url: urlData.publicUrl,
        status: "uploaded",
      };

      // Remove any existing document of the same type
      const updatedDocs = data.documents.filter(d => d.type !== documentType);
      onUpdate({ documents: [...updatedDocs, newDoc] });

      toast({
        title: "Document Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload document. Please try again.",
      });
    } finally {
      setUploading(null);
      setUploadProgress(0);
    }
  };

  const removeDocument = async (docId: string) => {
    try {
      await supabase.storage
        .from("application-documents")
        .remove([docId]);

      onUpdate({ documents: data.documents.filter(d => d.id !== docId) });

      toast({
        title: "Document Removed",
        description: "Document has been removed successfully.",
      });
    } catch (error) {
      console.error("Remove error:", error);
    }
  };

  const getUploadedDoc = (type: string) => {
    return data.documents.find(d => d.type === type);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png"].includes(ext || "")) {
      return FileImage;
    }
    return File;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
          Upload Documents
        </h2>
        <p className="text-muted-foreground">
          Please upload the required documents. Accepted formats: PDF, JPG, PNG (max 20MB each).
        </p>
      </div>

      <div className="space-y-4">
        {requiredDocuments.map((doc) => {
          const uploadedDoc = getUploadedDoc(doc.type);
          const isUploading = uploading === doc.type;
          const FileIcon = uploadedDoc ? getFileIcon(uploadedDoc.name) : FileText;

          return (
            <DocumentDropzone
              key={doc.type}
              doc={doc}
              uploadedDoc={uploadedDoc}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              FileIcon={FileIcon}
              onUpload={(file) => uploadFile(file, doc.type)}
              onRemove={() => uploadedDoc && removeDocument(uploadedDoc.id)}
            />
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Documents Uploaded</span>
          <span className="text-sm text-muted-foreground">
            {data.documents.length} / {requiredDocuments.filter(d => d.required).length} required
          </span>
        </div>
        <Progress 
          value={(data.documents.length / requiredDocuments.filter(d => d.required).length) * 100} 
          className="h-2 mt-2" 
        />
      </div>
    </div>
  );
};

interface DocumentDropzoneProps {
  doc: { type: string; name: string; required: boolean };
  uploadedDoc: UploadedDocument | undefined;
  isUploading: boolean;
  uploadProgress: number;
  FileIcon: React.ComponentType<{ className?: string }>;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const DocumentDropzone = ({
  doc,
  uploadedDoc,
  isUploading,
  uploadProgress,
  FileIcon,
  onUpload,
  onRemove,
}: DocumentDropzoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: false,
    disabled: isUploading || !!uploadedDoc,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
        isDragActive
          ? "border-primary bg-primary/5"
          : uploadedDoc
          ? "border-success/50 bg-success/5"
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      } ${isUploading || uploadedDoc ? "cursor-default" : "cursor-pointer"}`}
    >
      <input {...getInputProps()} />
      
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          uploadedDoc ? "bg-success/10" : "bg-muted"
        }`}>
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          ) : uploadedDoc ? (
            <CheckCircle className="w-6 h-6 text-success" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{doc.name}</p>
            {doc.required && (
              <span className="px-2 py-0.5 text-xs bg-destructive/10 text-destructive rounded-full">
                Required
              </span>
            )}
          </div>
          
          {isUploading ? (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">Uploading... {uploadProgress}%</p>
            </div>
          ) : uploadedDoc ? (
            <p className="text-sm text-muted-foreground truncate">{uploadedDoc.name}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isDragActive ? "Drop file here" : "Drag & drop or click to upload"}
            </p>
          )}
        </div>

        {/* Action */}
        {uploadedDoc && !isUploading && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};
