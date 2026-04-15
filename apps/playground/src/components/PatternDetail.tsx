import { type NormalizerType, simulateToCanvas } from '@eml-fn/bullet-choreographer';
import { toFormula } from '@eml-fn/core';
import { useEffect, useRef, useState } from 'react';
import type { PatternResult } from '../hooks/usePatternPipeline';

interface PatternDetailProps {
  pattern: PatternResult;
  normalizer: NormalizerType;
  onNormalizerChange: (n: NormalizerType) => void;
}

const NORMALIZERS: NormalizerType[] = ['modular', 'clamp', 'sigmoid', 'adaptive'];

export function PatternDetail({ pattern, normalizer, onNormalizerChange }: PatternDetailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bulletCount, setBulletCount] = useState(50);
  const [timeSteps, setTimeSteps] = useState(200);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    simulateToCanvas(pattern.pair, canvas, {
      bulletCount,
      timeSteps,
      dt: 0.05,
      normalizer,
      bounds: 512,
      color: 'rgba(0, 255, 128, 0.6)',
      backgroundColor: '#0a0a0f',
    });
  }, [pattern, normalizer, bulletCount, timeSteps]);

  const xFormula = toFormula(pattern.pair.xTree);
  const yFormula = toFormula(pattern.pair.yTree);

  return (
    <>
      <div className="detail-canvas-wrap">
        <canvas ref={canvasRef} width={512} height={512} />
      </div>

      <div className="detail-controls">
        <div className="control-group">
          <label>Normalizer</label>
          <select
            value={normalizer}
            onChange={(e) => onNormalizerChange(e.target.value as NormalizerType)}
          >
            {NORMALIZERS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Bullets</label>
          <input
            type="number"
            min={5}
            max={200}
            value={bulletCount}
            onChange={(e) => setBulletCount(Number(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Steps</label>
          <input
            type="number"
            min={20}
            max={500}
            value={timeSteps}
            onChange={(e) => setTimeSteps(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="detail-controls">
        <div className="control-group" style={{ flex: 1 }}>
          <label>Tags</label>
          <div className="detail-tags">
            {pattern.tags.map((tag) => (
              <span key={tag} className={`tag-badge ${tag}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="control-group" style={{ flex: 2 }}>
          <label>Formulas</label>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
              fontFamily: 'monospace',
            }}
          >
            <div>x(t,i) = {xFormula}</div>
            <div>y(t,i) = {yFormula}</div>
          </div>
        </div>
      </div>
    </>
  );
}
