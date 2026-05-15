// Route entry · the heavy implementation lives in `components/mapa/` so Metro
// can resolve `.native.tsx` vs `.web.tsx` cleanly. expo-router's require.context
// scans `app/` and bundles every file regardless of extension · putting the
// native-only `react-native-maps` import outside `app/` lets the web build
// skip it without errors.
export { default } from "@/components/mapa";
