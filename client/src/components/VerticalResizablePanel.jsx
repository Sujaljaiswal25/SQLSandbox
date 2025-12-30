import { useState, useRef, useEffect } from "react";

const VerticalResizablePanel = ({
  topPanel,
  bottomPanel,
  defaultTopHeight = 50,
  minTopHeight = 20,
  maxTopHeight = 80,
}) => {
  const [topHeight, setTopHeight] = useState(defaultTopHeight);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newTopHeight =
        ((e.clientY - containerRect.top) / containerRect.height) * 100;

      if (newTopHeight >= minTopHeight && newTopHeight <= maxTopHeight) {
        setTopHeight(newTopHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, minTopHeight, maxTopHeight]);

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      {/* Top Panel */}
      <div style={{ height: `${topHeight}%` }} className="overflow-hidden">
        {topPanel}
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={() => setIsDragging(true)}
        className="h-1 bg-gray-200 hover:bg-blue-500 cursor-ns-resize transition-colors relative group"
      >
        <div className="absolute inset-x-0 -top-1 -bottom-1" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-col gap-0.5">
            <div className="h-0.5 w-6 bg-white rounded"></div>
            <div className="h-0.5 w-6 bg-white rounded"></div>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div
        style={{ height: `${100 - topHeight}%` }}
        className="overflow-hidden"
      >
        {bottomPanel}
      </div>
    </div>
  );
};

export default VerticalResizablePanel;
