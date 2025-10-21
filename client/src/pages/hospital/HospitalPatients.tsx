import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";

export default function HospitalPatients() {
  const { uid } = useWallet();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { data: patients, isLoading } = useQuery<any[]>({
    queryKey: ["/api/hospital/patients"],
    enabled: !!uid,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/hospital/search-patient?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
        setSearchDialogOpen(true);
      } else {
        toast({ 
          title: "Not Found", 
          description: "No patient found with that UID or username", 
          variant: "destructive" 
        });
        setSearchResult(null);
      }
    } catch (error) {
      toast({ 
        title: "Search Failed", 
        description: "Unable to search for patient", 
        variant: "destructive" 
      });
    } finally {
      setIsSearching(false);
    }
  };

  const activePatients = patients?.length || 0;
  const latestPatient = patients && patients.length > 0 ? patients[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hospital Patients</h1>
        <p className="text-muted-foreground">Manage patient admissions and records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-patients">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : activePatients}
            </div>
            <p className="text-xs text-muted-foreground">Treated at this hospital</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Patient</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Enter UID or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-patient"
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={isSearching}
                data-testid="button-search"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treatment Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2" data-testid="text-treatment-count">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (patients?.reduce((sum, p) => sum + (p.treatmentCount || 0), 0) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total treatments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patient Directory</CardTitle>
              <CardDescription>All patients treated at this hospital</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !patients || patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No patients found</p>
              <p className="text-sm">Patients will appear here after they receive treatment at your hospital</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient UID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Treatments</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id} data-testid={`row-patient-${patient.id}`}>
                    <TableCell className="font-mono text-xs" data-testid="text-patient-uid">
                      {patient.uid}
                    </TableCell>
                    <TableCell className="font-medium" data-testid="text-patient-username">
                      {patient.username}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {patient.lastVisit 
                        ? new Date(patient.lastVisit).toLocaleDateString()
                        : "N/A"
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.treatmentCount || 0} treatments</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.status === "verified" ? "default" : "outline"}>
                        {patient.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>Patient information and treatment history</DialogDescription>
          </DialogHeader>
          {searchResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient UID</p>
                  <p className="font-mono font-medium">{searchResult.uid}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{searchResult.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={searchResult.status === "verified" ? "default" : "outline"}>
                    {searchResult.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Treatment Count</p>
                  <p className="font-semibold">{searchResult.treatmentCount || 0} treatments</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Claims Filed</p>
                  <p className="font-semibold">{searchResult.claimCount || 0} claims</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Visit</p>
                  <p className="font-medium">
                    {searchResult.lastVisit 
                      ? new Date(searchResult.lastVisit).toLocaleDateString()
                      : "N/A"
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
