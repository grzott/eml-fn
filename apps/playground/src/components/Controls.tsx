import type { FilterOpts } from '@eml-fn/bullet-choreographer';
import { useState } from 'react';

interface ControlsProps {
  isProcessing: boolean;
  stats: { total: number; survived: number; timeMs: number };
  onGenerate: (depth: number, leafTypes: string[], maxPairs: number, opts?: FilterOpts) => void;
}

const ALL_LEAVES = [
  { id: '1', label: '1', title: 'Constant 1' },
  { id: 't', label: 't', title: 'Time' },
  { id: 'i', label: 'i', title: 'Bullet index' },
  { id: 'n', label: 'n', title: 'Total bullet count' },
  { id: 'tau', label: 'τ', title: '2π ≈ 6.28' },
] as const;

const DEPTH_OPTIONS = [
  { value: 1, label: '1 (quick)', pairs: '~170' },
  { value: 2, label: '2 (medium)', pairs: '~21K' },
  { value: 3, label: '3 (deep, sampled)', pairs: '~15K sampled' },
] as const;

export function Controls({ isProcessing, stats, onGenerate }: ControlsProps) {
  const [depth, setDepth] = useState(2);
  const [leaves, setLeaves] = useState<Set<string>>(new Set(['1', 't', 'i', 'n']));
  const [maxPairs, setMaxPairs] = useState(15000);

  const toggleLeaf = (leaf: string) => {
    setLeaves((prev) => {
      const next = new Set(prev);
      if (next.has(leaf)) {
        if (next.size > 1) next.delete(leaf);
      } else {
        next.add(leaf);
      }
      return next;
    });
  };

  const handleGenerate = () => {
    onGenerate(depth, [...leaves], maxPairs);
  };

  return (
    <div className="controls">
      <div className="control-group">
        <label>Depth</label>
        <select value={depth} onChange={(e) => setDepth(Number(e.target.value))}>
          {DEPTH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>Leaf types</label>
        <div className="leaf-checkboxes">
          {ALL_LEAVES.map((leaf) => (
            <label key={leaf.id} title={leaf.title}>
              <input
                type="checkbox"
                checked={leaves.has(leaf.id)}
                onChange={() => toggleLeaf(leaf.id)}
              />
              {leaf.label}
            </label>
          ))}
        </div>
      </div>

      {depth >= 3 && (
        <div className="control-group">
          <label>Max pairs</label>
          <input
            type="number"
            min={1000}
            max={50000}
            step={1000}
            value={maxPairs}
            onChange={(e) => setMaxPairs(Number(e.target.value))}
            style={{ width: '5rem' }}
          />
        </div>
      )}

      <button className="generate-btn" onClick={handleGenerate} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Generate & Filter'}
      </button>

      {stats.survived > 0 && (
        <div className="stats">
          {stats.survived} patterns survived in {stats.timeMs}ms
        </div>
      )}
    </div>
  );
}
