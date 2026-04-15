import {
  type FilterOpts,
  type PatternPair,
  type TagName,
  type TrajectoryData,
  autoTag,
  filterDegenerate,
  generatePairsSampled,
} from '@eml-fn/bullet-choreographer';
import { useCallback, useState } from 'react';

export interface PatternResult {
  pair: PatternPair;
  trajectory: TrajectoryData;
  tags: TagName[];
}

export function usePatternPipeline() {
  const [patterns, setPatterns] = useState<PatternResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ total: 0, survived: 0, timeMs: 0 });

  const generate = useCallback(
    (depth: number, leafTypes: string[], maxPairs: number, filterOpts?: FilterOpts) => {
      setIsProcessing(true);
      setPatterns([]);

      // Use setTimeout to let React render the loading state before blocking
      setTimeout(() => {
        const start = performance.now();

        const pairs = generatePairsSampled(depth, leafTypes, maxPairs);
        const results: PatternResult[] = [];

        for (const { pair, trajectory } of filterDegenerate(pairs, filterOpts)) {
          const tags = autoTag(pair, trajectory);
          pair.tags = tags;
          results.push({ pair, trajectory, tags });
        }

        const elapsed = performance.now() - start;

        setPatterns(results);
        setStats({
          total: -1,
          survived: results.length,
          timeMs: Math.round(elapsed),
        });
        setIsProcessing(false);
      }, 16);
    },
    [],
  );

  return { patterns, isProcessing, stats, generate };
}
