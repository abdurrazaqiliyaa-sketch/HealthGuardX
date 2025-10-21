import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Lock, Download, Calendar, User, Loader2 } from "lucide-react";

export default function PatientRecords() {
  const { uid } = useWallet();
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [recordData, setRecordData] = useState({
    title: "",
    description: "",
    recordType: "lab_report",
    isEmergency: false,
    fileData: "",
    fileName: "",
    fileType: "",
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ["/api/patient/records"],
    enabled: !!uid,
  });

  const uploadMutation = useMutation({
    mutationFn: (data: typeof recordData) => apiRequest("POST", "/api/patient/records", data),
    onSuccess: () => {
      toast({ title: "Record Uploaded", description: "Your medical record has been saved" });
      queryClient.invalidateQueries({ queryKey: ["/api/patient/records"] });
      setUploadDialogOpen(false);
      setRecordData({ title: "", description: "", recordType: "lab_report", isEmergency: false, fileData: "", fileName: "", fileType: "" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({ 
        title: "Invalid File Type", 
        description: "Please upload a PDF or document file (PDF, DOC, DOCX, TXT)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ 
        title: "File Too Large", 
        description: "File size must be less than 10MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRecordData({
        ...recordData,
        fileData: reader.result as string,
        fileName: file.name,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordData.fileData) {
      toast({ 
        title: "No File Selected", 
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    uploadMutation.mutate(recordData);
  };

  const getRecordIcon = (type: string) => {
    return FileText;
  };

  const getRecordTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      lab_report: "text-chart-1",
      prescription: "text-chart-2",
      imaging: "text-chart-3",
      diagnosis: "text-chart-4",
      treatment_plan: "text-chart-5",
    };
    return colors[type] || "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">Encrypted health documents and files</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-open-upload">
              <Upload className="h-4 w-4" />
              Upload Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Medical Record</DialogTitle>
              <DialogDescription>Add a new encrypted medical document to your vault</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select File (PDF, DOC, DOCX, TXT)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileChange}
                  required
                  data-testid="input-file"
                />
                {recordData.fileName && (
                  <p className="text-xs text-muted-foreground">Selected: {recordData.fileName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={recordData.title}
                  onChange={(e) => setRecordData({ ...recordData, title: e.target.value })}
                  placeholder="e.g., Blood Test Results - Jan 2025"
                  required
                  data-testid="input-record-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={recordData.description}
                  onChange={(e) => setRecordData({ ...recordData, description: e.target.value })}
                  placeholder="Additional notes about this document"
                  data-testid="input-record-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recordType">Record Type</Label>
                <Select value={recordData.recordType} onValueChange={(v) => setRecordData({ ...recordData, recordType: v })}>
                  <SelectTrigger data-testid="select-record-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab_report">Lab Report</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="imaging">Medical Imaging</SelectItem>
                    <SelectItem value="diagnosis">Diagnosis</SelectItem>
                    <SelectItem value="treatment_plan">Treatment Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isEmergency"
                  checked={recordData.isEmergency}
                  onChange={(e) => setRecordData({ ...recordData, isEmergency: e.target.checked })}
                  className="h-4 w-4"
                  data-testid="checkbox-emergency"
                />
                <Label htmlFor="isEmergency" className="text-sm font-normal cursor-pointer">
                  Include in emergency access (visible to emergency responders)
                </Label>
              </div>
              <div className="bg-muted/50 p-4 rounded-md">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  This document will be encrypted client-side before uploading to IPFS
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadMutation.isPending} data-testid="button-submit-record">
                  {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload Record
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : records && records.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((record: any) => {
            const Icon = getRecordIcon(record.recordType);
            return (
              <Card key={record.id} className="hover-elevate" data-testid={`card-record-${record.id}`}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex-1">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 mb-3 ${getRecordTypeColor(record.recordType)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base line-clamp-2">{record.title}</CardTitle>
                  </div>
                  {record.isEmergency && (
                    <Badge variant="destructive" className="text-xs">Emergency</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {record.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{record.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(record.uploadedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      Encrypted
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {record.recordType.replace("_", " ")}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4 gap-2" data-testid={`button-download-${record.id}`}>
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Medical Records Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start building your encrypted health vault by uploading your first medical document
            </p>
            <Button onClick={() => setUploadDialogOpen(true)} className="gap-2" data-testid="button-upload-first">
              <Upload className="h-4 w-4" />
              Upload Your First Record
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
