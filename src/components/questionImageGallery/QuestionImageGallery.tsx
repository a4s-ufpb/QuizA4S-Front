import { useState } from "react";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
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

  if (images.length === 0) {
    return null;
  }

  const current = Math.min(index, images.length - 1);

  function goTo(newIndex: number) {
    const total = images.length;
    setIndex(((newIndex % total) + total) % total);
  }

  return (
    <div className={`question-image-gallery ${className ?? ""}`}>
      {images.length > 1 && (
        <button
          type="button"
          className="question-image-gallery-arrow left"
          onClick={() => goTo(current - 1)}
          aria-label="Imagem anterior"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <img src={images[current]} alt={alt ?? "imagem da questão"} loading="lazy" />

      {images.length > 1 && (
        <button
          type="button"
          className="question-image-gallery-arrow right"
          onClick={() => goTo(current + 1)}
          aria-label="Próxima imagem"
        >
          <ChevronRight size={20} />
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
  );
};

export default QuestionImageGallery;
