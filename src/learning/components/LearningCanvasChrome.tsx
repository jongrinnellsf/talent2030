import type { ReactNode } from "react";
import { AcmeWordmark } from "../../components/brand/AcmeWordmark";

type LearningCanvasChromeProps = {
  children: ReactNode;
  slideIndex?: number;
  slideTotal?: number;
};

export function LearningCanvasChrome({
  children,
  slideIndex,
  slideTotal,
}: LearningCanvasChromeProps) {
  const showSlideIndex =
    slideIndex != null && slideTotal != null && slideTotal > 0;

  return (
    <div className="learning-canvas-chrome">
      <div className="learning-canvas-chrome__logo" aria-hidden>
        <AcmeWordmark size="compact" className="learning-canvas-chrome__wordmark" />
      </div>
      <div className="learning-canvas-chrome__body">{children}</div>
      {showSlideIndex && (
        <p className="learning-canvas-chrome__slide-index" aria-label={`Slide ${slideIndex} of ${slideTotal}`}>
          <span className="learning-canvas-chrome__slide-index-current">{slideIndex}</span>
          <span className="learning-canvas-chrome__slide-index-sep">/</span>
          <span className="learning-canvas-chrome__slide-index-total">{slideTotal}</span>
        </p>
      )}
    </div>
  );
}
