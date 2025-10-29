
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { AppLayout } from "@/components/layout/app-layout";
import { BookingsChart } from "@/components/dashboard/bookings-chart";
import { BarChart, LineChart, PieChart } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart as RechartsPieChart, Cell } from "recharts";

const pieChartData = [
  { source: "OYO", bookings: 45, fill: "hsl(var(--chart-1))" },
  { source: "MakeMyTrip", bookings: 30, fill: "hsl(var(--chart-2))" },
  { source: "Trivago", bookings: 15, fill: "hsl(var(--chart-3))" },
  { source: "Walk-in", bookings: 10, fill: "hsl(var(--chart-4))" },
];
const chartConfig = {
  bookings: {
    label: "Bookings",
  },
} satisfies ChartConfig;

function ReportingPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline mb-6">
          Reporting & Analytics
        </h1>
        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>
              Track performance, occupancy, and revenue trends. This is a placeholder and will be fully implemented soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center gap-2">
                  <LineChart className="text-accent" />
                  <CardTitle>Occupancy Rate (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <BookingsChart />
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center gap-2">
                  <PieChart className="text-accent" />
                  <CardTitle>Booking Source Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-[250px]"
                  >
                    <RechartsPieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={pieChartData}
                        dataKey="bookings"
                        nameKey="source"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                         {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(ReportingPage);
