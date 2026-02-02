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
import { Loader2, Search, FileText, Download, RefreshCw, Check, X, AlertCircle } from "lucide-react";
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

const statusColors: Record<DocumentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  missing: "bg-gray-100 text-gray-800",
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
        title: "Error",
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

      // Send notification to user
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
        description: `Document status changed to ${newStatus}`,
      });

      setSelectedDoc(null);
      fetchDocuments();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documents Review</CardTitle>
            <CardDescription>
              Review and approve uploaded documents
            </CardDescription>
          </div>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              {pendingCount} pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by document name or applicant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchDocuments} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No documents found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doc.applications?.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.applications?.profiles?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {doc.document_type.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[doc.status]}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {doc.file_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.file_url!, "_blank")}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/90"
                            onClick={() => updateDocumentStatus(doc.id, "approved")}
                            disabled={updating || doc.status === "approved"}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive/90"
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Rejection Dialog */}
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Document</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting "{selectedDoc?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="adminNotes">Rejection Reason</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => selectedDoc && updateDocumentStatus(selectedDoc.id, "rejected", adminNotes)}
                  disabled={updating || !adminNotes.trim()}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Reject Document
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
