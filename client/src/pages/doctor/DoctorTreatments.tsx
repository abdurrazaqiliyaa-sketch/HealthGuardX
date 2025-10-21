import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWallet } from "@/contexts/WalletContext";
import { useQuery } from "@tanstack/react-query";
import { FileCheck, Activity, Users } from "lucide-react";

export default function DoctorTreatments() {
  const { uid } = useWallet();

  const { data: treatments, isLoading } = useQuery({
    queryKey: ["/api/doctor/treatments"],
    enabled: !!uid,
  });

  const thisMonth = treatments?.filter((t: any) => {
    const date = new Date(t.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }) || [];

  const uniquePatients = new Set(treatments?.map((t: any) => t.patientId) || []).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Treatment Logs</h1>
        <p className="text-muted-foreground">Your signed treatment records and consultations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Treatments</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treatments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{thisMonth.length}</div>
            <p className="text-xs text-muted-foreground">Consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{uniquePatients}</div>
            <p className="text-xs text-muted-foreground">Patients treated</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Treatment History</CardTitle>
          <CardDescription>Complete record of signed treatment logs</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : treatments && treatments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Prescription</TableHead>
                  <TableHead>Signature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatments.map((treatment: any) => (
                  <TableRow key={treatment.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(treatment.treatmentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{treatment.patientId.slice(0, 8)}...</TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{treatment.diagnosis}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{treatment.treatment}</TableCell>
                    <TableCell className="text-sm">{treatment.prescription || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {treatment.doctorSignature.slice(0, 10)}...
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No treatment logs yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
