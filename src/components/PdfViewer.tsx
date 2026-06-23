import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type WebViewType from 'react-native-webview';

export type PdfViewerRef = WebViewType;

interface Props {
  uri: string;
  style?: object;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  webRef?: React.RefObject<WebViewType>;
}

export function PdfViewer({ uri, style, onLoadStart, onLoadEnd, webRef }: Props) {
  return (
    <WebView
      ref={webRef}
      source={{ uri }}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      style={[styles.fill, style]}
    />
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
