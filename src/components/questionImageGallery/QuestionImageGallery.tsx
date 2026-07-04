import { useState } from "react";
import { BsChevronLeft, BsChevronRight, BsZoomIn, BsXLg } from "react-icons/bs";
import "./QuestionImageGallery.css";

interface QuestionImageGalleryProps {
  images: string[];
  className?: string;
  alt?: string;
}

const QuestionImageGallery = ({
  images,
  className,
  alt,
}: QuestionImageGalleryProps) => {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return null;
  }

  const current = Math.min(index, images.length - 1);

  function goTo(newIndex: number) {
    const total = images.length;
    setIndex(((newIndex % total) + total) % total);
  }

  return (
    <>
      <div className={`question-image-gallery ${className ?? ""}`}>
        {images.length > 1 && (
          <button
            type="button"
            className="question-image-gallery-arrow left"
            onClick={() => goTo(current - 1)}
            aria-label="Imagem anterior"
          >
            <BsChevronLeft size={20} />
          </button>
        )}

        <img src={images[current]} alt={alt ?? "imagem da questão"} loading="lazy" />

        <button
          type="button"
          className="question-image-gallery-zoom"
          onClick={() => setLightboxOpen(true)}
          aria-label="Ampliar imagem"
          title="Ampliar imagem"
        >
          <BsZoomIn size={18} />
        </button>

        {images.length > 1 && (
          <button
            type="button"
            className="question-image-gallery-arrow right"
            onClick={() => goTo(current + 1)}
            aria-label="Próxima imagem"
          >
            <BsChevronRight size={20} />
          </button>
        )}

        {images.length > 1 && (
          <div className="question-image-gallery-dots">
            {images.map((_, i) => (
              <span
                key={i}
                className={`question-image-gallery-dot ${i === current ? "active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="question-image-lightbox"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="question-image-lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            aria-label="Fechar"
          >
            <BsXLg size={22} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className="question-image-lightbox-arrow left"
              onClick={(e) => {
                e.stopPropagation();
                goTo(current - 1);
              }}
              aria-label="Imagem anterior"
            >
              <BsChevronLeft size={30} />
            </button>
          )}

          <img
            src={images[current]}
            alt={alt ?? "imagem da questão"}
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              className="question-image-lightbox-arrow right"
              onClick={(e) => {
                e.stopPropagation();
                goTo(current + 1);
              }}
              aria-label="Próxima imagem"
            >
              <BsChevronRight size={30} />
            </button>
          )}

          {images.length > 1 && (
            <div
              className="question-image-gallery-dots lightbox"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`question-image-gallery-dot ${i === current ? "active" : ""}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default QuestionImageGallery;
