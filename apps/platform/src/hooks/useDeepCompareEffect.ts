'use client';

import type { DependencyList } from 'react';
import { useEffect, useRef } from 'react';

// Type guard: checks if value is a plain object
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Deep equality comparison function
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;

  // primitives
  if (typeof a !== 'object') return a === b;

  // array check
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // object check
  if (isObject(a) && isObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!(key in b)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
}

// Deep compare dependencies
function useDeepCompareMemoize(
  value: DependencyList | undefined,
): DependencyList | undefined {
  const ref = useRef<DependencyList | undefined>(undefined);

  if (!deepEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

function useDeepCompareEffect(
  effect: React.EffectCallback,
  deps?: DependencyList,
): void {
  const memoizedDeps = useDeepCompareMemoize(deps);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- we dont need to include effect in deps
  useEffect(effect, memoizedDeps);
}

export default useDeepCompareEffect;
