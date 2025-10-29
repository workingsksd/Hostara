
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import withAuth from '@/components/withAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, RefreshCw, UserCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function KYCScannerPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Guest Management & KYC Verification</h1>

        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader>
            <CardTitle>KYC via OCR and Face Match</CardTitle>
            <CardDescription>
              Point the camera at the guest's ID card to automatically scan and verify their identity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasCameraPermission === false && (
              <Alert variant="destructive">
                <Camera className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser to use this feature. You may need to refresh the page after granting permission.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="aspect-video w-full max-w-2xl mx-auto bg-muted/50 rounded-lg overflow-hidden border border-border/20 relative shadow-inner">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[85%] h-[70%] border-4 border-dashed border-primary/50 rounded-xl" />
                </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button size="lg" disabled={!hasCameraPermission}>
                <Camera className="mr-2" />
                Scan ID
              </Button>
              <Button size="lg" variant="secondary" disabled={!hasCameraPermission}>
                <UserCheck className="mr-2" />
                Verify Face
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(KYCScannerPage);
