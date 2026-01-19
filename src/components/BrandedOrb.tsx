"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type OrbState = "idle" | "listening" | "speaking";

interface BrandedOrbProps {
  size?: number;
  showLogo?: boolean;
  bgColor?: string;
}

// Your company logo as a component
const CompanyLogo = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    viewBox="0 0 151 151"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M26.2379 125.191C25.2441 126.197 16.4939 113.369 15.8486 112.143C-0.0645075 82.0461 34.2267 66.1975 57.9995 60.8028C73.6545 57.2408 123.872 54.2466 123.885 31.1965C123.885 24.5112 116.477 18.6003 117.019 18.084C117.444 17.671 125.575 24.6532 126.285 25.3759C147.27 46.9547 126.879 64.9198 104.538 70.3403C82.8048 75.606 10.0022 71.3083 19.6687 113.046C20.4818 116.582 26.7283 124.7 26.2379 125.191Z"
      fill="currentColor"
    />
    <path
      d="M48.6168 140.678C25.7474 131.979 14.9838 108.942 40.1505 94.1515C59.8837 82.549 83.9146 86.4595 105.481 81.6069C127.137 76.7413 147.967 62.2092 136.158 37.4297C148.651 55.9627 148.561 75.9799 128.595 88.7955C105.571 103.586 77.7198 95.4292 53.5598 104.102C32.0584 111.82 28.4576 128.017 48.6168 140.678Z"
      fill="currentColor"
    />
    <path
      d="M9.0342 95.078C-2.01332 68.3368 16.7004 50.5782 40.1118 42.0474C54.218 36.8979 69.2406 35.4137 83.463 31.1934C92.3681 28.5477 117.019 20.6234 100.667 9.47266C120.181 15.6675 124.788 29.7221 104.255 39.5178C86.896 47.8034 65.6915 46.7839 47.2359 51.7527C27.2187 57.1215 4.22027 70.8535 9.0342 95.078Z"
      fill="currentColor"
    />
    <path
      d="M66.2465 145.413C55.9346 145.632 39.6215 136.882 45.0936 124.466C56.0121 99.7127 124.594 119.291 142.469 83.748C145.476 77.7596 146.018 71.9132 146.69 65.3828C152.149 91.6465 136.958 108.657 113.031 115.832C100.138 119.691 86.8445 119.756 73.9772 122.814C58.6836 126.467 42.8996 136.495 66.2465 145.413Z"
      fill="currentColor"
    />
    <path
      d="M6.45288 66.2467C8.4404 41.1703 26.896 29.684 48.72 22.689C54.5277 20.8305 89.761 13.3321 90.716 9.15059C91.271 6.72427 88.7931 7.25341 87.7735 6.02734C106.423 8.75051 103.351 16.2876 88.3155 21.8372C59.5094 32.4459 16.5583 28.5741 6.45288 66.2467Z"
      fill="currentColor"
    />
    <path
      d="M74.558 141.671C73.8868 142.716 73.7191 143.671 74.3902 144.807C75.5904 146.82 79.1525 147.007 79.1525 147.143C61.2906 146.769 58.1028 136.702 76.2486 130.688C86.2379 127.371 97.7113 126.622 107.984 123.706C125.227 118.801 139.888 109.857 145.838 92.0859C142.405 111.806 130.196 123.564 111.83 130.133C105.61 132.34 76.9327 137.967 74.558 141.671Z"
      fill="currentColor"
    />
    <path
      d="M86.3668 6.1318C86.6378 6.38992 86.8314 6.95779 86.6895 7.33206C85.6054 10.1068 56.141 15.9404 51.198 17.4374C38.1242 21.3867 25.8119 26.8201 17.2166 37.8547C25.3473 22.9999 38.8986 16.5598 54.5536 12.1718C57.9607 11.2168 78.8168 7.47403 79.5912 6.45445C79.9525 5.97693 78.1328 5.78334 78.3006 5.17676C80.0816 5.20257 85.0633 4.89283 86.3668 6.1318Z"
      fill="currentColor"
    />
    <path
      d="M88.11 145.326C87.9389 145.385 87.8581 145.582 87.939 145.744L88.1994 146.264C84.9342 146.845 77.5649 146.6 83.5919 142.741C94.8202 135.539 111.869 136.172 126.453 125.369C128.414 123.916 132.635 119.291 132.932 119.6C133.59 120.272 124.349 129.396 123.471 130.145C112.682 139.283 100.991 140.882 88.11 145.326Z"
      fill="currentColor"
    />
    <path
      d="M77.4359 5.16406C77.7069 6.36432 75.5516 6.39013 74.7902 6.59663C63.0199 9.69406 50.1784 9.83603 39.1567 16.3406C50.3849 8.86808 63.9879 5.39637 77.4359 5.16406Z"
      fill="currentColor"
    />
    <path
      d="M105.829 140.676C101.454 143.192 96.2141 144.677 91.2065 145.399L105.829 140.676Z"
      fill="currentColor"
    />
  </svg>
);

export function BrandedOrb({ size = 300, showLogo = false, bgColor = "#000000" }: BrandedOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timeRef = useRef(0);
  const [state, setState] = useState<OrbState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsPermissionGranted(true);
      setState("listening");

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const normalized = Math.min(average / 128, 1);
          setAudioLevel(normalized);

          if (normalized > 0.15) {
            setState("speaking");
          } else {
            setState("listening");
          }
        }
        requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      // Clear canvas with transparency
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.42;

      // Animation speed based on audio level
      const baseSpeed = 0.01;
      const speedMultiplier = 1 + audioLevel * 4;
      timeRef.current += baseSpeed * speedMultiplier;
      const time = timeRef.current;

      // Helper function to draw a curved stripe that spans the full circle
      const drawStripe = (
        yOffset: number,
        thickness: number,
        waveAmp: number,
        phaseOffset: number
      ) => {
        ctx.beginPath();

        const segments = 120;
        const points: { x: number; y: number; thickness: number }[] = [];

        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          // Map t to angle for spherical x positioning - full semicircle
          const angle = (t - 0.5) * Math.PI;
          const x = centerX + Math.sin(angle) * radius;

          // Spherical factor - how "visible" this part of sphere is
          const sphereFactor = Math.cos(angle);

          // More organic flowing wave with multiple harmonics
          const wave =
            Math.sin(t * Math.PI * 2 + time + phaseOffset) * waveAmp +
            Math.sin(t * Math.PI * 3.5 + time * 0.7 + phaseOffset) * waveAmp * 0.4 +
            Math.sin(t * Math.PI * 1.2 + time * 1.3 + phaseOffset) * waveAmp * 0.25;

          // Y position: base offset + wave, compressed by sphere factor
          const y = centerY + (yOffset + wave) * sphereFactor;

          // Thickness tapers at edges but stays fuller
          const adjustedThickness = thickness * Math.pow(sphereFactor, 0.7);

          points.push({ x, y, thickness: adjustedThickness });
        }

        // Draw top edge
        ctx.moveTo(points[0].x, points[0].y - points[0].thickness / 2);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y - points[i].thickness / 2);
        }

        // Draw bottom edge in reverse
        for (let i = points.length - 1; i >= 0; i--) {
          ctx.lineTo(points[i].x, points[i].y + points[i].thickness / 2);
        }

        ctx.closePath();
        ctx.fill();
      };

      // Draw background circle matching page background
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = bgColor;
      ctx.fill();

      // Clip to circle for the stripes
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = "#ffffff";

      // Draw 5 flowing stripes - more wavy, covering more area
      const baseAmp = radius * 0.18 + audioLevel * radius * 0.12;
      const baseThickness = radius * 0.16 + audioLevel * radius * 0.03;

      // Stripe y-offsets - spread to cover the sphere
      const offsets = [
        -radius * 0.6,
        -radius * 0.3,
        0,
        radius * 0.3,
        radius * 0.6,
      ];

      offsets.forEach((offset, i) => {
        drawStripe(offset, baseThickness, baseAmp, i * 0.7);
      });

      // Thin crescent edges to complete the globe look
      const crescentOffset = radius * (0.06 + audioLevel * 0.02);

      // Left crescent
      ctx.beginPath();
      ctx.arc(
        centerX - crescentOffset,
        centerY,
        radius * 0.98,
        Math.PI * 0.5,
        Math.PI * 1.5
      );
      ctx.arc(centerX, centerY, radius, Math.PI * 1.5, Math.PI * 0.5, true);
      ctx.closePath();
      ctx.fill();

      // Right crescent
      ctx.beginPath();
      ctx.arc(
        centerX + crescentOffset,
        centerY,
        radius * 0.98,
        -Math.PI * 0.5,
        Math.PI * 0.5
      );
      ctx.arc(centerX, centerY, radius, Math.PI * 0.5, -Math.PI * 0.5, true);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Subtle outer glow when speaking
      if (audioLevel > 0.1) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
        const glowGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius,
          centerX,
          centerY,
          radius + 30
        );
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${audioLevel * 0.4})`);
        glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = glowGradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [size, state, audioLevel, bgColor]);

  return (
    <div className="flex flex-col items-center gap-8 relative">
      {/* Canvas Orb */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="cursor-pointer"
          onClick={!isPermissionGranted ? startListening : undefined}
        />
        {/* Optional logo overlay */}
        {showLogo && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0.9 }}
          >
            <CompanyLogo
              className="text-white"
              style={{ width: size * 0.8, height: size * 0.8 }}
            />
          </div>
        )}
      </div>

      {!isPermissionGranted && (
        <button
          onClick={startListening}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-lg font-medium transition-colors border border-white/20"
        >
          Click to Start Listening
        </button>
      )}
      {isPermissionGranted && (
        <div className="text-white/60 text-sm">
          {state === "speaking" ? "Speaking detected..." : "Listening..."}
        </div>
      )}
    </div>
  );
}

export { CompanyLogo };
