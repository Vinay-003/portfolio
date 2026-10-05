import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const portfolio = readFileSync('components/Portfolio.tsx', 'utf8');
test('ZIP content is integrated without replacing the original pinned scenes', () => {
  for (const name of ['RoyaltyOS', 'JobHunter', 'Learn Sphere', 'CLIFFY']) assert.ok(portfolio.includes(name), `${name} is missing`);
  for (const stage of ['pin: heroStage', 'pin: workStage', 'pin: experienceStage', 'pin: aboutStage']) assert.ok(portfolio.includes(stage), `${stage} is missing`);
  assert.ok(portfolio.includes('hero-art-bar'));
  assert.ok(portfolio.includes('LiquidBackground'));
  assert.ok(!portfolio.includes('wheelAccumulator'), 'Do not hijack wheel gestures');
});
test('liquid and preview components are present with explicit motion fallbacks', () => {
  assert.ok(existsSync('components/LiquidBackground.tsx'), 'Persistent liquid component is missing');
  const liquid = readFileSync('components/LiquidBackground.tsx', 'utf8');
  assert.ok(liquid.includes('prefers-reduced-motion'));
  assert.ok(liquid.includes('startCanvasFallback'));
  assert.ok(existsSync('components/DraggablePreview.tsx'), 'ZIP previews are missing');
});
test('preview modes preserve RoyaltyOS live loading and the external production screenshot', () => {
  const production = readFileSync('components/ProductionPosters.tsx', 'utf8');
  const royalty = portfolio.slice(portfolio.indexOf('name: "RoyaltyOS"'), portfolio.indexOf('name: "JobHunter"'));
  const obesity = production.slice(production.indexOf('title: "The Obesity Killer"'), production.indexOf('export function'));
  assert.ok(royalty.includes('previewMode: "embedded"'));
  assert.ok(royalty.includes('autoLoadLive: true'));
  assert.ok(royalty.includes('preview: "live"'));
  for (const [config, path] of [[obesity, 'the-obesity-killer']]) {
    assert.ok(config.includes('previewMode: "external"'));
    assert.ok(config.includes(`/previews/${path}.webp`));
    assert.ok(readFileSync(`public/previews/${path}.webp`).length > 1000);
  }
});

test('project destinations open directly with no deployment gating', () => {
  for (const [name, next, host, kind] of [
    ['Learn Sphere', 'name: "CLIFFY"', 'learnsphere.vinaybuilds.me', 'learn'],
    ['CLIFFY', 'const tools', 'cliffy.vinaybuilds.me', 'cliffy'],
  ]) {
    const config = portfolio.slice(portfolio.indexOf(`name: "${name}"`), portfolio.indexOf(next));
    assert.ok(config.includes(`live: "https://${host}"`));
    assert.ok(!config.includes('deploymentStatus'));
    assert.ok(config.includes(`preview: "${kind}"`));
  }
  assert.ok(!portfolio.includes('Coming soon'));
  assert.ok(!portfolio.includes('project-launch-status'));
  assert.ok(portfolio.includes('href={project.live}'));
  const production = readFileSync('components/ProductionPosters.tsx', 'utf8');
  for (const file of [portfolio, production]) {
    assert.ok(file.includes('https://adfactory.vinaybuilds.me'));
    assert.ok(!file.includes('ad-factory-pzgh.onrender.com'));
  }
});

test('Learn Sphere uses an editorial poster with a reduced-motion fallback', () => {
  const preview = readFileSync('components/DraggablePreview.tsx', 'utf8');
  const effects = readFileSync('app/effects.css', 'utf8');
  assert.ok(preview.includes('Learn Sphere conceptual editorial learning poster'));
  assert.ok(preview.includes('className="learn-book"'));
  assert.ok(!preview.includes('learn-node'));
  assert.match(effects, /@media\(prefers-reduced-motion:reduce\)[^\n]*\.learn-book[^\n]*animation:none/);
});
