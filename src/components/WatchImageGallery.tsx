import { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface WatchImageGalleryProps {
  images: string[];
  alt: string;
}

export function WatchImageGallery({ images, alt }: WatchImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const validImages = images.filter((img) => img && !failedImages[img]);

  if (!validImages.length) {
    return (
      <div className="photo-placeholder">
        <ImageIcon size={26} strokeWidth={1} />
        <span>Foto em breve</span>
      </div>
    );
  }

  const safeIndex = currentIndex < validImages.length ? currentIndex : 0;
  const currentImage = validImages[safeIndex];
  const hasMultiple = validImages.length > 1;

  function handlePrev(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev <= 0 || prev >= validImages.length ? validImages.length - 1 : prev - 1));
  }

  function handleNext(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev >= validImages.length - 1 ? 0 : prev + 1));
  }

  return (
    <div className="image-gallery">
      <img
        src={currentImage}
        alt={`${alt} - foto ${safeIndex + 1}`}
        loading="lazy"
        onError={() => setFailedImages((prev) => ({ ...prev, [currentImage]: true }))}
      />

      {hasMultiple && (
        <>
          <button
            type="button"
            className="gallery-nav prev"
            onClick={handlePrev}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="gallery-nav next"
            onClick={handleNext}
            aria-label="Próxima foto"
          >
            <ChevronRight size={16} />
          </button>
          <div className="gallery-dots">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`gallery-dot ${idx === safeIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Ir para foto ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
