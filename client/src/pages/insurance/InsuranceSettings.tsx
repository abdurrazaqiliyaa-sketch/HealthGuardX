import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building, Shield, Settings, DollarSign } from "lucide-react";

export default function InsuranceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Provider Settings</h1>
        <p className="text-muted-foreground">Configure insurance provider information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              <CardTitle>Provider Information</CardTitle>
            </div>
            <CardDescription>Basic company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input placeholder="HealthCare Insurance Ltd." />
            </div>
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input placeholder="INS-12345" />
            </div>
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input placeholder="LIC-98765" />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" placeholder="claims@healthcare.com" />
            </div>
            <div className="space-y-2">
              <Label>Support Phone</Label>
              <Input type="tel" placeholder="+234 800 123 4567" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Claims Processing</CardTitle>
            </div>
            <CardDescription>Configure claim handling rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve small claims</Label>
                <p className="text-sm text-muted-foreground">Claims under threshold</p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label>Auto-approval Threshold</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input type="number" placeholder="500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Standard Processing Time (days)</Label>
              <Input type="number" placeholder="5" defaultValue="5" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require invoice verification</Label>
                <p className="text-sm text-muted-foreground">Verify hospital signatures</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <CardTitle>Payment Settings</CardTitle>
            </div>
            <CardDescription>Configure payout preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Input value="Bank Transfer" disabled />
            </div>
            <div className="space-y-2">
              <Label>Payment Frequency</Label>
              <Input value="Weekly" disabled />
            </div>
            <div className="space-y-2">
              <Label>Minimum Payout Amount</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input type="number" placeholder="1000" defaultValue="1000" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Batch payments</Label>
                <p className="text-sm text-muted-foreground">Group multiple claims</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>Manage alert settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New claim notifications</Label>
                <p className="text-sm text-muted-foreground">Alert on submission</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>High-value claim alerts</Label>
                <p className="text-sm text-muted-foreground">Claims over $10,000</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Fraud detection alerts</Label>
                <p className="text-sm text-muted-foreground">Suspicious activity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly summary reports</Label>
                <p className="text-sm text-muted-foreground">Email digest</p>
              </div>
              <Switch defaultChecked />
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
