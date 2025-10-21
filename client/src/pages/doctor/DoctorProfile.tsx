import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWallet } from "@/contexts/WalletContext";
import { User, Briefcase, Award } from "lucide-react";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import HealthProfileForm from "@/components/HealthProfileForm";
import QRGeneratorCard from "@/components/QRGeneratorCard";

export default function DoctorProfile() {
  const { walletAddress, uid } = useWallet();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Doctor Profile</h1>
        <p className="text-muted-foreground">Manage your professional information</p>
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
              <Input placeholder="Dr. Jane Smith" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="jane.smith@hospital.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input type="tel" placeholder="+1 (555) 123-4567" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <CardTitle>Professional Details</CardTitle>
            </div>
            <CardDescription>Medical credentials and specialization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Medical License Number</Label>
              <Input placeholder="MD123456" />
            </div>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input placeholder="Cardiology" />
            </div>
            <div className="space-y-2">
              <Label>Hospital/Practice</Label>
              <Input placeholder="City General Hospital" />
            </div>
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input type="number" placeholder="10" />
            </div>
            <div className="space-y-2">
              <Label>Professional Bio</Label>
              <Textarea placeholder="Brief description of your medical background and expertise..." rows={4} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <CardTitle>Qualifications</CardTitle>
            </div>
            <CardDescription>Education and certifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Medical Degree</Label>
              <Input placeholder="MD, Harvard Medical School" />
            </div>
            <div className="space-y-2">
              <Label>Board Certifications</Label>
              <Textarea placeholder="List your board certifications..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Additional Certifications</Label>
              <Textarea placeholder="Additional training and certifications..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Documents</CardTitle>
            <CardDescription>Upload verification documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Medical License (PDF)</Label>
              <Input type="file" accept=".pdf" />
            </div>
            <div className="space-y-2">
              <Label>Board Certification (PDF)</Label>
              <Input type="file" accept=".pdf" />
            </div>
            <div className="space-y-2">
              <Label>Professional ID Photo</Label>
              <Input type="file" accept="image/*" />
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
