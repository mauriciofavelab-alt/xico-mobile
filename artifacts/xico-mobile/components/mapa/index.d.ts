// Type declaration shim · Metro resolves `index.native.tsx` (iOS+Android) or
// `index.web.tsx` (web) at bundle time. TypeScript doesn't follow that
// platform-suffix resolution, so this `.d.ts` gives it a stable surface to
// type-check against. Both real implementations satisfy the same shape:
// a default-exported zero-arg React component.

import type { FunctionComponent } from "react";

declare const MapaScreen: FunctionComponent;
export default MapaScreen;
