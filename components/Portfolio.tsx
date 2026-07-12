"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Project = {
  number: string;
  name: string;
  kicker: string;
  description: string;
  tags: string[];
  href: string;
  theme: "lime" | "violet" | "cream";
  visual: "factory" | "learning" | "jobs";
};

const projects: Project[] = [
  {
    number: "01",
    name: "Ad Factory",
    kicker: "AI creative production system",
    description:
      "A structured creative pipeline that converts brand rules, product constraints and campaign inputs into repeatable, validation-ready ad prompts across formats and languages.",
    tags: ["Python", "FastAPI", "Playwright", "Prompt systems", "Automation"],
    href: "https://github.com/Vinay-003/ad-factory",
    theme: "lime",
    visual: "factory",
  },
  {
    number: "02",
    name: "Skillarious",
    kicker: "Learning platform with a real backend",
    description:
      "A full-stack learning product built around authenticated user flows, content delivery, payments, media handling and scalable data infrastructure—not a static course UI.",
    tags: ["Next.js", "Express", "Supabase", "Stripe", "Razorpay", "Cloudinary"],
    href: "https://github.com/Vinay-003/skillarious",
    theme: "violet",
    visual: "learning",
  },
  {
    number: "03",
    name: "JobHunter_",
    kicker: "Resume ATS and job recommendation system",
    description:
      "A two-service architecture: a TypeScript backend for auth, uploads, search and recommendations, plus a Python service for PDF extraction, resume analysis and ML-based job matching.",
    tags: ["TypeScript", "Bun", "Express", "Flask", "PostgreSQL", "ML"],
    href: "https://github.com/Vinay-003/jobhunter_",
    theme: "cream",
    visual: "jobs",
  },
];

const tools = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Shopify",
  "Supabase",
  "PostgreSQL",
  "Apps Script",
  "WATI",
  "Pabbly",
  "Figma",
];

function ProjectVisual({ type }: { type: Project["visual"] }) {
  if (type === "factory") {
    return (
      <div className="visual visual--factory" aria-hidden="true">
        <div className="visual-grid" />
        <div className="factory-node factory-node--a">INPUT</div>
        <div className="factory-node factory-node--b">RULES</div>
        <div className="factory-node factory-node--c">PROMPT</div>
        <div className="factory-node factory-node--d">OUTPUT</div>
        <svg className="factory-path" viewBox="0 0 520 360" fill="none">
          <path d="M122 94C214 94 171 181 260 181C347 181 302 267 405 267" pathLength="1" />
        </svg>
        <strong>AF</strong>
      </div>
    );
  }

  if (type === "learning") {
    return (
      <div className="visual visual--learning" aria-hidden="true">
        <div className="skill-window">
          <div className="skill-window__bar"><span /><span /><span /></div>
          <div className="skill-window__content">
            <div className="skill-sidebar" />
            <div className="skill-main"><span /><span /><span /></div>
          </div>
        </div>
        <div className="skill-card skill-card--one">LEARN</div>
        <div className="skill-card skill-card--two">BUILD</div>
        <strong>SK</strong>
      </div>
    );
  }

  return (
    <div className="visual visual--jobs" aria-hidden="true">
      <div className="resume-sheet">
        <span className="resume-sheet__head" />
        <span /><span /><span /><span />
      </div>
      <div className="match-meter">
        <span>MATCH</span>
        <strong>87%</strong>
        <div><i /></div>
      </div>
      <div className="job-pill job-pill--one">Backend</div>
      <div className="job-pill job-pill--two">Python</div>
      <strong className="jobs-mark">JH</strong>
    </div>
  );
}

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

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
        lenis.scrollTo(target as HTMLElement, { offset: 0, duration: reduced ? 0 : 1.2 });
        setMenuOpen(false);
      };
      anchor.addEventListener("click", handler);
      return { anchor, handler };
    });

    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => {
      handlers.forEach(({ anchor, handler }) => anchor.removeEventListener("click", handler));
      lenis.off("scroll", update);
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const intro = gsap.timeline({ defaults: { ease: "power4.inOut" } });
      intro
        .to(".intro-mark", { opacity: 0, scale: 0.9, duration: 0.35, delay: 0.25 })
        .to(".intro-panel--left", { xPercent: -102, duration: 1.1 }, "-=0.05")
        .to(".intro-panel--right", { xPercent: 102, duration: 1.1 }, "<")
        .set(".intro", { display: "none" });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const heroStage = root.querySelector<HTMLElement>(".hero-stage");
        const heroScene = root.querySelector<HTMLElement>(".hero-scene");
        if (heroStage && heroScene) {
          const heroTl = gsap.timeline({
            scrollTrigger: {
              trigger: heroScene,
              start: "top top",
              end: () => `+=${window.innerHeight * 1.8}`,
              pin: heroStage,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          heroTl
            .to(".hero-copy, .hero-actions, .hero-meta", { opacity: 0, y: -40, stagger: 0.03 }, 0)
            .to(".hero-title-line:nth-child(1)", { xPercent: -14 }, 0)
            .to(".hero-title-line:nth-child(2)", { xPercent: 12 }, 0)
            .to(".hero-title-line:nth-child(3)", { xPercent: -8, scale: 1.1 }, 0)
            .to(".hero-art-bar", { yPercent: (index) => (index % 2 ? -155 : 155), rotation: 0, stagger: 0.025 }, 0)
            .to(".hero-orb", { scale: 2.3, opacity: 0.7 }, 0)
            .fromTo(".hero-transition", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)" }, 0.45)
            .fromTo(".hero-transition h2", { yPercent: 120 }, { yPercent: 0 }, 0.54)
            .to(".hero-content", { opacity: 0, scale: 0.96 }, 0.68);
        }

        const workStage = root.querySelector<HTMLElement>(".work-stage");
        const workScene = root.querySelector<HTMLElement>(".work-scene");
        const cards = gsap.utils.toArray<HTMLElement>(".project-panel");
        const counterItems = gsap.utils.toArray<HTMLElement>(".project-counter__item");
        if (workStage && workScene && cards.length) {
          gsap.set(cards.slice(1), { yPercent: 115, clipPath: "inset(100% 0 0 0)", scale: 1.04 });
          gsap.set(counterItems.slice(1), { opacity: 0.18 });

          const workTl = gsap.timeline({
            scrollTrigger: {
              trigger: workScene,
              start: "top top",
              end: () => `+=${window.innerHeight * 3.3}`,
              pin: workStage,
              scrub: 1,
              snap: { snapTo: 1 / (cards.length - 1), duration: { min: 0.2, max: 0.65 }, ease: "power2.inOut" },
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          cards.forEach((card, index) => {
            if (index === 0) return;
            const previous = cards[index - 1];
            const start = index - 1;
            workTl
              .to(previous, { yPercent: -18, scale: 0.9, opacity: 0.22, filter: "blur(12px)", duration: 0.55 }, start)
              .fromTo(
                ".work-wipe",
                { scaleY: 0, transformOrigin: "bottom" },
                { scaleY: 1, duration: 0.25, ease: "power3.in" },
                start + 0.08,
              )
              .to(card, { yPercent: 0, clipPath: "inset(0% 0 0 0)", scale: 1, duration: 0.65, ease: "power3.out" }, start + 0.18)
              .to(".work-wipe", { scaleY: 0, transformOrigin: "top", duration: 0.28, ease: "power3.out" }, start + 0.48)
              .to(counterItems[index - 1], { opacity: 0.18, duration: 0.2 }, start + 0.2)
              .to(counterItems[index], { opacity: 1, duration: 0.2 }, start + 0.2);
          });
        }

        const experienceStage = root.querySelector<HTMLElement>(".experience-stage");
        const experienceScene = root.querySelector<HTMLElement>(".experience-scene");
        if (experienceStage && experienceScene) {
          gsap.timeline({
            scrollTrigger: {
              trigger: experienceScene,
              start: "top top",
              end: () => `+=${window.innerHeight * 1.6}`,
              pin: experienceStage,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
            .fromTo(".experience-kicker", { yPercent: 160 }, { yPercent: 0 }, 0)
            .fromTo(".experience-title-line", { yPercent: 120 }, { yPercent: 0, stagger: 0.08 }, 0.02)
            .fromTo(".browser-shell", { clipPath: "inset(0 100% 0 0)", rotateY: -12 }, { clipPath: "inset(0 0% 0 0)", rotateY: 0 }, 0.15)
            .fromTo(".experience-point", { x: 60, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.08 }, 0.35)
            .to(".experience-curtain--a", { xPercent: -102 }, 0.63)
            .to(".experience-curtain--b", { xPercent: 102 }, 0.63)
            .fromTo(".experience-link", { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, 0.72);
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
            .to(".about-copy", { opacity: 1, y: 0, duration: 0.3 }, 0.2)
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
        gsap.utils.toArray<HTMLElement>("[data-mobile-reveal]").forEach((item) => {
          gsap.fromTo(item, { y: 70, opacity: 0 }, {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 88%", once: true },
          });
        });
      });

      const magnetic = gsap.utils.toArray<HTMLElement>("[data-magnetic]");
      magnetic.forEach((element) => {
        const xTo = gsap.quickTo(element, "x", { duration: 0.45, ease: "power3" });
        const yTo = gsap.quickTo(element, "y", { duration: 0.45, ease: "power3" });
        const onMove = (event: PointerEvent) => {
          const bounds = element.getBoundingClientRect();
          xTo((event.clientX - bounds.left - bounds.width / 2) * 0.14);
          yTo((event.clientY - bounds.top - bounds.height / 2) * 0.14);
        };
        const onLeave = () => { xTo(0); yTo(0); };
        element.addEventListener("pointermove", onMove);
        element.addEventListener("pointerleave", onLeave);
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <main ref={rootRef}>
      <a className="skip-link" href="#work">Skip to selected work</a>
      <Cursor />

      <div className="intro" aria-hidden="true">
        <div className="intro-panel intro-panel--left" />
        <div className="intro-panel intro-panel--right" />
        <div className="intro-mark"><span>VINAY</span><i>/</i><span>003</span></div>
      </div>

      <header className="site-header">
        <a className="brand" data-magnetic href="#top">VINAY <span>/ 003</span></a>
        <nav className={menuOpen ? "nav nav--open" : "nav"} aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <button
          type="button"
          className="menu-button"
          aria-expanded={menuOpen}
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
              <span className="hero-title-line">I build digital</span>
              <span className="hero-title-line">systems that</span>
              <span className="hero-title-line hero-title-line--accent">move.</span>
            </h1>
            <p className="hero-copy">I design and ship web products, AI-assisted tools and automation infrastructure that feel deliberate, fast and built for real users.</p>
            <div className="hero-actions">
              <a className="button button--primary" data-magnetic href="#work">Explore the work <span>↘</span></a>
              <a className="button button--secondary" data-magnetic href="https://github.com/Vinay-003" target="_blank" rel="noreferrer">GitHub / Vinay-003 <span>↗</span></a>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-art-bars">
              {Array.from({ length: 7 }).map((_, index) => <span className="hero-art-bar" style={{ "--bar": index } as React.CSSProperties} key={index} />)}
            </div>
            <div className="hero-orb" />
            <div className="hero-art-caption">Scroll to open the system</div>
          </div>

          <div className="hero-meta"><span>Based in India</span><span>Full-stack + automation</span><span>Open to serious work</span></div>

          <div className="hero-transition" aria-hidden="true">
            <p>01 / SELECTED PERSONAL WORK</p>
            <h2>Projects with real technical weight.</h2>
          </div>
        </div>
      </section>

      <section id="work" className="work-scene scene">
        <div className="work-stage stage">
          <div className="work-heading">
            <p className="eyebrow">01 / Selected personal work</p>
            <h2>Three projects.<br />No filler.</h2>
            <p>Scroll to move through the work. The viewport stays still while each system takes over the stage.</p>
            <div className="project-counter" aria-hidden="true">
              {projects.map((project) => <span className="project-counter__item" key={project.number}>{project.number}</span>)}
            </div>
          </div>

          <div className="project-deck">
            {projects.map((project, index) => (
              <article className={`project-panel project-panel--${project.theme}`} data-mobile-reveal data-cursor key={project.name} style={{ zIndex: index + 1 }}>
                <div className="project-panel__copy">
                  <div className="project-panel__top"><span>{project.number}</span><span>Personal project</span></div>
                  <h3>{project.name}</h3>
                  <p className="project-panel__kicker">{project.kicker}</p>
                  <p className="project-panel__description">{project.description}</p>
                  <ul className="tag-list">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                  <a className="project-link" data-magnetic href={project.href} target="_blank" rel="noreferrer">View repository <span>↗</span></a>
                </div>
                <ProjectVisual type={project.visual} />
              </article>
            ))}
            <div className="work-wipe" aria-hidden="true" />
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
            <p>Internship experience in Shopify website development, conversion systems and the integrations around a production storefront.</p>
            <ul className="experience-points">
              <li className="experience-point">Built and iterated conversion-focused Shopify pages and customer journeys.</li>
              <li className="experience-point">Connected login, checkout, analytics and messaging tools.</li>
              <li className="experience-point">Automated workflows with Supabase, Apps Script, Pabbly and WATI.</li>
            </ul>
            <a className="experience-link" data-magnetic href="https://theobesitykiller.com" target="_blank" rel="noreferrer">theobesitykiller.com <span>↗</span></a>
          </div>

          <div className="browser-shell" aria-label="Stylized browser preview of the production Shopify work">
            <div className="browser-bar"><div><span /><span /><span /></div><p>theobesitykiller.com</p><b>LIVE</b></div>
            <div className="browser-page">
              <div className="browser-nav"><strong>AAROGYA KAYA</strong><span>SHOP&nbsp;&nbsp; STORY&nbsp;&nbsp; RESULTS</span></div>
              <div className="browser-hero"><p>AYURVEDIC WEIGHT MANAGEMENT</p><h3>Build a routine<br />that lasts.</h3><button type="button">EXPLORE THE KIT</button></div>
              <div className="browser-cards"><span /><span /><span /></div>
            </div>
            <div className="experience-curtain experience-curtain--a" />
            <div className="experience-curtain experience-curtain--b" />
          </div>
        </div>
      </section>

      <section id="about" className="about-scene scene">
        <div className="about-stage stage">
          <div className="about-copy-wrap">
            <p className="eyebrow eyebrow--dark">03 / About</p>
            <h2 className="about-quote">I like building the part others avoid—messy integrations, broken workflows, edge cases and systems that have to survive real users.</h2>
            <p className="about-copy">I’m Vinay Saini, a developer focused on practical web products, automation, commerce systems and AI-assisted workflows. My work sits between engineering, growth and product design.</p>
          </div>
          <div className="about-stats"><div><strong>40+</strong><span>Repositories</span></div><div><strong>AI + WEB</strong><span>Core focus</span></div><div><strong>INDIA</strong><span>Based in</span></div></div>
          <div className="tools-viewport">
            <div className="tools-track">
              {[...tools, ...tools].map((tool, index) => <span key={`${tool}-${index}`}>{tool}</span>)}
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
            <div className="contact-links"><a href="https://github.com/Vinay-003" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://theobesitykiller.com" target="_blank" rel="noreferrer">Live work ↗</a></div>
          </div>
        </div>
      </section>

      <footer className="footer"><span>Vinay Saini / Portfolio 2026</span><span>Built to move, not to decorate.</span></footer>
    </main>
  );
}
