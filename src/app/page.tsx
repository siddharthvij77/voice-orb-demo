"use client";

import { Persona, type PersonaState } from "@/components/ai-elements/persona";
import { BrandedOrb, CompanyLogo } from "@/components/BrandedOrb";
import { useState, useCallback } from "react";

const variants = ["branded", "obsidian", "mana", "opal", "halo"] as const;
type Variant = (typeof variants)[number];

const bgColors = [
  { name: "Black", value: "#000000" },
  { name: "Dark Gray", value: "#1a1a1a" },
  { name: "Charcoal", value: "#2d2d2d" },
  { name: "Navy", value: "#0a1628" },
  { name: "Deep Blue", value: "#0f172a" },
  { name: "Green", value: "#064e3b" },
  { name: "Forest", value: "#14532d" },
  { name: "Purple", value: "#2e1065" },
  { name: "Wine", value: "#450a0a" },
  { name: "Midnight", value: "#020617" },
] as const;

export default function Home() {
  const [state, setState] = useState<PersonaState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [variant, setVariant] = useState<Variant>("branded");
  const [orbSize, setOrbSize] = useState(280);
  const [showControls, setShowControls] = useState(true);
  const [showStatus, setShowStatus] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  const [bgColor, setBgColor] = useState("#000000");

  // Color filters (for Persona variants)
  const [grayscale, setGrayscale] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [invert, setInvert] = useState(0);

  const filterStyle = {
    filter: `grayscale(${grayscale}%) hue-rotate(${hueRotate}deg) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) invert(${invert}%)`,
  };

  const resetFilters = () => {
    setGrayscale(0);
    setHueRotate(0);
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setInvert(0);
  };

  const presetBlackWhite = () => {
    setGrayscale(100);
    setHueRotate(0);
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setInvert(0);
  };

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      setIsListening(true);
      setState("listening");

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalized = Math.min(average / 128, 1);

        if (normalized > 0.15) {
          setState("speaking");
        } else {
          setState("listening");
        }

        requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, []);

  const isBranded = variant === "branded";

  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-8 relative transition-colors duration-300" style={{ backgroundColor: bgColor }}>
      {/* Main Orb */}
      {isBranded ? (
        <BrandedOrb size={orbSize} showLogo={showLogo} bgColor={bgColor} />
      ) : (
        <>
          <div style={{ width: orbSize, height: orbSize, ...filterStyle }}>
            <Persona state={state} variant={variant} className="w-full h-full" />
          </div>

          {/* Start Button or Status for Persona */}
          {!isListening ? (
            <button
              onClick={startListening}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-lg font-medium transition-colors border border-white/20"
            >
              Click to Start Listening
            </button>
          ) : (
            showStatus && (
              <div className="text-white/60 text-sm">
                {state === "speaking" ? "Speaking detected..." : "Listening..."}
              </div>
            )
          )}
        </>
      )}

      {/* Toggle Controls Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed top-4 right-4 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg text-sm transition-colors z-10"
      >
        {showControls ? "Hide Controls" : "Show Controls"}
      </button>

      {/* Control Panel */}
      {showControls && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex gap-6 max-w-4xl overflow-x-auto">
          {/* Left Column - Basic Controls */}
          <div className="flex flex-col gap-4 min-w-[280px]">
            {/* Variant Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm font-medium flex items-center gap-2">
                Variant
                {variant === "branded" && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Custom</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVariant(v)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                      variant === v
                        ? "bg-white text-black"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {v === "branded" && (
                      <CompanyLogo className="w-4 h-4" />
                    )}
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Slider */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm font-medium">
                Size: {orbSize}px
              </label>
              <input
                type="range"
                min="100"
                max="500"
                value={orbSize}
                onChange={(e) => setOrbSize(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            {/* Background Color */}
            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-sm font-medium">Background</label>
              <div className="flex flex-wrap gap-2">
                {bgColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setBgColor(color.value)}
                    title={color.name}
                    className={`w-7 h-7 rounded-full transition-all border-2 ${
                      bgColor === color.value
                        ? "border-white scale-110"
                        : "border-white/20 hover:border-white/50"
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            {/* State Preview (only for Persona) */}
            {!isBranded && (
              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm font-medium">Preview State</label>
                <div className="flex flex-wrap gap-2">
                  {(["idle", "listening", "thinking", "speaking", "asleep"] as const).map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => setState(s)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${
                          state === s
                            ? "bg-white/30 text-white"
                            : "bg-white/10 text-white/50 hover:bg-white/20"
                        }`}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Logo overlay toggle (only for branded) */}
            {isBranded && (
              <div className="flex items-center gap-3">
                <label className="text-white/70 text-sm font-medium">Show Logo Overlay</label>
                <button
                  onClick={() => setShowLogo(!showLogo)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    showLogo ? "bg-white/40" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      showLogo ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Toggle Status (only for Persona) */}
            {!isBranded && (
              <div className="flex items-center gap-3">
                <label className="text-white/70 text-sm font-medium">Show Status</label>
                <button
                  onClick={() => setShowStatus(!showStatus)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    showStatus ? "bg-white/40" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      showStatus ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Color Filters (only for Persona variants) */}
          {!isBranded && (
            <div className="flex flex-col gap-3 min-w-[280px] border-l border-white/10 pl-6">
              <div className="flex items-center justify-between">
                <label className="text-white/70 text-sm font-medium">Color Filters</label>
                <div className="flex gap-2">
                  <button
                    onClick={presetBlackWhite}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white/70 rounded text-xs"
                  >
                    B&W
                  </button>
                  <button
                    onClick={resetFilters}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white/70 rounded text-xs"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Grayscale */}
              <div className="flex flex-col gap-1">
                <label className="text-white/50 text-xs">Grayscale: {grayscale}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={grayscale}
                  onChange={(e) => setGrayscale(Number(e.target.value))}
                  className="w-full accent-white h-1"
                />
              </div>

              {/* Hue Rotate */}
              <div className="flex flex-col gap-1">
                <label className="text-white/50 text-xs">Hue Rotate: {hueRotate}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hueRotate}
                  onChange={(e) => setHueRotate(Number(e.target.value))}
                  className="w-full accent-white h-1"
                />
              </div>

              {/* Brightness */}
              <div className="flex flex-col gap-1">
                <label className="text-white/50 text-xs">Brightness: {brightness}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-white h-1"
                />
              </div>

              {/* Contrast */}
              <div className="flex flex-col gap-1">
                <label className="text-white/50 text-xs">Contrast: {contrast}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-white h-1"
                />
              </div>

              {/* Saturate */}
              <div className="flex flex-col gap-1">
                <label className="text-white/50 text-xs">Saturate: {saturate}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturate}
                  onChange={(e) => setSaturate(Number(e.target.value))}
                  className="w-full accent-white h-1"
                />
              </div>

              {/* Invert */}
              <div className="flex flex-col gap-1">
                <label className="text-white/50 text-xs">Invert: {invert}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={invert}
                  onChange={(e) => setInvert(Number(e.target.value))}
                  className="w-full accent-white h-1"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
