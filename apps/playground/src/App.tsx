import type { NormalizerType, TagName } from '@eml-fn/bullet-choreographer';
import { useState } from 'react';
import { Controls } from './components/Controls';
import { ExportPanel } from './components/ExportPanel';
import { PatternDetail } from './components/PatternDetail';
import { PatternGallery } from './components/PatternGallery';
import { type PatternResult, usePatternPipeline } from './hooks/usePatternPipeline';

export function App() {
  const { patterns, isProcessing, stats, generate } = usePatternPipeline();
  const [selected, setSelected] = useState<PatternResult | null>(null);
  const [normalizer, setNormalizer] = useState<NormalizerType>('adaptive');
  const [tagFilter, setTagFilter] = useState<TagName | null>(null);

  const filtered = tagFilter ? patterns.filter((p) => p.tags.includes(tagFilter)) : patterns;

  return (
    <>
      <div className="header">
        <h1>
          EML Bullet Choreographer
          <span>exp(x) - ln(y) pattern explorer</span>
        </h1>
      </div>

      <Controls isProcessing={isProcessing} stats={stats} onGenerate={generate} />

      {isProcessing && <div className="processing-overlay">Generating & filtering patterns...</div>}

      {!isProcessing && patterns.length > 0 && (
        <div className="main-layout">
          <div className="gallery-section">
            <PatternGallery
              patterns={filtered}
              selected={selected}
              onSelect={setSelected}
              normalizer={normalizer}
              tagFilter={tagFilter}
              onTagFilter={setTagFilter}
              allTags={collectTags(patterns)}
            />
          </div>

          <div className="detail-panel">
            {selected ? (
              <>
                <PatternDetail
                  pattern={selected}
                  normalizer={normalizer}
                  onNormalizerChange={setNormalizer}
                />
                <ExportPanel pair={selected.pair} />
              </>
            ) : (
              <div className="empty-state">Select a pattern from the gallery</div>
            )}
          </div>
        </div>
      )}

      {!isProcessing && patterns.length === 0 && (
        <div className="empty-state">Configure depth & leaves, then click Generate & Filter</div>
      )}
    </>
  );
}

function collectTags(patterns: PatternResult[]): TagName[] {
  const set = new Set<TagName>();
  for (const p of patterns) {
    for (const t of p.tags) set.add(t);
  }
  return [...set].sort();
}
