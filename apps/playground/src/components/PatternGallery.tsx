import { useRef, useEffect, useState } from "react";
import {
  simulateToCanvas,
  type NormalizerType,
  type TagName,
} from "@eml-fn/bullet-choreographer";
import type { PatternResult } from "../hooks/usePatternPipeline";

interface PatternGalleryProps {
  patterns: PatternResult[];
  selected: PatternResult | null;
  onSelect: (p: PatternResult) => void;
  normalizer: NormalizerType;
  tagFilter: TagName | null;
  onTagFilter: (tag: TagName | null) => void;
  allTags: TagName[];
}

const PAGE_SIZE = 60;

export function PatternGallery({
  patterns,
  selected,
  onSelect,
  normalizer,
  tagFilter,
  onTagFilter,
  allTags,
}: PatternGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when patterns change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [patterns]);

  const visible = patterns.slice(0, visibleCount);
  const hasMore = visibleCount < patterns.length;

  return (
    <div>
      <h2>Gallery ({patterns.length} patterns)</h2>

      <div className="tag-filters">
        <button
          className={`tag-btn ${tagFilter === null ? "active" : ""}`}
          onClick={() => onTagFilter(null)}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag-btn ${tagFilter === tag ? "active" : ""}`}
            onClick={() => onTagFilter(tagFilter === tag ? null : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {visible.map((p, i) => (
          <GalleryItem
            key={i}
            pattern={p}
            isSelected={p === selected}
            onSelect={() => onSelect(p)}
            normalizer={normalizer}
          />
        ))}
        {hasMore && (
          <div className="load-more-row">
            <button
              className="load-more-btn"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              Load more ({patterns.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryItem({
  pattern,
  isSelected,
  onSelect,
  normalizer,
}: {
  pattern: PatternResult;
  isSelected: boolean;
  onSelect: () => void;
  normalizer: NormalizerType;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    simulateToCanvas(pattern.pair, canvas, {
      bulletCount: 30,
      timeSteps: 120,
      dt: 0.05,
      normalizer: "adaptive",
      bounds: 128,
      color: "rgba(0, 255, 128, 0.7)",
      backgroundColor: "#0a0a0f",
    });
  }, [pattern, normalizer]);

  return (
    <div
      className={`gallery-item ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <canvas ref={canvasRef} width={128} height={128} />
      <div className="gallery-tags">
        {pattern.tags.map((tag) => (
          <span key={tag} className={`tag-badge ${tag}`}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
