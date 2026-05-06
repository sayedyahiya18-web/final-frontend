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
          fps: 15, 
          qrbox: { width: 280, height: 200 },
          aspectRatio: 1.0,
          formatsToSupport: [ 
            Html5QrcodeSupportedFormats.EAN_13, 
            Html5QrcodeSupportedFormats.EAN_8, 
            Html5QrcodeSupportedFormats.UPC_A, 
            Html5QrcodeSupportedFormats.UPC_E 
          ]
        };

        // On mobile, environment is usually the back camera
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            onScan(decodedText);
            if (html5QrCode?.isScanning) {
              html5QrCode.stop().catch(console.error);
            }
          },
          () => {} // Verbose error logging can be noisy
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

      <div style={{ flex: 1, position: 'relative' }}>
        <div id={regionId} style={{ width: '100%', height: '100%' }}></div>
        {!isReady && !error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <RefreshCw className="animate-spin" size={40} />
          </div>
        )}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem', textAlign: 'center' }}>
            <X size={48} color="#ef4444" />
            <p style={{ marginTop: '1rem' }}>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        )}
        <div className="scanner-line"></div>
      </div>

      <div style={{ padding: '2rem', background: '#000', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
        Align the barcode within the frame to scan
      </div>
    </div>
  );
}
