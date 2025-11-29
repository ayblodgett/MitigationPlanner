import { useEffect } from "react";

export function useTimelineZoom(containerRef, zoom, onZoomChange, minZoom = 1) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.target.closest(".timeline-scroll-area")) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();

          const delta = -Math.sign(e.deltaY);
          const newZoom = Math.max(minZoom, Math.min(19, zoom + delta));

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
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [zoom, onZoomChange, containerRef, minZoom]);
}
