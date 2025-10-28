
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";

function StaffPage() {
  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-bold font-headline mb-6">Staff & Role Management</h1>
        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader>
            <CardTitle>Team and Role Administration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This module is under construction. It will be used to manage employees, roles, attendance, and tasks.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(StaffPage);
