import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Upload, FileText, X, CheckCircle, AlertCircle, Loader2, 
  FileImage, File, Copy, Eye, Download, FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ApplicationData, UploadedDocument } from "@/pages/Apply";

const requiredDocuments = [
  { type: "resume", name: "Resume/CV", required: true },
  { type: "photo", name: "Passport-size Photo", required: true },
  { type: "education", name: "Educational Certificates", required: false },
  { type: "experience", name: "Work Experience Letters", required: false },
  { type: "passport", name: "Passport (First & Last Page)", required: false },
  { type: "other", name: "Other Supporting Documents", required: false },
];

interface DocumentUploadStepProps {
  data: ApplicationData;
  onUpdate: (data: Partial<ApplicationData>) => void;
  userId: string;
}

export const DocumentUploadStep = ({ data, onUpdate, userId }: DocumentUploadStepProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profileDocuments, setProfileDocuments] = useState<any[]>([]);
  const [selectedProfileDocs, setSelectedProfileDocs] = useState<string[]>([]);
  const [showProfileDocs, setShowProfileDocs] = useState(false);

  // Fetch user's profile documents
  useEffect(() => {
    if (user) {
      fetchProfileDocuments();
    }
  }, [user]);

  const fetchProfileDocuments = async () => {
    try {
      const { data: docs, error } = await supabase
        .from('documents')
        .select('*')
        .eq('profile_id', user?.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setProfileDocuments(docs || []);
      
      // Auto-select matching documents
      if (docs && docs.length > 0) {
        const autoSelected: string[] = [];
        docs.forEach(doc => {
          // Map profile document types to application types
          if (doc.document_type?.includes('resume') || doc.document_type?.includes('cv')) {
            autoSelected.push(doc.id);
            if (!getUploadedDoc('resume')) {
              addProfileDocumentToApplication(doc, 'resume');
            }
          }
          if (doc.document_type?.includes('passport')) {
            autoSelected.push(doc.id);
            if (!getUploadedDoc('passport')) {
              addProfileDocumentToApplication(doc, 'passport');
            }
          }
          if (doc.document_type?.includes('education')) {
            autoSelected.push(doc.id);
            if (!getUploadedDoc('education')) {
              addProfileDocumentToApplication(doc, 'education');
            }
          }
        });
        setSelectedProfileDocs(autoSelected);
        
        if (autoSelected.length > 0) {
          toast({
            title: "Documents Auto-filled",
            description: `${autoSelected.length} document(s) added from your profile`,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile documents:', error);
    }
  };

  const addProfileDocumentToApplication = (profileDoc: any, type: string) => {
    const newDoc: UploadedDocument = {
      id: `profile-${profileDoc.id}`,
      name: profileDoc.file_name,
      type: type,
      url: profileDoc.file_url,
      status: "uploaded",
      isFromProfile: true,
      profileDocId: profileDoc.id,
    };

    // Remove any existing document of the same type
    const updatedDocs = data.documents.filter(d => d.type !== type);
    onUpdate({ documents: [...updatedDocs, newDoc] });
  };

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
        isFromProfile: false,
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

  const removeDocument = async (docId: string, isProfileDoc: boolean = false) => {
    try {
      if (!isProfileDoc) {
        // Remove from storage if it's not from profile
        await supabase.storage
          .from("application-documents")
          .remove([docId]);
      }

      onUpdate({ documents: data.documents.filter(d => d.id !== docId) });

      toast({
        title: "Document Removed",
        description: "Document has been removed from application.",
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

  const handleProfileDocToggle = (profileDoc: any, type: string) => {
    if (selectedProfileDocs.includes(profileDoc.id)) {
      // Remove from selection
      setSelectedProfileDocs(prev => prev.filter(id => id !== profileDoc.id));
      // Remove from application if it exists
      const docToRemove = data.documents.find(d => d.profileDocId === profileDoc.id);
      if (docToRemove) {
        removeDocument(docToRemove.id, true);
      }
    } else {
      // Add to selection
      setSelectedProfileDocs(prev => [...prev, profileDoc.id]);
      // Add to application
      addProfileDocumentToApplication(profileDoc, type);
    }
  };

  const handleSelectAllProfileDocs = () => {
    const allIds = profileDocuments.map(doc => doc.id);
    setSelectedProfileDocs(allIds);
    
    // Add all to application
    profileDocuments.forEach(doc => {
      const type = getDocumentTypeFromProfileDoc(doc);
      if (type && !getUploadedDoc(type)) {
        addProfileDocumentToApplication(doc, type);
      }
    });
    
    toast({
      title: "All profile documents selected",
      description: `${allIds.length} documents added from your profile`,
    });
  };

  const getDocumentTypeFromProfileDoc = (profileDoc: any): string | null => {
    const docType = profileDoc.document_type?.toLowerCase();
    const fileName = profileDoc.file_name?.toLowerCase();
    
    if (docType?.includes('resume') || docType?.includes('cv') || fileName?.includes('resume') || fileName?.includes('cv')) {
      return 'resume';
    }
    if (docType?.includes('passport') || fileName?.includes('passport')) {
      return 'passport';
    }
    if (docType?.includes('education') || fileName?.includes('degree') || fileName?.includes('certificate')) {
      return 'education';
    }
    if (docType?.includes('experience') || fileName?.includes('experience') || fileName?.includes('employment')) {
      return 'experience';
    }
    if (docType?.includes('photo') || fileName?.includes('photo') || fileName?.includes('picture')) {
      return 'photo';
    }
    return 'other';
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
              Upload Documents
            </h2>
            <p className="text-muted-foreground">
              Upload required documents or select from your profile documents
            </p>
          </div>
          
          {profileDocuments.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowProfileDocs(!showProfileDocs)}
              className="gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              {showProfileDocs ? 'Hide' : 'Show'} Profile Documents ({profileDocuments.length})
            </Button>
          )}
        </div>
      </div>

      {/* Profile Documents Section */}
      {showProfileDocs && profileDocuments.length > 0 && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Documents from Your Profile
              </h3>
              <p className="text-sm text-muted-foreground">
                Select documents to auto-fill this application
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAllProfileDocs}
            >
              Select All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {profileDocuments.map((doc) => {
              const type = getDocumentTypeFromProfileDoc(doc);
              const isSelected = selectedProfileDocs.includes(doc.id);
              const isInApplication = data.documents.some(d => d.profileDocId === doc.id);
              
              return (
                <Card key={doc.id} className={`p-3 ${isInApplication ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`profile-doc-${doc.id}`}
                      checked={isSelected}
                      onCheckedChange={() => handleProfileDocToggle(doc, type || 'other')}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <Label 
                            htmlFor={`profile-doc-${doc.id}`}
                            className="font-medium cursor-pointer truncate block"
                            title={doc.file_name}
                          >
                            {doc.file_name}
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {doc.document_type}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getDocumentStatusIcon(doc.status)}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            doc.status === 'verified' 
                              ? 'bg-green-100 text-green-800'
                              : doc.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(doc.file_url, '_blank')}
                          className="h-7 text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {isInApplication && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            Added to application
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Documents selected here will be automatically attached to this application.
              Verified documents are preferred by employers.
            </p>
          </div>
        </Card>
      )}

      {/* Document Upload Section */}
      <div className="space-y-4">
        {requiredDocuments.map((doc) => {
          const uploadedDoc = getUploadedDoc(doc.type);
          const isUploading = uploading === doc.type;
          const FileIcon = uploadedDoc ? getFileIcon(uploadedDoc.name) : FileText;
          const isFromProfile = uploadedDoc?.isFromProfile;

          return (
            <DocumentDropzone
              key={doc.type}
              doc={doc}
              uploadedDoc={uploadedDoc}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              FileIcon={FileIcon}
              isFromProfile={isFromProfile}
              onUpload={(file) => uploadFile(file, doc.type)}
              onRemove={() => uploadedDoc && removeDocument(uploadedDoc.id, isFromProfile)}
            />
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-1">Documents Summary</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-4">
                <span>Total uploaded: <strong>{data.documents.length}</strong></span>
                <span>From profile: <strong className="text-primary">{data.documents.filter(d => d.isFromProfile).length}</strong></span>
                <span>New uploads: <strong className="text-green-600">{data.documents.filter(d => !d.isFromProfile).length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span>Required documents:</span>
                <span className={`font-medium ${data.documents.length >= requiredDocuments.filter(d => d.required).length ? 'text-green-600' : 'text-amber-600'}`}>
                  {data.documents.filter(d => requiredDocuments.find(rd => rd.type === d.type)?.required).length} / {requiredDocuments.filter(d => d.required).length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-xs">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">
                  {Math.round((data.documents.filter(d => requiredDocuments.find(rd => rd.type === d.type)?.required).length / requiredDocuments.filter(d => d.required).length) * 100)}%
                </span>
              </div>
              <Progress 
                value={(data.documents.filter(d => requiredDocuments.find(rd => rd.type === d.type)?.required).length / requiredDocuments.filter(d => d.required).length) * 100} 
                className="h-2" 
              />
            </div>
          </div>
        </div>
        
        {data.documents.filter(d => d.isFromProfile).length > 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">
                <strong>Great!</strong> You're using {data.documents.filter(d => d.isFromProfile).length} document(s) from your profile.
                This saves time and ensures consistency across applications.
              </p>
            </div>
          </div>
        )}
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
  isFromProfile?: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const DocumentDropzone = ({
  doc,
  uploadedDoc,
  isUploading,
  uploadProgress,
  FileIcon,
  isFromProfile = false,
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
          ? isFromProfile
            ? "border-primary/50 bg-primary/5"
            : "border-success/50 bg-success/5"
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      } ${isUploading || uploadedDoc ? "cursor-default" : "cursor-pointer"}`}
    >
      <input {...getInputProps()} />
      
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          uploadedDoc 
            ? isFromProfile 
              ? "bg-primary/10" 
              : "bg-success/10"
            : "bg-muted"
        }`}>
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          ) : uploadedDoc ? (
            <FileIcon className={`w-6 h-6 ${isFromProfile ? 'text-primary' : 'text-success'}`} />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{doc.name}</p>
            {isFromProfile && (
              <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full flex items-center gap-1">
                <Copy className="w-3 h-3" />
                From Profile
              </span>
            )}
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
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground truncate">{uploadedDoc.name}</p>
              {uploadedDoc.url && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(uploadedDoc.url, '_blank');
                  }}
                  title="View document"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              )}
            </div>
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
