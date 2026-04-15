import type { SafeOpts } from './types.js';

const DEFAULT_MAX_EXP = 500;
const DEFAULT_MIN_LOG_ARG = 1e-15;

/** Raw EML operation: exp(x) - ln(y). IEEE 754 behavior — no guards. */
export function eml(x: number, y: number): number {
  return Math.exp(x) - Math.log(y);
}

/** Clamped EML operation. Never returns NaN for finite inputs. */
export function safeEml(x: number, y: number, opts?: SafeOpts): number {
  const maxExp = opts?.maxExp ?? DEFAULT_MAX_EXP;
  const minLogArg = opts?.minLogArg ?? DEFAULT_MIN_LOG_ARG;

  const clampedX = Math.max(-maxExp, Math.min(x, maxExp));
  const clampedY = Math.max(y, minLogArg);

  if (opts?.onClamp === 'warn') {
    if (clampedX !== x) console.warn(`safeEml: x clamped from ${x} to ${clampedX}`);
    if (clampedY !== y) console.warn(`safeEml: y clamped from ${y} to ${clampedY}`);
  }

  const result = Math.exp(clampedX) - Math.log(clampedY);

  // Guard against ∞ - ∞ (shouldn't happen with clamping, but fallback)
  if (!Number.isFinite(result)) {
    return maxExp;
  }

  return result;
}
