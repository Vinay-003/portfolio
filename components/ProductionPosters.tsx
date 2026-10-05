"use client";

import { DraggablePreview } from "./DraggablePreview";
import "../app/production-posters.css";

type ProductionItem = {
  title: string;
  category: string;
  description: string;
  live: string;
  source?: string;
  theme: "factory" | "store";
  previewMode?: "embedded" | "external";
  previewImage?: string;
};

const production: ProductionItem[] = [
  {
    title: "Ad Factory",
    category: "Creative production pipeline",
    description: "At Aarogya Kaya LLP, I helped build a workflow that turns briefs into ads across five formats and three language modes. FastAPI, MongoDB and Playwright handle the pieces behind it.",
    live: "https://adfactory.vinaybuilds.me",
    source: "https://github.com/Vinay-003/ad-factory/tree/render-setup",
    theme: "factory",
    previewMode: "embedded",
  },
  {
    title: "The Obesity Killer",
    category: "Aarogya Kaya LLP product storefront",
    description: "The Obesity Killer is Aarogya Kaya LLP’s product storefront. I worked on the Shopify pages, cart and variants, then tackled the layout and popup issues that make a difference when people shop.",
    live: "https://theobesitykiller.com",
    theme: "store",
    previewMode: "external",
    previewImage: "/previews/the-obesity-killer.webp",
  },
];

export function ProductionPosters() {
  return (
    <div className="production-showcase" aria-labelledby="production-showcase-title">
      <div className="production-showcase__intro" data-mobile-reveal>
        <span className="production-showcase__eyebrow">Aarogya Kaya LLP / Production builds</span>
        <h2 id="production-showcase-title">Work you can open.</h2>
        <p>A couple of things I worked on at Aarogya Kaya LLP. Open either site to see it for yourself.</p>
      </div>
      <div className="production-showcase__grid">
        {production.map((item, index) => (
          <article className={`production-poster production-poster--${item.theme}`} data-mobile-reveal key={item.title}>
            <div className="production-poster__top"><span>Production / 0{index + 1}</span><span>Aarogya Kaya LLP</span></div>
            <div className="production-poster__copy">
              <span className="production-poster__category">{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
            <div className="production-poster__preview">
              <DraggablePreview kind="live" title={item.title} liveUrl={item.live} previewMode={item.previewMode} previewImage={item.previewImage} accent={item.theme === "factory" ? "lime" : "cream"} active={true} />
            </div>
            <div className="production-poster__footer">
              <a href={item.live} target="_blank" rel="noopener noreferrer">Open live <span aria-hidden="true">↗</span></a>
              {item.source && <a href={item.source} target="_blank" rel="noopener noreferrer">Source <span aria-hidden="true">↗</span></a>}
              <span>{item.previewMode === "external" ? "Site opens in a new tab" : "Preview loads only on request"}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
