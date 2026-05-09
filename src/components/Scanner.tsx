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
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera API not supported in this browser.');
          return;
        }

        const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (typeof window !== 'undefined' && !window.isSecureContext && !isLocalhost) {
          setError('Camera access requires a secure (HTTPS) connection.');
          return;
        }

        html5QrCode = new Html5Qrcode(regionId);
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 20,
          qrbox: { width: 300, height: 200 },
          aspectRatio: 1.0,
          formatsToSupport: [ 
            Html5QrcodeSupportedFormats.EAN_13, 
            Html5QrcodeSupportedFormats.EAN_8, 
            Html5QrcodeSupportedFormats.UPC_A, 
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128
          ]
        };

        const cameras = await Html5Qrcode.getCameras();
        let cameraConfig: any = { facingMode: "environment" };
        if (cameras && cameras.length > 0) {
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (!isMobile) cameraConfig = cameras[0].id;
        }

        await html5QrCode.start(
          cameraConfig,
          config,
          (decodedText) => {
            onScan(decodedText);
            if (html5QrCode?.isScanning) html5QrCode.stop().catch(console.error);
          },
          () => {} 
        );
        
        setIsReady(true);
      } catch (err: any) {
        console.error('Scanner Error:', err);
        setError(`Camera error: ${err?.message || 'Failed to start'}`);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode?.isScanning) html5QrCode.stop().catch(console.error);
    };
  }, [onScan]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <h3 style={{ color: 'white', margin: 0, fontSize: '1rem', fontWeight: 600 }}>Scan Barcode</h3>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div id={regionId} style={{ width: '100%', height: '100%' }}></div>
        
        {/* Minimal Overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '200px',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '0.5rem',
          boxShadow: '0 0 0 4000px rgba(0,0,0,0.6)',
          zIndex: 5,
          pointerEvents: 'none'
        }}>
          <div className="scanner-line"></div>
        </div>

        {!isReady && !error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'rgba(0,0,0,0.5)', zIndex: 10 }}>
            <RefreshCw className="animate-spin" size={32} />
          </div>
        )}

        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.9)', zIndex: 20 }}>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{error}</p>
            <button className="btn btn-primary" onClick={() => typeof window !== 'undefined' && window.location.reload()}>
              Retry Camera
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: '2rem 1.5rem', background: '#000', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 10 }}>
        <label className="btn btn-secondary" style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
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
                alert('No barcode detected. Try a clearer photo.');
              }
            }}
          />
        </label>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Enter barcode manually..." 
            className="input"
            style={{ marginBottom: 0, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value;
                if (val) onScan(val);
              }
            }}
          />
          <button className="btn btn-primary" style={{ width: 'auto', padding: '0 1.25rem' }} onClick={() => {
            const input = document.querySelector('input[placeholder="Enter barcode manually..."]') as HTMLInputElement;
            if (input?.value) onScan(input.value);
          }}>
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
