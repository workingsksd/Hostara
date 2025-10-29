
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";

function ReportingPage() {
  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-bold font-headline mb-6">Reporting & Analytics</h1>
        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This module is under construction. It will be used to track performance, occupancy, and revenue trends.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(ReportingPage);
