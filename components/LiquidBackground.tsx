"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  uniform vec2 uResolution;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      value += amp * noise(p);
      p = rot * p * 2.02 + vec2(7.1, 3.8);
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv - 0.5;
    p.x *= uResolution.x / max(uResolution.y, 1.0);

    float t = uTime * 0.12;
    vec2 mouse = (uMouse - 0.5) * vec2(1.0, -1.0);

    vec2 q = vec2(
      fbm(p * 1.55 + vec2(t * 0.72, -t * 0.34) + mouse * 0.15),
      fbm(p * 1.40 + vec2(-t * 0.44, t * 0.61) - mouse * 0.12)
    );

    vec2 r = vec2(
      fbm(p * 2.25 + 2.3 * q + vec2(1.7, 9.2) + t * 0.28),
      fbm(p * 2.05 + 2.1 * q + vec2(8.3, 2.8) - t * 0.31)
    );

    float f = fbm(p * 2.0 + r * 2.65 + vec2(uScroll * 1.8, -uScroll * 1.1));
    float wave = sin((p.x * 3.2 + p.y * 1.8 + f * 3.5 + uScroll * 7.0) + t * 2.2) * 0.5 + 0.5;
    float ribbon = smoothstep(0.32, 0.76, wave) * smoothstep(0.19, 0.72, f);
    float fold = smoothstep(0.48, 0.68, sin(p.x * 5.0 - p.y * 3.4 + r.x * 5.4 - r.y * 2.6 + t) * 0.5 + 0.5);

    vec3 bg = vec3(0.026, 0.039, 0.044);
    vec3 lime = vec3(0.72, 0.87, 0.54);
    vec3 violet = vec3(0.68, 0.68, 0.87);
    vec3 cyan = vec3(0.70, 0.86, 0.88);

    float mixPhase = 0.5 + 0.5 * sin(uScroll * 6.28318 + t * 0.25);
    vec3 streamColor = mix(violet, lime, clamp(f * 0.9 + mixPhase * 0.26, 0.0, 1.0));
    streamColor = mix(streamColor, cyan, smoothstep(0.74, 1.0, f) * 0.25);

    float mouseGlow = 1.0 - smoothstep(0.0, 0.82, length(p - mouse * 0.55));
    float vignette = 1.0 - smoothstep(0.25, 1.25, length(p));

    vec3 color = bg;
    color += streamColor * ribbon * (0.31 + fold * 0.14);
    color += cyan * fold * ribbon * 0.075;
    color += streamColor * f * 0.065;
    color += mix(lime, violet, mixPhase) * mouseGlow * 0.08;
    color *= 0.78 + vignette * 0.26;

    gl_FragColor = vec4(color, 1.0);
  }
`;

type Cleanup = () => void;

type MotionState = {
  pointerX: number;
  pointerY: number;
  scroll: number;
};

function getScrollProgress() {
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  return Math.min(1, Math.max(0, window.scrollY / max));
}

function startCanvasFallback(host: HTMLDivElement, motionQuery: MediaQueryList, mobile: boolean): Cleanup {
  host.dataset.renderer = "canvas2d";
  const canvas = document.createElement("canvas");
  canvas.className = "liquid-canvas liquid-canvas--fallback";
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    host.dataset.renderer = "css";
    canvas.remove();
    return () => undefined;
  }

  let frame = 0;
  let hidden = document.hidden;
  let width = 1;
  let height = 1;
  let lastPaint = 0;
  let dpr = 1;
  const motion: MotionState = { pointerX: 0.5, pointerY: 0.5, scroll: getScrollProgress() };
  const target: MotionState = { ...motion };
  const startedAt = performance.now();

  const resize = () => {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25, Math.sqrt(1_200_000 / (width * height)));
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(performance.now(), true);
  };

  const onPointer = (event: PointerEvent) => {
    if (motionQuery.matches) return;
    target.pointerX = event.clientX / Math.max(width, 1);
    target.pointerY = event.clientY / Math.max(height, 1);
  };

  const onScroll = () => {
    if (motionQuery.matches) return;
    target.scroll = getScrollProgress();
  };

  const drawBlob = (x: number, y: number, radius: number, inner: string, outer: string) => {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, inner);
    gradient.addColorStop(0.42, outer);
    gradient.addColorStop(1, "rgba(9,9,11,0)");
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };

  const paint = (now: number, force = false) => {
    const minFrameGap = mobile ? 32 : 22;
    if (!force && now - lastPaint < minFrameGap) return;
    lastPaint = now;

    const t = motionQuery.matches ? 0 : (now - startedAt) / 1000;
    const follow = motionQuery.matches ? 1 : 0.055;
    motion.pointerX += (target.pointerX - motion.pointerX) * follow;
    motion.pointerY += (target.pointerY - motion.pointerY) * follow;
    motion.scroll += (target.scroll - motion.scroll) * (motionQuery.matches ? 1 : 0.065);

    context.globalCompositeOperation = "source-over";
    context.fillStyle = "#091015";
    context.fillRect(0, 0, width, height);

    context.globalCompositeOperation = "screen";
    const px = motion.pointerX * width;
    const py = motion.pointerY * height;
    const phase = motion.scroll * Math.PI * 2;
    const base = Math.max(width, height);

    drawBlob(
      width * (0.72 + Math.sin(t * 0.18 + phase) * 0.08),
      height * (0.16 + Math.cos(t * 0.15) * 0.10),
      base * 0.42,
      "rgba(176,177,225,0.35)",
      "rgba(176,177,225,0.13)",
    );
    drawBlob(
      width * (0.14 + Math.cos(t * 0.16 - phase * 0.35) * 0.08),
      height * (0.72 + Math.sin(t * 0.13 + phase * 0.25) * 0.09),
      base * 0.38,
      "rgba(184,222,140,0.30)",
      "rgba(184,222,140,0.10)",
    );
    drawBlob(
      width * (0.48 + Math.sin(t * 0.11 + 1.3) * 0.16),
      height * (0.47 + Math.cos(t * 0.14 - 0.6) * 0.12),
      base * 0.32,
      "rgba(178,219,224,0.24)",
      "rgba(178,219,224,0.08)",
    );
    drawBlob(
      px,
      py,
      base * 0.22,
      "rgba(184,222,140,0.14)",
      "rgba(176,177,225,0.04)",
    );

    // A soft stream across the canvas. It bends with scroll progress and pointer position.
    const stream = context.createLinearGradient(0, 0, width, height);
    stream.addColorStop(0, "rgba(176,177,225,0)");
    stream.addColorStop(0.35, "rgba(176,177,225,0.25)");
    stream.addColorStop(0.62, "rgba(184,222,140,0.23)");
    stream.addColorStop(1, "rgba(184,222,140,0)");
    context.strokeStyle = stream;
    context.lineWidth = Math.max(70, Math.min(190, width * 0.11));
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(-width * 0.12, height * (0.28 + Math.sin(t * 0.14) * 0.06));
    context.bezierCurveTo(
      width * 0.26,
      height * (0.12 + motion.scroll * 0.24),
      width * (0.58 + (motion.pointerX - 0.5) * 0.12),
      height * (0.80 - motion.scroll * 0.28),
      width * 1.12,
      height * (0.53 + Math.cos(t * 0.12) * 0.06),
    );
    context.stroke();
    context.globalCompositeOperation = "source-over";
  };

  const animate = (now: number) => {
    if (hidden || motionQuery.matches) {
      frame = 0;
      return;
    }
    paint(now);
    frame = requestAnimationFrame(animate);
  };

  const onVisibility = () => {
    hidden = document.hidden;
    if (!hidden && !motionQuery.matches && !frame) frame = requestAnimationFrame(animate);
  };
  const onMotionChange = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (motionQuery.matches) {
      target.pointerX = motion.pointerX = 0.5;
      target.pointerY = motion.pointerY = 0.5;
      target.scroll = motion.scroll = 0;
      paint(startedAt, true);
    } else if (!hidden) frame = requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  motionQuery.addEventListener("change", onMotionChange);
  if (!motionQuery.matches) frame = requestAnimationFrame(animate);

  return () => {
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    motionQuery.removeEventListener("change", onMotionChange);
    canvas.remove();
  };
}

export function LiquidBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 899px)").matches;

    // IMPORTANT: probe WebGL2 ourselves before constructing THREE.WebGLRenderer.
    // THREE logs a console.error before throwing when WebGL is unavailable; Next dev
    // turns that console.error into an error overlay. By probing first, WebGL-disabled
    // browsers cleanly take the animated Canvas2D fallback instead.
    const canvas = document.createElement("canvas");
    canvas.className = "liquid-canvas liquid-canvas--webgl";
    canvas.setAttribute("aria-hidden", "true");

    let gl: WebGL2RenderingContext | null;
    try {
      gl = canvas.getContext("webgl2", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: true,
      }) as WebGL2RenderingContext | null;
    } catch {
      gl = null;
    }

    if (!gl) return startCanvasFallback(host, motionQuery, mobile);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl,
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      // Extremely rare: a context was created but Three could not initialize it.
      // Do not leave a broken page; replace it with the non-WebGL renderer.
      return startCanvasFallback(host, motionQuery, mobile);
    }

    host.dataset.renderer = "webgl";
    host.appendChild(canvas);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.35, Math.sqrt(1_500_000 / Math.max(window.innerWidth * window.innerHeight, 1))));
    renderer.setClearColor(0x09090b, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    };

    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointerTarget = new THREE.Vector2(0.5, 0.5);
    const pointerCurrent = new THREE.Vector2(0.5, 0.5);
    let scrollTarget = getScrollProgress();
    let scrollCurrent = scrollTarget;
    let frame = 0;
    let hidden = document.hidden;
    let destroyed = false;
    let fallbackCleanup: Cleanup | undefined;
    let lastRender = 0;
    const startedAt = performance.now();

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.35, Math.sqrt(1_500_000 / Math.max(width * height, 1))));
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());
    };

    const onPointer = (event: PointerEvent) => {
      if (motionQuery.matches) return;
      pointerTarget.set(event.clientX / Math.max(window.innerWidth, 1), event.clientY / Math.max(window.innerHeight, 1));
    };

    const onScroll = () => {
      if (motionQuery.matches) return;
      scrollTarget = getScrollProgress();
    };

    const onVisibility = () => {
      hidden = document.hidden;
      if (!hidden && !frame && !destroyed) frame = requestAnimationFrame(animate);
    };

    const animate = (now = performance.now()) => {
      if (destroyed || hidden) {
        frame = 0;
        return;
      }
      if (!motionQuery.matches && now - lastRender < (mobile ? 32 : 24)) { frame = requestAnimationFrame(animate); return; }
      lastRender = now;
      uniforms.uTime.value = motionQuery.matches ? 0 : (now - startedAt) / 1000;
      pointerCurrent.lerp(pointerTarget, motionQuery.matches ? 1 : 0.055);
      scrollCurrent += (scrollTarget - scrollCurrent) * (motionQuery.matches ? 1 : 0.075);
      uniforms.uMouse.value.copy(pointerCurrent);
      uniforms.uScroll.value = scrollCurrent;
      renderer.render(scene, camera);
      if (!motionQuery.matches) frame = requestAnimationFrame(animate);
      else frame = 0;
    };
    const onMotionChange = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (motionQuery.matches) {
        pointerTarget.set(0.5, 0.5);
        pointerCurrent.copy(pointerTarget);
        scrollTarget = scrollCurrent = 0;
        if (!hidden) animate(startedAt);
      } else if (!hidden) frame = requestAnimationFrame(animate);
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
      fallbackCleanup = startCanvasFallback(host, motionQuery, mobile);
    };

    canvas.addEventListener("webglcontextlost", onContextLost, { once: true });
    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);
    if (motionQuery.matches) {
      pointerTarget.set(0.5, 0.5);
      scrollTarget = scrollCurrent = 0;
    }
    animate();

    return () => {
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      fallbackCleanup?.();
      if (!fallbackCleanup) { geometry.dispose(); material.dispose(); renderer.dispose(); }
      canvas.remove();
    };
  }, []);

  return <div className="liquid-background" ref={hostRef} aria-hidden="true" />;
}
