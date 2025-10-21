import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserCog, Stethoscope, Building2, Ambulance, Building, Loader2, CheckCircle } from "lucide-react";

export default function PatientApplyRole() {
  const { uid } = useWallet();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState("");
  const [applicationData, setApplicationData] = useState({
    professionalLicense: "",
    institutionName: "",
    yearsOfExperience: "",
    specialization: "",
  });

  const applyMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/patient/apply-role", data),
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your role application is under admin review",
      });
      setSelectedRole("");
      setApplicationData({
        professionalLicense: "",
        institutionName: "",
        yearsOfExperience: "",
        specialization: "",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate({
      role: selectedRole,
      ...applicationData,
    });
  };

  const roles = [
    {
      value: "doctor",
      label: "Doctor",
      icon: Stethoscope,
      description: "Access patient records, create treatment logs, and sign prescriptions",
      color: "text-chart-2",
    },
    {
      value: "hospital",
      label: "Hospital",
      icon: Building2,
      description: "Manage institutional accounts, submit invoices, and file insurance claims",
      color: "text-chart-3",
    },
    {
      value: "emergency_responder",
      label: "Emergency Responder",
      icon: Ambulance,
      description: "Scan QR codes for immediate access to critical patient information",
      color: "text-destructive",
    },
    {
      value: "insurance_provider",
      label: "Insurance Provider",
      icon: Building,
      description: "Review and approve insurance claims, manage policies",
      color: "text-chart-4",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Apply for Special Role</h1>
        <p className="text-muted-foreground">Request elevated permissions for healthcare professionals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card
            key={role.value}
            className={`cursor-pointer transition-all ${
              selectedRole === role.value ? "ring-2 ring-primary" : "hover-elevate"
            }`}
            onClick={() => setSelectedRole(role.value)}
            data-testid={`card-role-${role.value}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 mb-3 ${role.color}`}>
                  <role.icon className="h-6 w-6" />
                </div>
                {selectedRole === role.value && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardTitle className="text-base">{role.label}</CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Provide verification details for {roles.find(r => r.value === selectedRole)?.label} role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(selectedRole === "doctor" || selectedRole === "emergency_responder") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="professionalLicense">Professional License Number</Label>
                    <Input
                      id="professionalLicense"
                      value={applicationData.professionalLicense}
                      onChange={(e) => setApplicationData({ ...applicationData, professionalLicense: e.target.value })}
                      placeholder="e.g., MD123456"
                      required
                      data-testid="input-license"
                    />
                  </div>
                  {selectedRole === "doctor" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          value={applicationData.specialization}
                          onChange={(e) => setApplicationData({ ...applicationData, specialization: e.target.value })}
                          placeholder="e.g., Cardiology, Pediatrics"
                          data-testid="input-specialization"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                        <Input
                          id="yearsOfExperience"
                          type="number"
                          value={applicationData.yearsOfExperience}
                          onChange={(e) => setApplicationData({ ...applicationData, yearsOfExperience: e.target.value })}
                          placeholder="e.g., 5"
                          data-testid="input-experience"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {(selectedRole === "hospital" || selectedRole === "insurance_provider") && (
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Institution Name</Label>
                  <Input
                    id="institutionName"
                    value={applicationData.institutionName}
                    onChange={(e) => setApplicationData({ ...applicationData, institutionName: e.target.value })}
                    placeholder="e.g., City General Hospital"
                    required
                    data-testid="input-institution"
                  />
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-md">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  Your application will be reviewed by an administrator. You'll be notified once approved.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRole("")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={applyMutation.isPending}
                  data-testid="button-submit-application"
                >
                  {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
