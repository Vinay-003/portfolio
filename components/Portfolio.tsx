"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DraggablePreview } from "./DraggablePreview";
import { LiquidBackground } from "./LiquidBackground";
import { ProductionPosters } from "./ProductionPosters";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Project = {
  number: string;
  name: string;
  label: string;
  kicker: string;
  description: string;
  tags: string[];
  live?: string;
  repo: string;
  preview: "live" | "learn" | "cliffy";
  accent: "lime" | "violet" | "cream";
};

const projects: Project[] = [
  {
    number: "01",
    name: "RoyaltyOS",
    label: "Contract to revenue infrastructure",
    kicker: "AI reads the contract. Humans approve. Deterministic software moves the math.",
    description:
      "Royalty payments get messy fast. I built a place to turn contracts into reviewed rules, calculate settlements and send PayPal payouts. Every cent has a paper trail, so nobody has to guess where the numbers came from.",
    tags: ["TypeScript", "Supabase", "OpenAI", "PayPal", "Rule Engine", "Audit Log"],
    live: "https://royaltyos.vinaybuilds.me",
    repo: "https://github.com/Vinay-003/RoyaltyOs",
    preview: "live",
    accent: "lime",
  },
  {
    number: "02",
    name: "JobHunter",
    label: "Resume intelligence and ranked opportunities",
    kicker: "Explainable Resume Health and role fit stay separate by design.",
    description:
      "I wanted job hunting to feel less like throwing a resume into the void. JobHunter checks how readable your resume is, finds relevant openings and explains the match. Your resume stays private, and the feedback gives you something useful to work on.",
    tags: ["React", "TypeScript", "PostgreSQL", "Supabase", "SageMaker", "Embeddings"],
    live: "https://jobhunter.vinaybuilds.me",
    repo: "https://github.com/Vinay-003/jobhunter_",
    preview: "live",
    accent: "violet",
  },
  {
    number: "03",
    name: "Learn Sphere",
    label: "Course marketplace with real product flows",
    kicker: "Three roles, real payments, persistence and moderation. This is not a static course UI.",
    description:
      "A course marketplace built beyond the landing page. Teachers can publish, students can enroll and ask questions, and admins can keep things in order. I built the login, database and verified Razorpay payments too.",
    tags: ["Next.js", "Express", "TypeScript", "PostgreSQL", "Drizzle", "Razorpay"],
    repo: "https://github.com/Vinay-003/skillarious",
    preview: "learn",
    accent: "cream",
  },
  {
    number: "04",
    name: "CLIFFY",
    label: "Natural language command line assistant",
    kicker: "Translate intent into shell commands without hiding the destructive edge cases.",
    description:
      "Sometimes I know what I want to do, just not the command for it. CLIFFY turns plain language into shell commands, offers suggestions and asks before anything destructive. It helps with the terminal without taking the controls away.",
    tags: ["Python", "OpenAI API", "CLI", "Async", "Safety", "Automation"],
    repo: "https://github.com/Vinay-003/aishell2",
    preview: "cliffy",
    accent: "lime",
  },
];

const tools = [
  "TypeScript", "React", "Next.js", "Node.js", "Python", "FastAPI", "PostgreSQL", "MongoDB",
  "Supabase", "Playwright", "AWS", "PayPal", "OpenAI", "Shopify", "Render", "Docker", "GSAP",
];

function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add("has-custom-cursor");
    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

    const onMove = (event: PointerEvent) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };
    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      document.body.classList.toggle("cursor-active", Boolean(target.closest("a, button, [data-cursor]")));
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    return () => {
      document.body.classList.remove("has-custom-cursor", "cursor-active");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}

export function Portfolio() {
  const rootRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const workTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const [activeProject, setActiveProject] = useState(0);
  const [stackedProjects, setStackedProjects] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const compact = window.matchMedia("(max-width: 899px), (prefers-reduced-motion: reduce)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setStackedProjects(compact.matches); setReducedMotion(motion.matches); };
    update();
    compact.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => { compact.removeEventListener("change", update); motion.removeEventListener("change", update); };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const lenis = new Lenis({
      duration: reduced ? 0 : 1.15,
      smoothWheel: !reduced,
      touchMultiplier: 1,
      wheelMultiplier: 0.9,
    });
    lenisRef.current = lenis;

    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const handlers = anchors.map((anchor) => {
      const handler = (event: MouseEvent) => {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
         const trigger = ScrollTrigger.getAll().find((item) => item.trigger === target && item.pin);
         // Lenis already accounts for CSS scroll-margin. Pinned scenes instead
         // need their actual timeline position, not the spacer's layout offset.
         const readingProgress = id === "#experience" ? 0.66 : id === "#about" ? 0.4 : 0;
         const destination = trigger ? trigger.start + readingProgress * (trigger.end - trigger.start) + 1 : target as HTMLElement;
         lenis.scrollTo(destination, { duration: 1.2 });
        setMenuOpen(false);
      };
      anchor.addEventListener("click", handler);
      return { anchor, handler };
    });

    let mounted = true;
    document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh(); });
    return () => {
      mounted = false;
      handlers.forEach(({ anchor, handler }) => anchor.removeEventListener("click", handler));
      lenis.off("scroll", update);
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    const nav = rootRef.current?.querySelector(".nav");
    if (!nav) return;
    const close = () => setMenuOpen(false);
    nav.addEventListener("click", close);
    return () => nav.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [menuOpen]);

  const goToProject = (index: number) => {
    const timeline = workTimelineRef.current;
    const trigger = timeline?.scrollTrigger;
    if (!timeline || !trigger) return;
    const time = timeline.labels[`project-${index}`];
    if (time === undefined) return;
    const destination = trigger.start + time / timeline.duration() * (trigger.end - trigger.start);
    if (lenisRef.current) lenisRef.current.scrollTo(destination, { duration: 1 });
    else window.scrollTo({ top: destination, behavior: "smooth" });
  };

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(".hero-title-line > span", { yPercent: 115, rotate: 2 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.12, ease: "power4.out", delay: 0.08 });
        gsap.fromTo(".hero-copy, .hero-actions, .hero-meta", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.42, ease: "power3.out" });
      });
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const heroStage = root.querySelector<HTMLElement>(".hero-stage");
        const heroScene = root.querySelector<HTMLElement>(".hero-scene");
        if (heroStage && heroScene) {
          const heroTl = gsap.timeline({
            scrollTrigger: {
              trigger: heroScene,
              start: "top top",
              end: () => `+=${window.innerHeight * 1.35}`,
              pin: heroStage,
              scrub: 0.65,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          heroTl
            .addLabel("heroExit", 0)
            // Do not capture the intro tween's temporary opacity of zero as
            // the scroll timeline's starting state when returning to the hero.
            .fromTo(".hero-copy, .hero-actions, .hero-meta", { opacity: 1, y: 0 }, { opacity: 0, y: -34, stagger: 0.02, duration: 0.24, ease: "power3.in", immediateRender: false }, "heroExit")
            .to(".hero-art-index", { autoAlpha: 0, y: -16, duration: 0.12 }, "heroExit")
            .to(".hero-title-line:nth-child(1)", { xPercent: -10, duration: 0.32, ease: "power3.inOut" }, "heroExit")
            .to(".hero-title-line:nth-child(2)", { xPercent: 9, duration: 0.32, ease: "power3.inOut" }, "heroExit")
            .to(".hero-title-line:nth-child(3)", { xPercent: -6, scale: 1.06, duration: 0.32, ease: "power3.inOut" }, "heroExit")
             .to(".hero-art-bar", { yPercent: (index) => (index % 2 ? -130 : 130), rotation: 0, stagger: 0.018, duration: 0.3, ease: "power3.inOut" }, "heroExit")
             .to(".hero-orb", { scale: 1.9, opacity: 0.55, duration: 0.32 }, "heroExit")
             .to(".hero-scroll-word", { yPercent: -100, opacity: 0, duration: 0.35 }, "heroExit")
            .addLabel("sectionReveal", 0.28)
            .fromTo(".hero-transition", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.72, ease: "power2.inOut" }, "sectionReveal")
            .fromTo(".hero-transition h2", { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.62, ease: "power3.out" }, "sectionReveal+=0.12")
            .fromTo(".hero-transition p", { opacity: 0 }, { opacity: 1, duration: 0.35 }, "sectionReveal+=0.22");
        }

        const workStage = root.querySelector<HTMLElement>(".work-stage");
        const workScene = root.querySelector<HTMLElement>(".work-scene");
        const cards = gsap.utils.toArray<HTMLElement>(".project-panel");
        const counterItems = gsap.utils.toArray<HTMLElement>(".project-counter__item");
        if (workStage && workScene && cards.length) {
          gsap.set(cards.slice(1), { yPercent: 8, clipPath: "inset(100% 0 0 0 round 24px)", scale: 0.985 });
          gsap.set(counterItems, { opacity: 1 });

          const workTl = gsap.timeline({
            scrollTrigger: {
              trigger: workScene,
              start: "top top",
              end: () => `+=${window.innerHeight * 6.4}`,
              pin: workStage,
              scrub: 0.45,
              snap: {
                snapTo: "labelsDirectional",
                delay: 0.05,
                duration: { min: 0.12, max: 0.28 },
                ease: "power2.inOut",
                inertia: false,
              },
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          workTl.addLabel("project-0", 0);
          workTimelineRef.current = workTl;
          workTl.eventCallback("onUpdate", () => {
            const time = workTl.time();
            let active = 0;
            for (let index = 1; index < cards.length; index++) {
              if (time >= workTl.labels[`project-${index}`] - 0.18) active = index;
            }
            setActiveProject((previous) => previous === active ? previous : active);
          });
          cards.forEach((card, index) => {
            if (index === 0) return;
            const previous = cards[index - 1];
            const transitionStart = 1.18 + (index - 1) * 1.55;
            workTl
              .to(previous, {
                yPercent: -7,
                scale: 0.94,
                autoAlpha: 0,
                filter: "blur(5px)",
                duration: 0.26,
                ease: "power3.in",
              }, transitionStart)
              .to(card, {
                yPercent: 0,
                clipPath: "inset(0% 0 0 0 round 24px)",
                scale: 1,
                duration: 0.34,
                ease: "power3.out",
              }, transitionStart + 0.03)
              .addLabel(`project-${index}`, transitionStart + 0.38);
          });
          workTl.to(cards[cards.length - 1], { scale: 1, duration: 1.1 });
        }

        const experienceStage = root.querySelector<HTMLElement>(".experience-stage");
        const experienceScene = root.querySelector<HTMLElement>(".experience-scene");
        if (experienceStage && experienceScene) {
          gsap.timeline({
            scrollTrigger: {
              trigger: experienceScene,
              start: "top top",
              end: () => `+=${window.innerHeight * 1.9}`,
              pin: experienceStage,
              scrub: 0.9,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
            .fromTo(".experience-title-line", { yPercent: 110 }, { yPercent: 0, stagger: 0.08, duration: 0.42, ease: "power3.out" }, 0.02)
            .fromTo(".experience-copy > p", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.3 }, 0.16)
            .fromTo(".experience-point", { x: 54, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.07, duration: 0.35 }, 0.25)
            .fromTo(".experience-proof", { y: 72, rotation: -5, transformOrigin: "50% 0%" }, { y: 0, rotation: 2, duration: 0.58, ease: "power3.out" }, 0.18)
            .to(".experience-proof", { rotation: -1, duration: 0.7, ease: "sine.inOut" }, 0.78)
            .fromTo(".experience-link", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.32 }, 0.58);
        }

        const aboutStage = root.querySelector<HTMLElement>(".about-stage");
        const aboutScene = root.querySelector<HTMLElement>(".about-scene");
        const track = root.querySelector<HTMLElement>(".tools-track");
        if (aboutStage && aboutScene && track) {
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 100);
          gsap.timeline({
            scrollTrigger: {
              trigger: aboutScene,
              start: "top top",
              end: () => `+=${Math.max(window.innerHeight * 1.9, distance())}`,
              pin: aboutStage,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
            .fromTo(".about-quote", { clipPath: "inset(0 0 100% 0)", y: 80 }, { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.45 })
            .fromTo(".about-copy", { y: 32 }, { y: 0, duration: 0.3 }, 0.2)
            .to(track, { x: () => -distance(), ease: "none", duration: 1 }, 0.45);
        }

        gsap.fromTo(
          ".contact-panel",
          { clipPath: "inset(50% 50% 50% 50% round 40px)", scale: 0.86 },
          {
            clipPath: "inset(0% 0% 0% 0% round 40px)",
            scale: 1,
            ease: "power4.out",
            scrollTrigger: { trigger: ".contact-scene", start: "top 78%", end: "top 25%", scrub: 1 },
          },
        );
      });

       mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
         gsap.to(".hero-art-bar", {
           y: (index) => index % 2 ? -24 : 32,
           x: (index) => (index - 3) * 3,
           rotation: (index) => (index - 3) * 2,
           scale: (index) => 1 + index * 0.025,
           stagger: 0.025,
           ease: "none",
           scrollTrigger: { trigger: ".hero-scene", start: "top top", end: "+=550", scrub: 0.3 },
         });
         gsap.to(".hero-title", { y: -18, ease: "none", scrollTrigger: { trigger: ".hero-scene", start: "top top", end: "+=550", scrub: 0.3 } });
         gsap.fromTo(".experience-title-line", { yPercent: 35 }, { yPercent: 0, stagger: 0.08, ease: "none", scrollTrigger: { trigger: ".experience-copy", start: "top 95%", end: "top 45%", scrub: 0.5 } });
          gsap.fromTo(".experience-point", { x: 12, opacity: 0.65 }, { x: 0, opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: ".experience-points", start: "top 95%", end: "bottom 70%", scrub: 0.5 } });
          gsap.fromTo(".experience-proof", { y: 42, rotation: -1, transformOrigin: "50% 0%" }, { y: 0, rotation: 1, ease: "none", scrollTrigger: { trigger: ".experience-copy", start: "top 95%", end: () => `+=${Math.max(500, window.innerHeight)}`, scrub: 0.5 } });
         gsap.fromTo(".about-quote", { y: 25, opacity: 0.7 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".about-scene", start: "top 90%", end: "top 45%", scrub: 0.5 } });
         gsap.fromTo(".about-copy", { y: 16, opacity: 0.7 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".about-copy", start: "top 95%", end: "top 65%", scrub: 0.5 } });
          const toolsViewport = root.querySelector<HTMLElement>(".tools-viewport");
          if (toolsViewport) gsap.to(toolsViewport, {
            scrollLeft: () => Math.min(110, toolsViewport.scrollWidth - toolsViewport.clientWidth),
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: toolsViewport, start: "top 90%", once: true },
          });
         gsap.fromTo(".contact-panel", { y: 25, opacity: 0.75 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".contact-scene", start: "top 90%", end: "top 45%", scrub: 0.5 } });
         gsap.utils.toArray<HTMLElement>("[data-mobile-reveal]").filter((item) => !item.matches(".contact-panel")).forEach((item) => {
           gsap.fromTo(item, { y: 22, opacity: 0.75 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 92%", once: true } });
         });
       });

      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: Array<() => void> = [];
        gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((element) => {
          const xTo = gsap.quickTo(element, "x", { duration: 0.4, ease: "power3" });
          const yTo = gsap.quickTo(element, "y", { duration: 0.4, ease: "power3" });
          const move = (event: PointerEvent) => {
            const bounds = element.getBoundingClientRect();
            xTo((event.clientX - bounds.left - bounds.width / 2) * 0.12);
            yTo((event.clientY - bounds.top - bounds.height / 2) * 0.12);
          };
          const leave = () => { xTo(0); yTo(0); };
          element.addEventListener("pointermove", move);
          element.addEventListener("pointerleave", leave);
          cleanups.push(() => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", leave); gsap.killTweensOf(element); });
        });
        const art = root.querySelector<HTMLElement>(".hero-art-bars");
        if (art) {
          const tiltX = gsap.quickTo(art, "rotationX", { duration: 0.65, ease: "power3.out" });
          const tiltY = gsap.quickTo(art, "rotationY", { duration: 0.65, ease: "power3.out" });
          const move = (event: PointerEvent) => {
            const bounds = art.getBoundingClientRect();
            tiltX(((event.clientY - bounds.top) / bounds.height - 0.5) * -9);
            tiltY(((event.clientX - bounds.left) / bounds.width - 0.5) * 12);
          };
          const leave = () => { tiltX(0); tiltY(0); };
          art.addEventListener("pointermove", move);
          art.addEventListener("pointerleave", leave);
          cleanups.push(() => { art.removeEventListener("pointermove", move); art.removeEventListener("pointerleave", leave); gsap.killTweensOf(art); });
        }
        return () => cleanups.forEach((cleanup) => cleanup());
      });
      return () => { workTimelineRef.current = null; mm.revert(); };
    },
    { scope: rootRef },
  );

  return (
    <main ref={rootRef} className="portfolio-root">
      <LiquidBackground />
      <a className="skip-link" href="#work">Skip to selected work</a>
      <Cursor />

      <header className="site-header">
        <a className="brand" data-magnetic href="#top">VINAY <span>/ 003</span></a>
        <nav id="primary-navigation" className={menuOpen ? "nav nav--open" : "nav"} aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <button
          type="button"
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span /><span />
        </button>
        <a className="status" data-magnetic href="#contact"><i /> Available for builds</a>
      </header>

      <section id="top" className="hero-scene scene">
        <div className="hero-stage stage">
          <div className="hero-content">
            <p className="eyebrow">Developer <span>/</span> Automation Builder <span>/</span> Systems Thinker</p>
            <h1 className="hero-title">
              <span className="hero-title-line"><span>I build digital</span></span>
              <span className="hero-title-line"><span>systems that</span></span>
              <span className="hero-title-line hero-title-line--accent"><span>move.</span></span>
            </h1>
            <p className="hero-copy">Hey, I’m Vinay. I turn tricky ideas into web products, AI tools and automations that actually work. I like the messy bits, especially when making them simpler helps someone else.</p>
            <div className="hero-actions">
              <a className="button button--primary" data-magnetic href="#work">Enter the work <span>↘</span></a>
              <a className="button button--secondary" data-magnetic href="https://github.com/Vinay-003" target="_blank" rel="noreferrer">GitHub / Vinay-003 <span>↗</span></a>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
             <div className="hero-art-index">04 <small>featured systems</small></div>
             <div className="hero-art-bars">
              {Array.from({ length: 7 }).map((_, index) => <span className="hero-art-bar" style={{ "--bar": index } as React.CSSProperties} key={index} />)}
            </div>
            <div className="hero-orb" />
            <div className="hero-art-caption">Scroll to open the system</div>
          </div>

          <div className="hero-meta"><span>Based in India</span><span>Full-stack + automation</span><span>Production-minded</span></div>

          <div className="hero-scroll-word" aria-hidden="true">SCROLL</div>
           <div className="hero-transition" aria-hidden="true">
            <p>01 / SELECTED PERSONAL WORK</p>
            <h2>Built for the real world.</h2>
          </div>
        </div>
      </section>

      <section id="work" className="work-scene scene">
        <div className="work-stage stage">
          <div className="work-heading">
            <p className="eyebrow">01 / Selected work</p>
            <h2>Four systems. <br />Built to work.</h2>
            <p>Products with real flows, edge cases and technical weight. Choose a number or scroll to explore.</p>
            <div className="project-counter" aria-label="Choose a project">
              {projects.map((project, index) => <button type="button" className={`project-counter__item ${index === activeProject ? "is-active" : ""}`} aria-label={`View ${project.name}`} aria-current={index === activeProject ? "step" : undefined} onClick={() => goToProject(index)} key={project.number}>{project.number}</button>)}
            </div>
          </div>
          <div className="project-deck">
            {projects.map((project, index) => (
              <article className={`project-panel project-panel--${project.accent} ${index === activeProject ? "is-active" : ""}`} data-mobile-reveal key={project.name} style={{ zIndex: index + 1 }} aria-hidden={!stackedProjects && index !== activeProject} inert={!stackedProjects && index !== activeProject}>
                <div className="project-panel__copy">
                  <div className="project-panel__top"><span>{project.number} / 04</span><span>{project.label}</span></div>
                  <h3>{project.name}</h3>
                  <p className="project-panel__kicker">{project.kicker}</p>
                  <p className="project-panel__description">{project.description}</p>
                  <ul className="tag-list">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                  <div className="project-actions">
                    {project.live && <a className="project-link" href={project.live} target="_blank" rel="noreferrer">Open live <span aria-hidden="true">↗</span></a>}
                    <a className="project-link" href={project.repo} target="_blank" rel="noreferrer">{project.live ? "Source" : "View GitHub"} <span aria-hidden="true">↗</span></a>
                  </div>
                </div>
                <div className="project-preview-wrap"><DraggablePreview kind={project.preview} title={project.name} liveUrl={project.live} accent={project.accent} active={stackedProjects || index === activeProject} /></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="experience-scene scene">
        <div className="experience-stage stage">
          <div className="experience-copy">
            <div className="experience-kicker-wrap"><p className="experience-kicker eyebrow">02 / Work experience</p></div>
            <h2 className="experience-title">
              <span><i className="experience-title-line">Production work.</i></span>
              <span><i className="experience-title-line">No fake case study.</i></span>
            </h2>
            <p>At Aarogya Kaya LLP, I worked on the stuff people used every day. That meant ad generation, Shopify fixes and reporting pipelines. Not every problem was glamorous, but getting the details right made a real difference.</p>
            <ul className="experience-points">
              <li className="experience-point"><strong>Ad Factory</strong><span>FastAPI, MongoDB and Playwright creative production across five formats and three language modes.</span></li>
              <li className="experience-point"><strong>Commerce</strong><span>Shopify content, cart, variant, location, popup and responsive layout fixes.</span></li>
              <li className="experience-point"><strong>Data</strong><span>Meta, Google Analytics, Shopify and Shiprocket reporting pipelines.</span></li>
            </ul>
             <div className="experience-actions"><a className="experience-link" href="https://ad-factory-pzgh.onrender.com" target="_blank" rel="noreferrer">Ad Factory live ↗</a><a className="experience-link" href="https://github.com/Vinay-003/ad-factory/tree/render-setup" target="_blank" rel="noreferrer">Source ↗</a><a className="experience-link" href="https://theobesitykiller.com" target="_blank" rel="noreferrer">The Obesity Killer ↗</a></div>
          </div>

          <aside className="experience-proof" aria-label="Production work ticket">
            <div className="experience-proof__top"><span>PRODUCTION TICKET / 001</span><i>SHIPPED</i></div>
            <div className="experience-proof__url">Aarogya<br />Kaya LLP</div>
            <p>Storefront, creative automation and reporting workflows built for production.</p>
            <div className="experience-proof__grid"><div><strong>05</strong><span>Creative formats</span></div><div><strong>03</strong><span>Language modes</span></div><div><strong>04</strong><span>Connected data sources</span></div><div><strong>LIVE</strong><span>Commerce workflows</span></div></div>
            <div className="experience-proof__stamp" aria-hidden="true">BUILD<br />LOG</div>
          </aside>
        </div>
        <ProductionPosters />
      </section>

      <section id="about" className="about-scene scene">
        <div className="about-stage stage">
          <div className="about-copy-wrap">
            <p className="eyebrow eyebrow--dark">03 / About</p>
            <h2 className="about-quote">The fun part? Making all the messy pieces work together.</h2>
            <p className="about-copy">I’m studying Computer Science at IIIT Vadodara. Most days you’ll find me building something, figuring out an integration or wondering why a perfectly reasonable bit of code just broke. I care about software that makes life a little easier, not just software that looks good in a screenshot.</p>
          </div>
          <div className="about-stats"><div><strong>IIITV</strong><span>Computer Science</span></div><div><strong>AI + WEB</strong><span>Core focus</span></div><div><strong>INDIA</strong><span>Based in</span></div></div>
          <div className="tools-viewport">
            <div className="tools-track">
              {tools.map((tool) => <span key={tool}>{tool}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-scene scene">
        <div className="contact-panel" data-mobile-reveal>
          <p className="eyebrow eyebrow--dark">04 / Contact</p>
          <h2>Have a hard problem?<br />Let’s make it look easy.</h2>
          <div className="contact-bottom">
            <a className="contact-email" data-magnetic href="mailto:jadamvinay2003@gmail.com">jadamvinay2003@gmail.com <span>↗</span></a>
            <div className="contact-links"><a href="https://github.com/Vinay-003" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/vinay-saini-79315a2a3/" target="_blank" rel="noreferrer">LinkedIn ↗</a></div>
          </div>
        </div>
      </section>

      <footer className="footer"><span>Vinay Saini / Portfolio 2026</span><span>Built to move, not to decorate.</span></footer>
    </main>
  );
}
