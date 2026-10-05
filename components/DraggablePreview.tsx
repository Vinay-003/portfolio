"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type PreviewKind = "live" | "learn" | "cliffy";
type DraggablePreviewProps = {
  kind: PreviewKind;
  title: string;
  liveUrl?: string;
  accent?: "lime" | "violet" | "cream";
  active?: boolean;
  preload?: boolean;
};

export function DraggablePreview({ kind, title, liveUrl, accent = "lime", active = false, preload = false }: DraggablePreviewProps) {
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
        {kind === "live" ? <LiveWebsite title={title} url={liveUrl} loadLive={loadLive} onLoad={() => setLoadLive(true)} onClose={() => setLoadLive(false)} active={active} /> : null}
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

function LiveWebsite({ title, url, loadLive, onLoad, onClose, active }: { title: string; url?: string; loadLive: boolean; onLoad: () => void; onClose: () => void; active: boolean }) {
  const safeUrl = url && /^https:\/\//i.test(url) ? url : undefined;
  return <div className="browser-preview" aria-label={`${title} project preview`}>
    <div className="browser-preview__chrome"><div className="browser-preview__dots" aria-hidden="true"><i /><i /><i /></div><div className="browser-preview__url">{safeUrl ? new URL(safeUrl).hostname : "Project concept"}</div><span className="browser-preview__label">Project preview</span></div>
    <div className="browser-preview__viewport">
      <ProjectPoster title={title} />
      {loadLive && active && safeUrl ? <iframe src={safeUrl} title={`${title} external website (availability not verified)`} loading="lazy" referrerPolicy="no-referrer" sandbox="allow-scripts allow-forms allow-same-origin" /> : null}
      {safeUrl && !loadLive ? <button className="browser-preview__load" type="button" onClick={onLoad}>Load interactive preview ↗</button> : null}
      {loadLive && <button className="browser-preview__load" type="button" onClick={onClose}>Back to project poster</button>}
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
  return <div className="system-visual system-visual--learn" role="img" aria-label="Learn Sphere conceptual diagram connecting students, educators, administrators, a database and payments">
    <div className="system-visual__grid" aria-hidden="true" />
    <div className="learn-core"><span>LEARNING PLATFORM</span><strong>Learn Sphere</strong><small>role-aware learning</small></div>
    <div className="learn-node learn-node--student">STUDENT</div><div className="learn-node learn-node--educator">EDUCATOR</div><div className="learn-node learn-node--admin">ADMIN</div>
    <div className="learn-service learn-service--db">DATABASE</div><div className="learn-service learn-service--pay">PAYMENTS</div>
    <svg className="learn-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M14 24 C 32 20, 34 42, 48 49 M15 72 C 32 76, 35 61, 48 51 M82 20 C 68 26, 67 42, 54 49 M83 70 C 68 68, 67 57, 54 51" /></svg>
    <div className="system-visual__stamp">CONCEPTUAL SYSTEM DIAGRAM</div>
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
