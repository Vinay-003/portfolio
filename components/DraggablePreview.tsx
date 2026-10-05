"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type PreviewKind = "live" | "learn" | "cliffy";
type DraggablePreviewProps = {
  kind: PreviewKind;
  title: string;
  liveUrl?: string;
  previewMode?: "embedded" | "external";
  previewImage?: string;
  accent?: "lime" | "violet" | "cream";
  active?: boolean;
  preload?: boolean;
};

export function DraggablePreview({ kind, title, liveUrl, previewMode = "embedded", previewImage, accent = "lime", active = false, preload = false }: DraggablePreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<() => void>(() => undefined);
  const [loadLive, setLoadLive] = useState(false);
  // preload is intentionally not an external network request.
  void preload;

  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card || !active) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    let dragging = false;
    let pointerId = -1;
    let originX = 0;
    let originY = 0;
    let baseX = 0;
    let baseY = 0;
    let float: gsap.core.Tween | undefined;
    let x = 0;
    let y = 0;
    let hovering = false;
    const bounds = () => ({
      x: Math.max(0, (root.clientWidth - card.offsetWidth) / 2 + Math.min(root.clientWidth * .1, 60)),
      y: Math.max(0, (root.clientHeight - card.offsetHeight) / 2 + Math.min(root.clientHeight * .1, 50)),
    });
    const stopFloat = () => { float?.kill(); float = undefined; };
    const startFloat = () => {
      stopFloat();
      // Posters with live-preview controls stay still until interaction.
      // A moving button is harder to click and cannot pass stability checks.
      if (kind !== "live" && !motion.matches && fine.matches && !dragging && !hovering && !root.contains(document.activeElement) && !document.hidden) {
        float = gsap.to(card, { y: y - 5, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      }
    };
    const reset = () => {
      stopFloat();
      gsap.killTweensOf(card);
      x = y = 0;
      gsap.to(card, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1,
        duration: motion.matches ? 0 : .38, ease: "power2.out", onComplete: startFloat });
    };
    resetRef.current = reset;
    const release = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      pointerId = -1;
      root.classList.remove("is-dragging");
      if (card.hasPointerCapture(event.pointerId)) {
        try { card.releasePointerCapture(event.pointerId); } catch { /* capture may already be lost */ }
      }
      reset();
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0 || (event.target as Element).closest("button, a, input, textarea, select, [contenteditable]")) return;
      dragging = true;
      pointerId = event.pointerId;
      originX = event.clientX;
      originY = event.clientY;
      baseX = x;
      baseY = y;
      stopFloat();
      gsap.killTweensOf(card);
      root.classList.add("is-dragging");
      try { card.setPointerCapture(event.pointerId); } catch { dragging = false; root.classList.remove("is-dragging"); }
    };
    const onMove = (event: PointerEvent) => {
      if (dragging && event.pointerId === pointerId) {
        const limit = bounds();
        x = gsap.utils.clamp(-limit.x, limit.x, baseX + event.clientX - originX);
        y = gsap.utils.clamp(-limit.y, limit.y, baseY + event.clientY - originY);
        gsap.set(card, { x, y, rotationX: motion.matches ? 0 : gsap.utils.clamp(-5, 5, -(event.clientY - originY) * .02),
          rotationY: motion.matches ? 0 : gsap.utils.clamp(-6, 6, (event.clientX - originX) * .02) });
      } else if (!motion.matches && fine.matches && event.pointerType === "mouse") {
        if ((event.target as Element).closest("button, a, iframe")) return;
        const rect = root.getBoundingClientRect();
        gsap.to(card, { rotationY: ((event.clientX - rect.left) / rect.width - .5) * 7,
          rotationX: (.5 - (event.clientY - rect.top) / rect.height) * 5, duration: .25, overwrite: "auto" });
      }
    };
    const onEnter = () => { hovering = true; stopFloat(); gsap.killTweensOf(card); };
    const onLeave = () => {
      hovering = false;
      if (!dragging) gsap.to(card, { rotationX: 0, rotationY: 0, duration: motion.matches ? 0 : .25, onComplete: startFloat });
    };
    const onFocus = () => { stopFloat(); gsap.killTweensOf(card); };
    const onBlur = (event: FocusEvent) => { if (!root.contains(event.relatedTarget as Node)) startFloat(); };
    const onVisibility = () => { if (document.hidden) { stopFloat(); gsap.killTweensOf(card); } else reset(); };
    const onMotion = () => reset();
    const onLost = (event: PointerEvent) => release(event);
    card.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("focusout", onBlur);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);
    card.addEventListener("lostpointercapture", onLost);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    fine.addEventListener("change", onMotion);
    startFloat();
    return () => {
      if (pointerId >= 0 && card.hasPointerCapture(pointerId)) {
        try { card.releasePointerCapture(pointerId); } catch { /* already released */ }
      }
      card.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("focusout", onBlur);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerup", release);
      card.removeEventListener("pointercancel", release);
      card.removeEventListener("lostpointercapture", onLost);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
      fine.removeEventListener("change", onMotion);
      root.classList.remove("is-dragging");
      stopFloat();
      gsap.killTweensOf(card);
      gsap.set(card, { clearProps: "transform" });
      resetRef.current = () => undefined;
    };
  }, [active, kind]);

  return (
    <div className={`drag-preview drag-preview--${accent}`} ref={rootRef} aria-hidden={!active} inert={!active}>
      <div className="drag-preview__card" ref={cardRef}>
        {kind === "live" ? <LiveWebsite key={`${previewMode}:${previewImage}`} title={title} url={liveUrl} previewMode={previewMode} previewImage={previewImage} loadLive={loadLive} onLoad={() => setLoadLive(true)} onClose={() => setLoadLive(false)} active={active} /> : null}
        {kind === "learn" ? <LearnSphereVisual /> : null}
        {kind === "cliffy" ? <CliffyVisual /> : null}
        <span className="drag-preview__shine" aria-hidden="true" />
      </div>
      <div className="drag-preview__hint">
        <span>Drag with mouse · touch scrolls normally</span>
        <button type="button" onClick={() => resetRef.current()} disabled={!active} aria-label={`Reset ${title} preview position`}>Reset position</button>
      </div>
    </div>
  );
}

function LiveWebsite({ title, url, previewMode, previewImage, loadLive, onLoad, onClose, active }: { title: string; url?: string; previewMode: "embedded" | "external"; previewImage?: string; loadLive: boolean; onLoad: () => void; onClose: () => void; active: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // A static image may fail before React hydrates and attaches onError.
    const image = imageRef.current;
    setImageFailed(!!image && image.complete && image.naturalWidth === 0);
  }, [previewImage]);
  const safeUrl = url && /^https:\/\//i.test(url) ? url : undefined;
  const showScreenshot = previewMode === "external" && !!previewImage && !imageFailed;
  return <div className="browser-preview" aria-label={`${title} project preview`}>
    <div className="browser-preview__chrome"><div className="browser-preview__dots" aria-hidden="true"><i /><i /><i /></div><div className="browser-preview__url">{safeUrl ? new URL(safeUrl).hostname : "Project concept"}</div><span className="browser-preview__label">{showScreenshot ? "Website screenshot" : "Project preview"}</span></div>
    <div className="browser-preview__viewport">
      {showScreenshot ? <img ref={imageRef} className="browser-preview__screenshot" src={previewImage} alt={`${title} website screenshot`} loading="lazy" draggable={false} width="1440" height="1000" onError={() => setImageFailed(true)} /> : <ProjectPoster title={title} />}
      {previewMode === "external" ? <>
        <div className="browser-preview__external-controls">
          <span className="browser-preview__note">{showScreenshot ? "Screenshot preview." : "Poster preview."} Opens in a new tab.</span>
          {safeUrl ? <a className="browser-preview__load" href={safeUrl} target="_blank" rel="noopener noreferrer" aria-label="Open live site">Open live site ↗</a> : null}
        </div>
      </> : <>
        {loadLive && active && safeUrl ? <iframe src={safeUrl} title={`${title} external website (availability not verified)`} loading="lazy" referrerPolicy="no-referrer" sandbox="allow-scripts allow-forms allow-same-origin" /> : null}
        {safeUrl && !loadLive ? <button className="browser-preview__load" type="button" onClick={onLoad}>Load interactive preview ↗</button> : null}
        {loadLive && <button className="browser-preview__load" type="button" onClick={onClose}>Back to project poster</button>}
      </>}
    </div>
  </div>;
}

function ProjectPoster({ title }: { title: string }) {
  const royalty = title.toLowerCase().includes("royalty");
  if (title === "Ad Factory") return <div className="browser-poster production-art production-art--factory" role="img" aria-label="Conceptual Ad Factory creative workflow diagram, not a website screenshot">
    <div className="production-art__mast"><span>CREATIVE PIPELINE / CONCEPTUAL POSTER</span><span>AF / 01</span></div>
    <strong>Ideas in.<br /><em>Formats out.</em></strong>
    <div className="production-art__diagram" aria-hidden="true"><span>BRIEF</span><b>→</b><span>CREATIVE WORKFLOW</span><b>→</b><span>AD FORMATS</span></div>
    <div className="production-art__tiles" aria-hidden="true"><i>01 / FORMAT</i><i>02 / LANGUAGE</i><i>03 / OUTPUT</i></div>
    <small>Illustrative workflow · not a live screenshot</small>
  </div>;
  if (title === "The Obesity Killer") return <div className="browser-poster production-art production-art--store" role="img" aria-label="Conceptual The Obesity Killer Shopify product storefront and cart diagram, not a website screenshot">
    <div className="production-art__mast"><span>PRODUCT STOREFRONT / CONCEPTUAL POSTER</span><span>SHOP / 02</span></div>
    <strong>From product<br /><em>to cart.</em></strong>
    <div className="production-art__diagram" aria-hidden="true"><span>PRODUCT</span><b>→</b><span>VARIANT</span><b>→</b><span>CART</span></div>
    <div className="production-art__storefront" aria-hidden="true"><div className="production-art__product"><span>PRODUCT VIEW</span><i /><i /></div><div className="production-art__cart"><span>CART</span><i /><i /><b>CHECKOUT →</b></div></div>
    <small>Illustrative storefront · not a live screenshot</small>
  </div>;
  return <div className={`browser-poster ${royalty ? "browser-poster--royalty" : "browser-poster--general"}`}>
    <span>DESIGNED PROJECT POSTER / {royalty ? "REVENUE SYSTEMS" : "PRODUCT ENGINEERING"}</span>
    <strong>{title}</strong>
    <p>{royalty ? "Contracts, clear rules and payments that add up. A sketch of how the system fits together." : "Resume feedback you can use. Relevant jobs and a clearer idea of what to work on next."}</p>
    <div className="browser-poster__flow" aria-hidden="true"><i>{royalty ? "CONTRACT" : "RESUME"}</i><b>→</b><i>{royalty ? "RULES" : "READINESS"}</i><b>→</b><i>{royalty ? "SETTLEMENT" : "ROLE FIT"}</i></div>
  </div>;
}

function LearnSphereVisual() {
  return <div className="system-visual system-visual--learn" role="img" aria-label="Learn Sphere conceptual editorial learning poster, not a website screenshot: every new chapter starts with curiosity, illustrated by an open book">
    <div className="learn-mast"><span>LEARN SPHERE <i>✳</i></span><span>AN OPEN WORLD OF LEARNING</span></div>
    <div className="learn-heading">A little curiosity.<br /><em>A world to learn.</em></div>
    <div className="learn-bottom">
      <div className="learn-copy"><span>01 / KEEP EXPLORING</span><p>Every new chapter begins with a question. Find your next one here.</p></div>
      <svg className="learn-book" viewBox="0 0 410 260" fill="none" aria-hidden="true">
        <ellipse cx="211" cy="238" rx="173" ry="13" fill="#153D32" opacity=".15" />
        <path d="M34 75C90 48 149 61 205 91C255 55 322 44 377 65L365 211C305 201 247 211 205 236C151 208 94 199 45 216L34 75Z" fill="#D86E5B" stroke="#153D32" strokeWidth="4" strokeLinejoin="round" />
        <path d="M42 66C101 44 153 57 205 88V222C158 193 102 183 49 201L42 66Z" fill="#F5E7CD" stroke="#153D32" strokeWidth="3" strokeLinejoin="round" />
        <path d="M205 88C253 53 313 41 370 56L359 198C300 186 250 197 205 222V88Z" fill="#FFFAEB" stroke="#153D32" strokeWidth="3" strokeLinejoin="round" />
        <path d="M205 88V222M62 88C112 75 154 87 183 105M63 106C104 96 147 106 177 122M225 106C268 82 313 75 351 80M225 124C268 103 309 97 348 102" stroke="#153D32" strokeWidth="2" opacity=".35" strokeLinecap="round" />
        <path d="M99 138C120 125 142 126 159 139M262 150C283 137 305 136 326 143" stroke="#D86E5B" strokeWidth="4" strokeLinecap="round" />
        <path d="M207 37V15M196 25L207 15L218 25M205 61L205 48" stroke="#D86E5B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="80" cy="28" r="5" fill="#D86E5B" /><circle cx="330" cy="26" r="4" fill="#D86E5B" />
      </svg>
    </div>
    <div className="learn-foot"><span>READ · DISCOVER · GROW</span><span>CONCEPTUAL POSTER / 01</span></div>
  </div>;
}

function CliffyVisual() {
  return <div className="system-visual system-visual--terminal" role="img" aria-label="Cliffy conceptual terminal interface showing a natural language instruction translated into a shell command">
    <div className="terminal-chrome"><i /><i /><i /><span>cliffy — concept preview</span></div>
    <div className="terminal-body"><p><b>$</b> cliffy &quot;find the five largest files in this folder&quot;</p><p className="terminal-muted">interpreting the request…</p><p><strong>du -ah . | sort -rh | head -n 5</strong></p><p className="terminal-muted">Illustrative command · review before execution</p><p><b>$</b> <span className="terminal-caret" /></p></div>
    <div className="terminal-badge">CONCEPTUAL TERMINAL PREVIEW</div>
    <div className="terminal-orbit terminal-orbit--one" /><div className="terminal-orbit terminal-orbit--two" />
  </div>;
}
