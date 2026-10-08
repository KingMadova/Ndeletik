"use client";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";

type Props = {
  imageSrc: string;
  aspect: number;
  onConfirm: (blob: Blob) => void;
  onClose: () => void;
};

export function CropModal({ imageSrc, aspect, onConfirm, onClose }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-soft overflow-hidden flex flex-col max-h-[90vh] border border-line">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="text-base font-display font-bold text-ink">Ajuster l'image</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-soft text-muted">
            <X size={18} />
          </button>
        </div>
        <div className="relative bg-ink h-[300px] sm:h-[350px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="px-5 py-4 space-y-4 bg-soft">
          <div className="flex items-center gap-3">
            <ZoomOut size={16} className="text-muted" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <ZoomIn size={16} className="text-muted" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:bg-surface transition-colors">
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-yekola-gradient hover:opacity-90 text-white text-sm font-semibold disabled:opacity-50 shadow-soft transition-all"
            >
              {loading ? "Traitement..." : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}