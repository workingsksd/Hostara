
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { predictStockOut } from "@/ai/flows/predictive-inventory-management";
import { type PredictiveInventoryOutput } from "@/ai/schemas/predictive-inventory-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bot, Loader2 } from "lucide-react";

const formSchema = z.object({
  historicalStockData: z.string().min(10, "Please provide more detailed historical data."),
  leadTimeDays: z.coerce.number().min(0, "Lead time must be a positive number."),
  safetyStockDays: z.coerce.number().min(0, "Safety stock must be a positive number."),
});

type FormValues = z.infer<typeof formSchema>;

export function PredictiveInventory() {
  const [predictions, setPredictions] = useState<PredictiveInventoryOutput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      historicalStockData: "Tomatoes: 50kg -> 45kg -> 40kg -> 30kg (1 week)\nOnions: 100kg -> 90kg -> 75kg -> 60kg (1 week)\nChicken: 80kg -> 60kg -> 30kg -> 0kg (1 week)\nFlour: 200kg -> 195kg -> 190kg -> 180kg (1 week)",
      leadTimeDays: 2,
      safetyStockDays: 3,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setPredictions([]);
    try {
      const result = await predictStockOut(data);
      setPredictions(result);
      toast({
        title: "Prediction Complete",
        description: "Inventory predictions have been successfully generated.",
      });
    } catch (error) {
      console.error("Prediction failed:", error);
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: "An error occurred while generating predictions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const isOutOfStock = (date: string) => {
    return new Date(date) <= new Date();
  }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-accent"/>
              AI Stock Predictor
            </CardTitle>
            <CardDescription>
              Fill in the details below to get AI-powered inventory predictions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="historicalStockData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historical Stock Data</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Tomatoes: 50kg -> 45kg -> 40kg (1 week)"
                      className="min-h-[120px] bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="leadTimeDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Time (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2" {...field} className="bg-background/50"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="safetyStockDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Stock (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3" {...field} className="bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                "Predict Stock Levels"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      
      {(isLoading || predictions.length > 0) && (
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold mb-4">Predictions</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Predicted Stock Out Date</TableHead>
                  <TableHead>Purchase Suggestion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="h-12 animate-pulse bg-muted/20 rounded-md"></TableCell>
                      <TableCell className="h-12 animate-pulse bg-muted/20 rounded-md"></TableCell>
                      <TableCell className="h-12 animate-pulse bg-muted/20 rounded-md"></TableCell>
                    </TableRow>
                  ))
                ) : (
                  predictions.map((p) => (
                    <TableRow key={p.ingredient}>
                      <TableCell className="font-medium">{p.ingredient}</TableCell>
                      <TableCell>
                        <Badge variant={isOutOfStock(p.predictedStockOutDate) ? "destructive" : "outline"}>
                           {new Date(p.predictedStockOutDate).toLocaleDateString()}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.purchaseSuggestion}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Card>
  );
}
