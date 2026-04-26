import React, { useEffect, useRef } from "react";

type Props = { html: string; filterKey: string };

export function LeafletMap({ html, filterKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    el.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    iframe.setAttribute("title", "Mapa XICO");
    iframe.style.cssText = "width:100%;height:100%;border:none;background:#0a0a0a;display:block;";
    el.appendChild(iframe);
    return () => {
      el.innerHTML = "";
      URL.revokeObjectURL(url);
    };
  }, [html, filterKey]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", background: "#0a0a0a", overflow: "hidden" }}
    />
  );
}

