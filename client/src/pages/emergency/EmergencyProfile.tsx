import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { User, Briefcase, Shield } from "lucide-react";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import HealthProfileForm from "@/components/HealthProfileForm";
import QRGeneratorCard from "@/components/QRGeneratorCard";

export default function EmergencyProfile() {
  const { walletAddress, uid } = useWallet();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Emergency Responder Profile</h1>
        <p className="text-muted-foreground">Manage your professional credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfilePictureUpload />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>Your basic profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Health ID (UID)</Label>
              <Input value={uid || ""} disabled className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input value={walletAddress || ""} disabled className="font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="John Smith" />
            </div>
            <div className="space-y-2">
              <Label>Badge Number</Label>
              <Input placeholder="EMT-12345" />
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input type="tel" placeholder="+1 (555) 987-6543" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <CardTitle>Professional Details</CardTitle>
            </div>
            <CardDescription>Emergency service credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Input placeholder="Paramedic / EMT / First Responder" />
            </div>
            <div className="space-y-2">
              <Label>Organization</Label>
              <Input placeholder="City EMS / Fire Department" />
            </div>
            <div className="space-y-2">
              <Label>Certification Level</Label>
              <Input placeholder="EMT-Paramedic" />
            </div>
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input placeholder="EMS-123456" />
            </div>
            <div className="space-y-2">
              <Label>Years of Service</Label>
              <Input type="number" placeholder="5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Access Credentials</CardTitle>
            </div>
            <CardDescription>Emergency access authorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Authorization Level</Label>
              <Input value="Emergency Medical Services" disabled />
            </div>
            <div className="space-y-2">
              <Label>Jurisdiction</Label>
              <Input placeholder="County / Region" />
            </div>
            <div className="space-y-2">
              <Label>Certification Expiry</Label>
              <Input type="date" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Documents</CardTitle>
            <CardDescription>Upload professional credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>EMT License (PDF)</Label>
              <Input type="file" accept=".pdf" />
            </div>
            <div className="space-y-2">
              <Label>Service Badge Photo</Label>
              <Input type="file" accept="image/*" />
            </div>
            <div className="space-y-2">
              <Label>Authorization Letter (PDF)</Label>
              <Input type="file" accept=".pdf" />
            </div>
          </CardContent>
        </Card>
        
        <QRGeneratorCard />
      </div>

      <HealthProfileForm />

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save Profile</Button>
      </div>
    </div>
  );
}
