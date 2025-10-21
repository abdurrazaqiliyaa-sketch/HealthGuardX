import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { useQuery } from "@tanstack/react-query";
import { Heart, FileText, Clock, CheckCircle, XCircle, Loader2, DollarSign } from "lucide-react";

export default function PatientInsurance() {
  const { uid } = useWallet();

  const { data: insurance, isLoading: insuranceLoading } = useQuery({
    queryKey: ["/api/patient/insurance"],
    enabled: !!uid,
  });

  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ["/api/patient/claims"],
    enabled: !!uid,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "paid":
        return <CheckCircle className="h-4 w-4 text-chart-2" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-chart-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "paid":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Insurance & Claims</h1>
        <p className="text-muted-foreground">Track your insurance coverage and claim status</p>
      </div>

      {insuranceLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : insurance && insurance.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insurance.map((policy: any) => (
            <Card key={policy.id} data-testid={`card-policy-${policy.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-chart-4/10 text-chart-4">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{policy.policyName}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">{policy.policyNumber}</p>
                    </div>
                  </div>
                  <Badge variant={policy.status === "active" ? "default" : "outline"}>
                    {policy.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Coverage Limit</span>
                  <span className="font-semibold">${parseFloat(policy.coverageLimit || 0).toLocaleString()}</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Coverage Types</p>
                  <div className="flex flex-wrap gap-1">
                    {policy.coverageTypes?.map((type: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                  <span>Enrolled</span>
                  <span>{new Date(policy.enrollmentDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Insurance Coverage</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You don't have any insurance policies linked to your account yet
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Insurance Claims</CardTitle>
          <CardDescription>Track the status of your submitted claims</CardDescription>
        </CardHeader>
        <CardContent>
          {claimsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : claims && claims.length > 0 ? (
            <div className="space-y-3">
              {claims.map((claim: any) => (
                <Card key={claim.id} className="hover-elevate" data-testid={`card-claim-${claim.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold font-mono">{claim.claimNumber}</span>
                          <Badge variant={getStatusColor(claim.status)} className="gap-1">
                            {getStatusIcon(claim.status)}
                            {claim.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Hospital</p>
                            <p className="font-medium">{claim.hospitalName || "Medical Center"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Amount</p>
                            <p className="font-semibold flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {parseFloat(claim.amount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Claim Type</p>
                            <Badge variant="outline" className="text-xs capitalize">
                              {claim.claimType}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Submitted</p>
                            <p className="text-xs">{new Date(claim.submittedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {claim.status === "approved" && claim.paidAmount && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Paid Amount</span>
                              <span className="font-semibold text-chart-2">
                                ${parseFloat(claim.paidAmount).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                        {claim.rejectionReason && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-1">Rejection Reason</p>
                            <p className="text-sm text-destructive">{claim.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No claims submitted yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
