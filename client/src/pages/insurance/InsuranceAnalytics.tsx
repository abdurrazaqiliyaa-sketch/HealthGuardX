import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, DollarSign, TrendingUp, Users, FileCheck } from "lucide-react";

export default function InsuranceAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Claims insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims This Month</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 text-chart-2">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.24M</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">87%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Enrollees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,518</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 text-chart-2">
              <TrendingUp className="h-3 w-3" />
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Claims by Status</CardTitle>
            <CardDescription>Distribution of claim statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-5" style={{ width: "25%" }} />
                  </div>
                  <span className="text-sm font-medium">86</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Under Review</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-3" style={{ width: "15%" }} />
                  </div>
                  <span className="text-sm font-medium">51</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Approved</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-2" style={{ width: "45%" }} />
                  </div>
                  <span className="text-sm font-medium">154</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Paid</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-1" style={{ width: "30%" }} />
                  </div>
                  <span className="text-sm font-medium">103</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rejected</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-destructive" style={{ width: "10%" }} />
                  </div>
                  <span className="text-sm font-medium">34</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Claim Types</CardTitle>
            <CardDescription>Most common claim categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Emergency Care</span>
                <span className="text-sm font-medium">$487K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Outpatient Services</span>
                <span className="text-sm font-medium">$324K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Surgery</span>
                <span className="text-sm font-medium">$298K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Diagnostics</span>
                <span className="text-sm font-medium">$132K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Medication</span>
                <span className="text-sm font-medium">$89K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Time</CardTitle>
            <CardDescription>Average claim processing duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">3.2 days</div>
              <p className="text-sm text-muted-foreground">Average processing time</p>
              <div className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fastest:</span>
                  <span className="font-medium">6 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Slowest:</span>
                  <span className="font-medium">12 days</span>
                </div>
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="font-medium">5 days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Year-over-year comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">↑ 24%</div>
              <p className="text-sm text-muted-foreground">Claim volume increase YoY</p>
              <div className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>This Year:</span>
                  <span className="font-medium">3,845 claims</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Year:</span>
                  <span className="font-medium">3,102 claims</span>
                </div>
                <div className="flex justify-between">
                  <span>Projected EOY:</span>
                  <span className="font-medium">4,614 claims</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
