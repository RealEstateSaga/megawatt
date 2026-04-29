import { useEffect, useRef } from "react";

export default function Grain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawGrain = () => {
      frame++;
      if (frame % 2 !== 0) {
        animationId = requestAnimationFrame(drawGrain);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Dark specks on white — paper texture
        const val = Math.random() * 80;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 14;
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(drawGrain);
    };

    resize();
    window.addEventListener("resize", resize);
    drawGrain();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none opacity-[0.02]"
    />
  );
}
