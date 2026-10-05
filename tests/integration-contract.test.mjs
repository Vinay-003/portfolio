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
