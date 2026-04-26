import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = { html: string; filterKey: string };

export function LeafletMap({ html, filterKey }: Props) {
  return (
    <WebView
      key={filterKey}
      source={{ html }}
      style={StyleSheet.absoluteFill}
      scrollEnabled={false}
      bounces={false}
      originWhitelist={["*"]}
      mixedContentMode="always"
      javaScriptEnabled
      domStorageEnabled
    />
  );
}

