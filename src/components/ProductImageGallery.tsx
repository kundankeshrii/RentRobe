import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PLACEHOLDER_IMG = "/placeholder.svg";

interface ProductImageGalleryProps {
  images: string[];
  name: string;
  isNew?: boolean;
}

const ProductImageGallery = ({ images, name, isNew }: ProductImageGalleryProps) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const handleImgError = useCallback((index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  }, []);

  const getImgSrc = (index: number) => failedImages.has(index) ? PLACEHOLDER_IMG : images[index];
  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img
          src={getImgSrc(imgIndex)}
          alt={name}
          onError={() => handleImgError(imgIndex)}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
              disabled={imgIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setImgIndex((i) => Math.min(images.length - 1, i + 1))}
              disabled={imgIndex === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
        {isNew && (
          <div className="absolute top-4 left-4">
            <span className="bg-primary text-primary-foreground text-xs px-3 py-1.5 tracking-widest uppercase font-body font-medium">
              New
            </span>
          </div>
        )}
        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-background/70 backdrop-blur-sm px-2.5 py-1 text-xs font-body text-foreground">
          {imgIndex + 1} / {images.length}
        </div>
      </div>
      {/* Thumbnails */}
      <div className="flex gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setImgIndex(i)}
            className={`w-20 h-24 overflow-hidden border-2 transition-colors ${
              imgIndex === i ? "border-primary" : "border-transparent hover:border-border"
            }`}
          >
            <img src={getImgSrc(i)} alt="" onError={() => handleImgError(i)} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
