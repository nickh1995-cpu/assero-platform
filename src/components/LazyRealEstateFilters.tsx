"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the heavy filter component
const RealEstateFilters = dynamic(() => import('./RealEstateFilters').then(mod => ({ default: mod.RealEstateFilters })), {
  ssr: false,
  loading: () => null,
});

export function LazyRealEstateFilters() {
  return (
    <Suspense fallback={null}>
      <RealEstateFilters />
    </Suspense>
  );
}
