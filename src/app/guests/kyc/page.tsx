
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import withAuth from '@/components/withAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Camera, RefreshCw, UserCheck, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useRef, useState, useContext } from 'react';
import { extractIdInfo, OcrOutput } from '@/ai/flows/kyc-ocr-flow';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Booking, BookingContext } from '@/context/BookingContext';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

function KYCScannerPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrOutput | null>(null);
  const [idCardImage, setIdCardImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { addBooking } = useContext(BookingContext);
  const router = useRouter();

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
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    return canvas.toDataURL('image/jpeg');
  }

  const handleScanId = async () => {
    const imageDataUri = captureImage();
    if (!imageDataUri) return;

    setIsScanning(true);
    setIdCardImage(imageDataUri);

    try {
      const result = await extractIdInfo({ idCardImageDataUri: imageDataUri });
      setOcrResult(result);
      setIsResultOpen(true);
    } catch (error) {
      console.error('OCR failed:', error);
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: 'Could not extract information from the ID. Please try again.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleVerifyFace = async () => {
    const livePhotoImageDataUri = captureImage();
    if (!livePhotoImageDataUri || !idCardImage) return;

    setIsVerifying(true);
    try {
      const result = await extractIdInfo({ 
        idCardImageDataUri: idCardImage,
        livePhotoImageDataUri: livePhotoImageDataUri,
      });

      if (result.faceMatch?.match === 'true') {
        toast({
            title: "Face Verified",
            description: "The guest's face matches the ID photo.",
            className: "bg-green-500 text-white",
        });
      } else {
         toast({
            variant: 'destructive',
            title: "Face Mismatch",
            description: result.faceMatch?.reason || "Could not verify face. Please try again.",
        });
      }
      // Update OCR result with face match info
      setOcrResult(result);

    } catch (error) {
        console.error('Face verification failed:', error);
        toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: 'Could not perform face verification. Please try again.',
        });
    } finally {
        setIsVerifying(false);
    }
  }

  const handleConfirmGuest = () => {
    if (!ocrResult) return;

    const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        guest: {
            name: ocrResult.name,
            email: 'email@example.com', // Placeholder email
            avatar: '',
        },
        checkIn: format(new Date(), 'yyyy-MM-dd'),
        checkOut: format(new Date(new Date().setDate(new Date().getDate() + 3)), 'yyyy-MM-dd'), // Default 3 day stay
        status: 'Checked-in',
        type: 'Hotel',
        room: 'Assigned on check-in', // Placeholder room
    };
    
    addBooking(newBooking);

    toast({
        title: "Guest Confirmed",
        description: `${ocrResult.name} has been successfully checked-in.`
    });
    
    router.push('/guests');
  }

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
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex justify-center gap-4">
              <Button size="lg" disabled={!hasCameraPermission || isScanning || isVerifying} onClick={handleScanId}>
                {isScanning ? (
                    <>
                        <Loader2 className="mr-2 animate-spin" />
                        Scanning...
                    </>
                ) : (
                    <>
                        <Camera className="mr-2" />
                        Scan ID
                    </>
                )}
              </Button>
              <Button size="lg" variant="secondary" disabled={!hasCameraPermission || !idCardImage || isVerifying} onClick={handleVerifyFace}>
                 {isVerifying ? (
                    <>
                        <Loader2 className="mr-2 animate-spin" />
                        Verifying...
                    </>
                ) : (
                    <>
                        <UserCheck className="mr-2" />
                        Verify Face
                    </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

       <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Guest Details</DialogTitle>
            <DialogDescription>
              Review the information extracted from the ID card. Edit if necessary before confirming.
            </DialogDescription>
          </DialogHeader>
          {ocrResult && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={ocrResult.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input id="idNumber" defaultValue={ocrResult.idNumber} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" defaultValue={ocrResult.dateOfBirth} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue={ocrResult.address} />
              </div>
              {ocrResult.faceMatch && ocrResult.faceMatch.match !== 'not_applicable' && (
                <div className="space-y-2">
                  <Label>Face Verification</Label>
                  <Alert variant={ocrResult.faceMatch.match === 'true' ? 'default' : 'destructive'} className={ocrResult.faceMatch.match === 'true' ? 'bg-green-100/10 border-green-500/50' : ''}>
                    {ocrResult.faceMatch.match === 'true' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertTitle className="capitalize">{ocrResult.faceMatch.match === 'true' ? "Verified" : "Mismatch"}</AlertTitle>
                    <AlertDescription>
                      {ocrResult.faceMatch.reason}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResultOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmGuest}>Confirm & Check-in</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default withAuth(KYCScannerPage);
