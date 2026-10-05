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
test('frame-blocked sites are explicitly configured as external screenshot previews', () => {
  const production = readFileSync('components/ProductionPosters.tsx', 'utf8');
  const royalty = portfolio.slice(portfolio.indexOf('name: "RoyaltyOS"'), portfolio.indexOf('name: "JobHunter"'));
  const obesity = production.slice(production.indexOf('title: "The Obesity Killer"'), production.indexOf('export function'));
  for (const [config, path] of [[royalty, 'royaltyos'], [obesity, 'the-obesity-killer']]) {
    assert.ok(config.includes('previewMode: "external"'));
    assert.ok(config.includes(`/previews/${path}.webp`));
    assert.ok(readFileSync(`public/previews/${path}.webp`).length > 1000);
  }
});

test('upcoming projects reserve their destinations without replacing conceptual posters', () => {
  for (const [name, next, host, kind] of [
    ['Learn Sphere', 'name: "CLIFFY"', 'learnsphere.vinaybuilds.me', 'learn'],
    ['CLIFFY', 'const tools', 'cliffy.vinaybuilds.me', 'cliffy'],
  ]) {
    const config = portfolio.slice(portfolio.indexOf(`name: "${name}"`), portfolio.indexOf(next));
    assert.ok(config.includes(`live: "https://${host}"`));
    assert.ok(config.includes('deploymentStatus: "coming-soon"'));
    assert.ok(config.includes(`preview: "${kind}"`));
  }
  const production = readFileSync('components/ProductionPosters.tsx', 'utf8');
  for (const file of [portfolio, production]) {
    assert.ok(file.includes('https://adfactory.vinaybuilds.me'));
    assert.ok(!file.includes('ad-factory-pzgh.onrender.com'));
  }
});
