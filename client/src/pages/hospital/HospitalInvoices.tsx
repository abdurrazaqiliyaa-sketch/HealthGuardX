import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, DollarSign, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/contexts/WalletContext";
import type { Claim } from "@shared/schema";

export default function HospitalInvoices() {
  const { uid } = useWallet();

  const { data: claims, isLoading } = useQuery<Claim[]>({
    queryKey: ["/api/hospital/claims"],
    enabled: !!uid,
  });

  const totalRevenue = claims?.filter(c => c.status === "paid")
    .reduce((sum, c) => sum + parseFloat(c.paidAmount || "0"), 0) || 0;

  const pendingAmount = claims?.filter(c => c.status === "pending" || c.status === "under_review")
    .reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0) || 0;

  const thisMonthClaims = claims?.filter(c => {
    const claimDate = new Date(c.submittedAt);
    const now = new Date();
    return claimDate.getMonth() === now.getMonth() && claimDate.getFullYear() === now.getFullYear();
  }).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hospital Invoices & Claims</h1>
        <p className="text-muted-foreground">Manage billing and insurance claims</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${totalRevenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">Paid claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-5" data-testid="text-pending-amount">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${pendingAmount.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims This Month</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-month-claims">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : thisMonthClaims}
            </div>
            <p className="text-xs text-muted-foreground">Total claims</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
          <CardDescription>All submitted insurance claims</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !claims || claims.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No claims submitted yet</p>
              <p className="text-sm">Submit claims to track billing and payments</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim Number</TableHead>
                  <TableHead>Claim Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id} data-testid={`row-claim-${claim.id}`}>
                    <TableCell className="font-mono text-xs" data-testid="text-claim-number">
                      {claim.claimNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{claim.claimType}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold" data-testid="text-claim-amount">
                      ${parseFloat(claim.amount || "0").toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(claim.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          claim.status === "paid" ? "default" : 
                          claim.status === "approved" ? "default" :
                          claim.status === "rejected" ? "destructive" :
                          "secondary"
                        }
                        data-testid="badge-claim-status"
                      >
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {claim.paidAmount 
                        ? `$${parseFloat(claim.paidAmount).toLocaleString()}`
                        : "-"
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
