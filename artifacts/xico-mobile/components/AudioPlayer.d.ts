// Type shim for the platform-split AudioPlayer component.
// Metro resolves `@/components/AudioPlayer` to either AudioPlayer.native.tsx
// (iOS/Android) or AudioPlayer.web.tsx at runtime via platform extensions.
// TypeScript, however, doesn't follow Metro's platform-suffix resolution by
// default — so we declare the public surface here for the type-checker.
//
// Both runtime implementations share the same `Props` shape and exported
// function name; keep this declaration in sync if those signatures change.

import * as React from "react";

export interface AudioPlayerProps {
  ttsUri: string;
  accent: string;
}

export function AudioPlayer(props: AudioPlayerProps): React.ReactElement;
