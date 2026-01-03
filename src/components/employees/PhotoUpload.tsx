import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  value?: string;
  onChange: (photo: string | undefined) => void;
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
        setIsDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera access denied:', err);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onChange(dataUrl);
        closeCamera();
        setIsDialogOpen(false);
      }
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const removePhoto = () => {
    onChange(undefined);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            'w-24 h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors',
            value && 'border-solid border-primary'
          )}
          onClick={() => setIsDialogOpen(true)}
        >
          {value ? (
            <img src={value} alt="Employee" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            {value ? 'Change Photo' : 'Add Photo'}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removePhoto}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) closeCamera();
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Employee Photo</DialogTitle>
          </DialogHeader>
          
          {!isCameraOpen ? (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8" />
                <span>Upload Picture</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={openCamera}
              >
                <Camera className="w-8 h-8" />
                <span>Take Picture</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={closeCamera}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-primary"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
