import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Search, 
  FileText, 
  Download, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Database } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";

type DocumentStatus = Database["public"]["Enums"]["document_status"];

interface Document {
  id: string;
  application_id: string;
  name: string;
  document_type: string;
  file_url: string | null;
  status: DocumentStatus;
  admin_notes: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
  applications?: {
    user_id: string;
    profiles?: {
      full_name: string;
      email: string;
    };
  };
}

const statusConfig: Record<DocumentStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending Review", color: "text-amber-700", bgColor: "bg-amber-100 dark:bg-amber-900/40", icon: Clock },
  approved: { label: "Approved", color: "text-green-700", bgColor: "bg-green-100 dark:bg-green-900/40", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-red-700", bgColor: "bg-red-100 dark:bg-red-900/40", icon: XCircle },
  missing: { label: "Missing", color: "text-gray-700", bgColor: "bg-gray-100 dark:bg-gray-900/40", icon: AlertTriangle },
};

const statusOptions: DocumentStatus[] = ["pending", "approved", "rejected", "missing"];

export const DocumentsManagement = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          applications!documents_application_id_fkey (
            user_id,
            profiles:user_id (
              full_name,
              email
            )
          )
        `)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setDocuments((data as unknown as Document[]) || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading documents",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const updateDocumentStatus = async (docId: string, newStatus: DocumentStatus, notes?: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("documents")
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes || null
        })
        .eq("id", docId);

      if (error) throw error;

      const doc = documents.find(d => d.id === docId);
      if (doc?.applications) {
        await supabase.from("notifications").insert({
          user_id: doc.applications.user_id,
          type: "document",
          title: "Document Review Update",
          message: `Your document "${doc.name}" has been ${newStatus}.${notes ? ` Note: ${notes}` : ""}`,
          link: "/dashboard",
        });
      }

      toast({
        title: "Document Updated",
        description: `Document has been ${newStatus}`,
      });

      setSelectedDoc(null);
      fetchDocuments();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating document",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.applications?.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.applications?.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = documents.filter(d => d.status === "pending").length;

  const getDocumentTypeIcon = (type: string) => {
    return <FileText className="w-5 h-5 text-primary" />;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-500/5 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Documents Review</CardTitle>
              <CardDescription>
                Review and approve uploaded documents
              </CardDescription>
            </div>
          </div>
          {pendingCount > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Badge variant="destructive" className="gap-1.5 px-3 py-1.5 text-sm animate-pulse">
                <AlertCircle className="w-4 h-4" />
                {pendingCount} pending review
              </Badge>
            </motion.div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by document name or applicant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 h-11 bg-muted/50 border-0">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => {
                  const config = statusConfig[status];
                  return (
                    <SelectItem key={status} value={status}>
                      <span className="flex items-center gap-2">
                        <config.icon className={`w-4 h-4 ${config.color}`} />
                        {config.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={fetchDocuments} 
              className="h-11 gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading documents...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border overflow-hidden"
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Document</TableHead>
                    <TableHead className="font-semibold">Applicant</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Uploaded</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="w-12 h-12 text-muted-foreground/40" />
                          <p className="text-muted-foreground font-medium">No documents found</p>
                          <p className="text-sm text-muted-foreground/60">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc, index) => {
                      const StatusIcon = statusConfig[doc.status].icon;
                      return (
                        <motion.tr
                          key={doc.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`group hover:bg-muted/30 transition-colors ${doc.status === 'pending' ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                {getDocumentTypeIcon(doc.document_type)}
                              </div>
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {doc.file_url ? "File uploaded" : "No file"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{doc.applications?.profiles?.full_name || "Unknown"}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc.applications?.profiles?.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize font-normal">
                              {doc.document_type.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig[doc.status].bgColor} ${statusConfig[doc.status].color} border-0 gap-1.5`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusConfig[doc.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              {doc.file_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              {doc.file_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(doc.file_url!, "_blank")}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => updateDocumentStatus(doc.id, "approved")}
                                disabled={updating || doc.status === "approved"}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setAdminNotes(doc.admin_notes || "");
                                }}
                                disabled={updating}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rejection Dialog */}
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                Reject Document
              </DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting "{selectedDoc?.name}". The applicant will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminNotes" className="text-muted-foreground text-xs uppercase tracking-wider">
                  Rejection Reason
                </Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Please provide a clear reason for rejection..."
                  className="min-h-[100px] bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-red-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => selectedDoc && updateDocumentStatus(selectedDoc.id, "rejected", adminNotes)}
                  disabled={updating || !adminNotes.trim()}
                  className="min-w-[120px]"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {previewDoc?.name}
              </DialogTitle>
              <DialogDescription>
                Uploaded by {previewDoc?.applications?.profiles?.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex-1 overflow-hidden rounded-lg bg-muted">
              {previewDoc?.file_url && (
                <iframe
                  src={previewDoc.file_url}
                  className="w-full h-[60vh] border-0"
                  title={previewDoc.name}
                />
              )}
            </div>
            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" onClick={() => setPreviewDoc(null)}>
                Close
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(previewDoc?.file_url!, "_blank")}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  onClick={() => {
                    if (previewDoc) {
                      updateDocumentStatus(previewDoc.id, "approved");
                      setPreviewDoc(null);
                    }
                  }}
                  disabled={updating}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
