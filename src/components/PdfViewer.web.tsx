import React from 'react';
import { View } from 'react-native';

export type PdfViewerRef = never;

interface Props {
  uri: string;
  style?: object;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  webRef?: React.RefObject<never>;
}

export function PdfViewer({ uri, style, onLoadEnd }: Props) {
  return (
    <View style={[{ flex: 1 }, style]}>
      {/* @ts-ignore — iframe is valid HTML JSX on web */}
      <iframe
        src={uri}
        onLoad={onLoadEnd}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        title="PDF Viewer"
      />
    </View>
  );
}
