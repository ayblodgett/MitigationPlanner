import { useEffect } from "react";

export function useTimelineZoom(containerRef, zoom, onZoomChange) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.target.closest(".timeline-scroll-area")) {
        e.preventDefault();

        const delta = -Math.sign(e.deltaY);
        const newZoom = Math.max(1, Math.min(8, zoom + delta));

        if (newZoom !== zoom) {
          const scrollLeft = container.scrollLeft;
          const scrollWidth = container.scrollWidth;
          const clientWidth = container.clientWidth;
          const scrollRatio = scrollLeft / (scrollWidth - clientWidth);

          onZoomChange(newZoom);

          requestAnimationFrame(() => {
            const newScrollWidth = container.scrollWidth;
            const newClientWidth = container.clientWidth;
            container.scrollLeft =
              scrollRatio * (newScrollWidth - newClientWidth);
          });
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [zoom, onZoomChange, containerRef]);
}
