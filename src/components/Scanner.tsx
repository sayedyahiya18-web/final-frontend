'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, RefreshCw, X } from 'lucide-react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = 'reader';

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        // 1. Basic Support Check
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera API not supported in this browser. Please use a modern browser like Chrome or Safari.');
          return;
        }

        // 2. HTTPS/Secure Context Check
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!window.isSecureContext && !isLocalhost) {
          setError('Camera access requires a secure (HTTPS) connection. Use the provided tunnel link for mobile testing.');
          return;
        }

        html5QrCode = new Html5Qrcode(regionId);
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 25, // Higher FPS for smoother detection on laptops
          qrbox: { width: 350, height: 250 }, // Larger box for easier alignment
          aspectRatio: 1.0,
          formatsToSupport: [ 
            Html5QrcodeSupportedFormats.EAN_13, 
            Html5QrcodeSupportedFormats.EAN_8, 
            Html5QrcodeSupportedFormats.UPC_A, 
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128 // Added more formats
          ]
        };

        // For laptop/desktop, we should try to get the first available camera
        // For mobile, we still prefer 'environment'
        const cameras = await Html5Qrcode.getCameras();
        
        let cameraConfig: any = { facingMode: "environment" };
        if (cameras && cameras.length > 0) {
          // If only one camera (typical for laptops), use its ID directly
          if (cameras.length === 1) {
            cameraConfig = cameras[0].id;
          } else {
            // If multiple, try to find one that looks like a laptop webcam (usually first one)
            // or stick to 'environment' for mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (!isMobile) {
              cameraConfig = cameras[0].id;
            }
          }
        }

        await html5QrCode.start(
          cameraConfig,
          config,
          (decodedText) => {
            onScan(decodedText);
            if (html5QrCode?.isScanning) {
              html5QrCode.stop().catch(console.error);
            }
          },
          () => {} 
        );
        
        setIsReady(true);
      } catch (err: any) {
        console.error('Scanner Error:', err);
        if (err?.name === 'NotAllowedError') {
          setError('Camera permission denied. Please enable camera access in your browser settings.');
        } else if (err?.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError(`Camera error: ${err?.message || 'Initialization failed'}. Ensure you are using HTTPS.`);
        }
      }
    };

    startScanner();

    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'white', margin: 0 }}>Scan Barcode</h3>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem', borderRadius: '50%' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div id={regionId} style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}></div>
        
        {/* Centered Overlay Box */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '350px',
          height: '250px',
          border: '2px solid var(--primary)',
          borderRadius: '1rem',
          boxShadow: '0 0 0 4000px rgba(0,0,0,0.6)',
          zIndex: 5,
          pointerEvents: 'none'
        }}>
          <div className="scanner-line"></div>
          {/* Corner accents */}
          <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '4px 0 0 0' }}></div>
          <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '0 4px 0 0' }}></div>
          <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '0 0 0 4px' }}></div>
          <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '0 0 4px 0' }}></div>
        </div>

        {!isReady && !error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'rgba(0,0,0,0.5)', zIndex: 10 }}>
            <RefreshCw className="animate-spin" size={40} />
          </div>
        )}

        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.8)' }}>
            <X size={48} color="#ef4444" />
            <p style={{ marginTop: '1rem' }}>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
              Retry Camera
            </button>
          </div>
        )}

        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label className="btn btn-secondary" style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Camera size={18} /> Upload Image
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !scannerRef.current) return;
                  try {
                    const result = await scannerRef.current.scanFile(file, true);
                    onScan(result);
                  } catch (err) {
                    alert('Could not find a barcode in this image. Try a clearer photo.');
                  }
                }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Or enter barcode manually..." 
              className="input"
              style={{ marginBottom: 0, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  if (val) onScan(val);
                }
              }}
            />
            <button 
              className="btn btn-primary" 
              style={{ width: 'auto', padding: '0 1rem' }}
              onClick={() => {
                const input = document.querySelector('input[placeholder="Or enter barcode manually..."]') as HTMLInputElement;
                if (input?.value) onScan(input.value);
              }}
            >
              Go
            </button>
          </div>
          
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textAlign: 'center' }}>
            Laptop users: If your webcam is blurry, try uploading a photo or entering the code manually.
          </p>
        </div>
      </div>
    </div>
  );
}
