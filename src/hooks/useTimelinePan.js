import { useState, useEffect } from "react";

export function useTimelinePan(containerRef) {
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, scrollLeft: 0 });

  const handleMouseDown = (e) => {
    if (
      e.target.closest(".ability-block") ||
      e.target.closest("button") ||
      e.target.closest(".frozen-label")
    ) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    setIsPanning(true);
    setPanStart({
      x: e.clientX,
      scrollLeft: container.scrollLeft,
    });

    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;

    const container = containerRef.current;
    if (!container) return;

    const dx = e.clientX - panStart.x;
    container.scrollLeft = panStart.scrollLeft - dx;
  };

  const handleMouseUp = () => {
    if (!isPanning) return;

    const container = containerRef.current;
    if (container) {
      container.style.cursor = "grab";
      container.style.userSelect = "";
    }

    setIsPanning(false);
  };

  useEffect(() => {
    if (isPanning) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isPanning, panStart]);

  return { isPanning, handleMouseDown };
}
