// PDF 출력 훅 — 캔버스 캡처 + 도형/자재 조회 → HTML → expo-print → 공유.
// pdf 는 shape·material 두 feature 데이터를 합성한다(다른 feature repository 직접 사용).
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { captureRef } from 'react-native-view-shot';

import buildPdfHtml from '../libs/build_html';

interface ExportArgs {
  /** 캡처 대상 뷰 ref(캔버스) */
  viewRef: React.RefObject<unknown>;
  projectId: string;
  title: string;
}

export function useExportPdf() {
  const [exporting, setExporting] = useState(false);

  const exportPdf = async ({ viewRef, title }: ExportArgs) => {
    if (exporting) return;
    setExporting(true);
    try {
      // 1) 현재 캔버스(도형으로 구성된 평면도) 캡처(data-uri png)
      const image = await captureRef(viewRef as never, {
        format: 'png',
        quality: 1,
        result: 'data-uri',
      });

      // 2) HTML(평면도 이미지만) → PDF → 공유
      const html = buildPdfHtml({
        title,
        image,
        dateText: new Date().toLocaleString('ko-KR'),
      });
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `${title} PDF` });
      }
    } finally {
      setExporting(false);
    }
  };

  return { exportPdf, exporting };
}
