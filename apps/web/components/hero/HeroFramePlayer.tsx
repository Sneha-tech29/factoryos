"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Compass, Layers, Eye, RefreshCw } from "lucide-react";
import { useReducedMotion } from "@/lib/motion";

interface HeroFramePlayerProps {
  pointerX?: number; // Normalized -1 to 1
  pointerY?: number; // Normalized -1 to 1
  onFrameChange?: (frame: number) => void;
}

const TOTAL_FRAMES = 50;

export function HeroFramePlayer({ pointerX = 0, pointerY = 0, onFrameChange }: HeroFramePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  // Playback state
  const [isPlaying, setIsPlaying] = useState(!reducedMotion);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [cameraSector, setCameraSector] = useState("FACILITY EXTERIOR");

  // In-memory cache of HTMLImageElements
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(1);
  const targetFrameRef = useRef(1);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Sector classification based on cinematic flight
  const getSectorName = (frame: number) => {
    if (frame <= 14) return "SECTOR A // FACILITY EXTERIOR & LOGISTICS";
    if (frame <= 30) return "SECTOR B // ARCHITECTURAL ATRIUM & OPERATIONS";
    return "SECTOR C // PRECISION CNC & OFFSET PRESS FLOOR";
  };

  // Preload frames with progressive prioritization
  useEffect(() => {
    let mounted = true;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let loadedCount = 0;

    // Preload anchor frames first (1, 10, 20, 30, 40, 50) for fast response
    const keyFrames = [1, 10, 20, 25, 30, 40, 50];
    const allFrames = Array.from({ length: TOTAL_FRAMES }, (_, i) => i + 1);
    const loadOrder = [
      ...keyFrames,
      ...allFrames.filter((f) => !keyFrames.includes(f)),
    ];

    loadOrder.forEach((frameNum) => {
      const idx = frameNum - 1;
      const img = new Image();
      const paddedIndex = String(frameNum).padStart(3, "0");
      img.src = `/hero-frames/webp/frame-${paddedIndex}.webp`;

      img.onload = () => {
        if (!mounted) return;
        images[idx] = img;
        loadedCount++;
        const prog = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        setLoadingProgress(prog);

        // Once initial anchor frames are loaded, mark ready
        if (loadedCount >= 6 && !isLoaded) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        // Graceful fallback to static hero background
        console.warn(`Hero frame ${paddedIndex} failed to load.`);
      };
    });

    imagesRef.current = images;

    return () => {
      mounted = false;
    };
  }, []);

  // Canvas render function
  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imagesRef.current[frameIndex - 1];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Subtle faux-3D parallax translation based on cursor
      const parallaxFactorX = reducedMotion ? 0 : pointerX * 14;
      const parallaxFactorY = reducedMotion ? 0 : pointerY * 8;

      ctx.translate(parallaxFactorX, parallaxFactorY);

      // Slight scale-up (1.04) so edge shifts don't expose transparent borders
      const zoom = 1.04;

      // Aspect cover calculation
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = w / h;

      let drawW = w * zoom;
      let drawH = h * zoom;
      let offsetX = (w - drawW) / 2;
      let offsetY = (h - drawH) / 2;

      if (canvasRatio > imgRatio) {
        drawH = drawW / imgRatio;
        offsetY = (h - drawH) / 2;
      } else {
        drawW = drawH * imgRatio;
        offsetX = (w - drawW) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();
    },
    [pointerX, pointerY, reducedMotion]
  );

  // Resize observer for canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      drawFrame(frameRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  // Main animation / cruise loop
  useEffect(() => {
    let rafId: number;
    let forward = true;
    let lastTime = performance.now();
    const fps = 24; // 24 cinematic fps
    const frameInterval = 1000 / fps;

    const loop = (now: number) => {
      const elapsed = now - lastTime;

      if (isPlayingRef.current && !reducedMotion && elapsed >= frameInterval) {
        lastTime = now - (elapsed % frameInterval);

        let next = frameRef.current;
        if (forward) {
          next++;
          if (next >= TOTAL_FRAMES) {
            next = TOTAL_FRAMES;
            forward = false; // Ping-pong smooth turnaround
          }
        } else {
          next--;
          if (next <= 1) {
            next = 1;
            forward = true;
          }
        }

        frameRef.current = next;
        setCurrentFrame(next);
        setCameraSector(getSectorName(next));
        if (onFrameChange) onFrameChange(next);
        drawFrame(next);
      } else if (!isPlayingRef.current) {
        // Redraw on pointer movement even when paused
        drawFrame(frameRef.current);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion, drawFrame, onFrameChange]);

  // Manual scrub handler
  const handleScrub = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const target = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(ratio * (TOTAL_FRAMES - 1)) + 1));

    frameRef.current = target;
    setCurrentFrame(target);
    setCameraSector(getSectorName(target));
    if (onFrameChange) onFrameChange(target);
    drawFrame(target);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden select-none bg-[#061116]"
      aria-label="Interactive 3D cinematic factory fly-through"
    >
      {/* Fallback Static Hero Background while loading */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 pointer-events-none ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundImage: "url('/hero-frames/webp/frame-001.webp')" }}
      />

      {/* Hardware Accelerated Canvas Frame Player */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Atmospheric Industrial Cinematic Overlays */}
      {/* 1. Left Darkening Gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#061116]/95 via-[#061116]/65 to-transparent md:w-[58%] pointer-events-none z-10" />

      {/* 2. Top fade for navbar */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#061116]/90 to-transparent pointer-events-none z-10" />

      {/* 3. Bottom fade into feature strip */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#061116] via-[#061116]/70 to-transparent pointer-events-none z-10" />

      {/* 4. Subtle volumetric cyan-mint ambient spot */}
      <div
        className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-cyan/10 rounded-full blur-[140px] pointer-events-none z-0 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${pointerX * -20}px, ${pointerY * -20}px)`,
        }}
      />

      {/* 5. Precision HUD Camera Telemetry Bar (Bottom-Right overlay) */}
      <div className="absolute bottom-6 right-6 sm:right-12 z-20 hidden sm:flex items-center gap-3 glass-panel px-4 py-2.5 rounded-2xl border border-cyan/25 shadow-2xl backdrop-blur-xl">
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 rounded-lg bg-midnight/80 hover:bg-cyan/20 text-cyan transition-colors focus:outline-none focus:ring-1 focus:ring-cyan"
          title={isPlaying ? "Pause cinematic camera" : "Resume camera flythrough"}
          aria-label={isPlaying ? "Pause cinematic camera" : "Resume camera flythrough"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-cyan" />}
        </button>

        {/* Sector Tag */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan truncate max-w-[200px]">
              {cameraSector}
            </span>
          </div>
          <span className="text-[9px] font-mono text-secondary/70">
            FRAME {String(currentFrame).padStart(3, "0")} / {TOTAL_FRAMES} • 60 FPS HD
          </span>
        </div>

        {/* Interactive Scrub Track */}
        <div
          onClick={handleScrub}
          className="w-28 h-2 bg-midnight/90 rounded-full border border-subtle overflow-hidden cursor-pointer relative group/track"
          title="Click to scrub through factory camera trajectory"
        >
          <div
            className="h-full bg-gradient-to-r from-cyan to-mint rounded-full transition-all duration-75"
            style={{ width: `${(currentFrame / TOTAL_FRAMES) * 100}%` }}
          />
        </div>

        {/* Cinematic Badge */}
        <div className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-cyan/10 border border-cyan/30 text-cyan font-semibold">
          3D FLYTHROUGH
        </div>
      </div>
    </div>
  );
}
