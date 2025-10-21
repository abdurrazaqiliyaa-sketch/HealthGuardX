import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Building, MapPin, Phone, Settings } from "lucide-react";

export default function HospitalSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hospital Settings</h1>
        <p className="text-muted-foreground">Configure your hospital information and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              <CardTitle>Hospital Information</CardTitle>
            </div>
            <CardDescription>Basic facility details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Hospital Name</Label>
              <Input placeholder="City General Hospital" />
            </div>
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input placeholder="HOSP-12345" />
            </div>
            <div className="space-y-2">
              <Label>Hospital Type</Label>
              <Input placeholder="General / Specialty / Teaching" />
            </div>
            <div className="space-y-2">
              <Label>Number of Beds</Label>
              <Input type="number" placeholder="250" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>Location</CardTitle>
            </div>
            <CardDescription>Hospital address and contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input placeholder="123 Healthcare Ave" />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input placeholder="Lagos" />
            </div>
            <div className="space-y-2">
              <Label>State/Region</Label>
              <Input placeholder="Lagos State" />
            </div>
            <div className="space-y-2">
              <Label>Postal Code</Label>
              <Input placeholder="100001" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <CardTitle>Contact Information</CardTitle>
            </div>
            <CardDescription>Communication details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Main Phone</Label>
              <Input type="tel" placeholder="+234 123 456 7890" />
            </div>
            <div className="space-y-2">
              <Label>Emergency Line</Label>
              <Input type="tel" placeholder="+234 911 000 0000" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="info@cityhospital.ng" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input type="url" placeholder="https://cityhospital.ng" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Service Settings</CardTitle>
            </div>
            <CardDescription>Configure hospital services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>24/7 Emergency Services</Label>
                <p className="text-sm text-muted-foreground">Always available emergency care</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Outpatient Services</Label>
                <p className="text-sm text-muted-foreground">Walk-in consultations</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Insurance Claims Processing</Label>
                <p className="text-sm text-muted-foreground">Accept insurance payments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Specialties Offered</Label>
              <Textarea placeholder="Cardiology, Neurology, Pediatrics..." rows={3} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save Settings</Button>
      </div>
    </div>
  );
}
