"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type OrbState = "idle" | "listening" | "speaking";

interface VoiceOrbProps {
  size?: number;
}

export function VoiceOrb({ size = 300 }: VoiceOrbProps) {
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
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.35;

      // Animation speed based on audio level
      const baseSpeed = 0.006;
      const speedMultiplier = 1 + audioLevel * 6;
      timeRef.current += baseSpeed * speedMultiplier;
      const time = timeRef.current;

      // Subtle outer ring/shadow
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a1a";
      ctx.fill();

      // Clip to sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      // Base grey fill
      ctx.fillStyle = "#8a8a8a";
      ctx.fillRect(0, 0, size, size);

      // Soft moving highlights - multiple layers for smooth fluid look
      const highlights = [
        { speed: 0.7, size: 0.8, opacity: 0.15, offset: 0 },
        { speed: 0.5, size: 0.6, opacity: 0.12, offset: Math.PI * 0.5 },
        { speed: 0.6, size: 0.7, opacity: 0.1, offset: Math.PI },
        { speed: 0.8, size: 0.5, opacity: 0.13, offset: Math.PI * 1.5 },
        { speed: 0.55, size: 0.65, opacity: 0.11, offset: Math.PI * 0.3 },
        { speed: 0.65, size: 0.55, opacity: 0.14, offset: Math.PI * 1.2 },
      ];

      highlights.forEach((h) => {
        const t = time * h.speed + h.offset;

        // Smooth circular/figure-8 motion
        const hx = centerX + Math.sin(t) * radius * 0.4 + Math.sin(t * 1.7) * radius * 0.2;
        const hy = centerY + Math.cos(t * 0.8) * radius * 0.35 + Math.cos(t * 1.3) * radius * 0.15;

        const highlightRadius = radius * h.size;

        const gradient = ctx.createRadialGradient(
          hx, hy, 0,
          hx, hy, highlightRadius
        );

        const intensity = h.opacity + audioLevel * 0.08;
        gradient.addColorStop(0, `rgba(180, 180, 180, ${intensity})`);
        gradient.addColorStop(0.3, `rgba(160, 160, 160, ${intensity * 0.7})`);
        gradient.addColorStop(0.6, `rgba(140, 140, 140, ${intensity * 0.3})`);
        gradient.addColorStop(1, "rgba(138, 138, 138, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      });

      // Darker patches for depth
      const shadows = [
        { speed: 0.4, size: 0.5, opacity: 0.08, offset: Math.PI * 0.7 },
        { speed: 0.5, size: 0.45, opacity: 0.06, offset: Math.PI * 1.8 },
        { speed: 0.45, size: 0.4, opacity: 0.07, offset: Math.PI * 0.2 },
      ];

      shadows.forEach((s) => {
        const t = time * s.speed + s.offset;

        const sx = centerX + Math.cos(t * 1.1) * radius * 0.5 + Math.sin(t * 0.6) * radius * 0.2;
        const sy = centerY + Math.sin(t * 0.9) * radius * 0.4 + Math.cos(t * 1.4) * radius * 0.2;

        const shadowRadius = radius * s.size;

        const gradient = ctx.createRadialGradient(
          sx, sy, 0,
          sx, sy, shadowRadius
        );

        const intensity = s.opacity + audioLevel * 0.04;
        gradient.addColorStop(0, `rgba(70, 70, 70, ${intensity})`);
        gradient.addColorStop(0.5, `rgba(90, 90, 90, ${intensity * 0.5})`);
        gradient.addColorStop(1, "rgba(138, 138, 138, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      });

      // Edge shading for 3D sphere effect
      const edgeGradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.2,
        centerX, centerY, radius
      );
      edgeGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      edgeGradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
      edgeGradient.addColorStop(0.75, "rgba(0, 0, 0, 0.1)");
      edgeGradient.addColorStop(0.9, "rgba(0, 0, 0, 0.25)");
      edgeGradient.addColorStop(1, "rgba(0, 0, 0, 0.45)");

      ctx.fillStyle = edgeGradient;
      ctx.fillRect(0, 0, size, size);

      // Subtle top-left ambient highlight
      const ambientHighlight = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, 0,
        centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.8
      );
      ambientHighlight.addColorStop(0, "rgba(200, 200, 200, 0.08)");
      ambientHighlight.addColorStop(0.5, "rgba(180, 180, 180, 0.03)");
      ambientHighlight.addColorStop(1, "rgba(160, 160, 160, 0)");

      ctx.fillStyle = ambientHighlight;
      ctx.fillRect(0, 0, size, size);

      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [size, state, audioLevel]);

  return (
    <div className="flex flex-col items-center gap-8">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="cursor-pointer"
        onClick={!isPermissionGranted ? startListening : undefined}
      />
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
