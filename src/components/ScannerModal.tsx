import React, { useState, useEffect } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { motion } from "motion/react";
import { Plus } from "lucide-react";

interface ScannerModalProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

const ScannerModal: React.FC<ScannerModalProps> = React.memo(
  ({ onScan, onClose }) => {
    const [error, setError] = useState<string | null>(null);
    const [manualIsbn, setManualIsbn] = useState("");
    const [cameras, setCameras] = useState<any[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string | null>(
      null,
    );

    const scanningRef = React.useRef(false);
    const html5QrCodeRef = React.useRef<Html5Qrcode | null>(null);

    // Récupération des caméras
    useEffect(() => {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            setCameras(devices);

            const backCamera = devices.find(
              (d) =>
                d.label.toLowerCase().includes("back") ||
                d.label.toLowerCase().includes("arrière"),
            );

            setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
          }
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération des caméras:", err);
        });

      return () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
      };
    }, []);

    // Démarrage du scanner
    useEffect(() => {
      if (!selectedCameraId) return;

      const timer = setTimeout(() => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current
            .stop()
            .then(() => startScanner())
            .catch(() => startScanner());
        } else {
          startScanner();
        }
      }, 500);

      const startScanner = () => {
        const html5QrCode = new Html5Qrcode("reader", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
          ],
          verbose: false,
        });

        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 240, height: 130 },
          aspectRatio: 1.333333,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        };

        html5QrCode
          .start(
            selectedCameraId,
            config,
            (decodedText) => {
              if (scanningRef.current) return;
              scanningRef.current = true;

              if (navigator.vibrate) navigator.vibrate(100);

              html5QrCode
                .stop()
                .then(() => {
                  onScan(decodedText);
                  onClose();
                })
                .catch(() => {
                  onScan(decodedText);
                  onClose();
                });
            },
            () => {},
          )
          .catch((err) => {
            setError(
              "Impossible d'accéder à la caméra. Vérifiez les permissions ou essayez une autre caméra.",
            );
            console.error(err);
          });
      };

      return () => clearTimeout(timer);
    }, [selectedCameraId]);

    const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (manualIsbn.trim()) {
        onScan(manualIsbn.trim());
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden relative shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-black/5 flex justify-between items-center bg-paper/50">
            <div>
              <h3 className="text-xl font-serif italic">Scanner un livre</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                Placez le code-barres dans le cadre
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <Plus className="rotate-45" size={20} />
            </button>
          </div>

          {/* Scanner */}
          <div className="p-5">
            <div
              id="reader"
              className="w-full aspect-[4/3] bg-black rounded-[32px] overflow-hidden shadow-inner relative"
            >
              <div className="absolute inset-0 border-2 border-accent/30 rounded-[32px] pointer-events-none z-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[130px] border-2 border-accent rounded-lg shadow-[0_0_0_999px_rgba(0,0,0,0.5)]"></div>
              </div>
            </div>

            {/* Sélecteur de caméra */}
            {cameras.length > 1 && (
              <div className="mt-3">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1 block">
                  Changer de caméra
                </label>
                <select
                  className="w-full p-2 bg-paper rounded-xl border border-black/5 text-xs"
                  value={selectedCameraId || ""}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                >
                  {cameras.map((camera, index) => (
                    <option key={camera.id || index} value={camera.id}>
                      {camera.label || `Caméra ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 text-[11px] text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Saisie manuelle */}
            <div className="mt-4 pt-4 border-t border-black/5">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2 text-center">
                Ou saisissez le code manuellement
              </p>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ISBN"
                  className="flex-1 p-3 bg-paper rounded-xl border border-black/5 focus:outline-none focus:border-accent/30 text-xs"
                  value={manualIsbn}
                  onChange={(e) => setManualIsbn(e.target.value)}
                />

                <button
                  type="submit"
                  disabled={!manualIsbn.trim()}
                  className="bg-accent text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30 transition-opacity"
                >
                  OK
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default ScannerModal;
