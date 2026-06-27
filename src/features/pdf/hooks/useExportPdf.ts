// PDF 출력 훅 — 캔버스 캡처 + 도형/자재 조회 → HTML → expo-print → 공유.
// pdf 는 shape·material 두 feature 데이터를 합성한다(다른 feature repository 직접 사용).
import { useState } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import repoShapeList from '@features/shape/repositories/list_shapes';
import repoMaterialFullByProject from '@features/material/repositories/list_full_by_project';
import type { IMaterial } from '@entities/material/types';

import buildPdfHtml, { type IPdfSection } from '../libs/build_html';

interface ExportArgs {
  /** 캡처 대상 뷰 ref(캔버스) */
  viewRef: React.RefObject<unknown>;
  projectId: string;
  title: string;
}

export function useExportPdf() {
  const [exporting, setExporting] = useState(false);

  const exportPdf = async ({ viewRef, projectId, title }: ExportArgs) => {
    if (exporting) return;
    setExporting(true);
    try {
      // 1) 현재 캔버스 캡처(data-uri png)
      const image = await captureRef(viewRef as never, {
        format: 'png',
        quality: 1,
        result: 'data-uri',
      });

      // 2) 도형(자재 도형) + 자재 조회 후 도형별 그룹화
      const shapes = await repoShapeList(projectId);
      const materials = await repoMaterialFullByProject(projectId);
      const byShape = new Map<string, IMaterial[]>();
      for (const m of materials) {
        const arr = byShape.get(m.shapeId) ?? [];
        arr.push(m);
        byShape.set(m.shapeId, arr);
      }
      const sections: IPdfSection[] = shapes
        .filter((s) => s.category === 'material')
        .map((s) => ({
          title: s.alias || s.label || '자재 랙',
          materials: (byShape.get(s.id) ?? []).sort((a, b) => a.layerOrder - b.layerOrder),
        }));

      // 3) HTML → PDF → 공유
      const html = buildPdfHtml({
        title,
        image,
        sections,
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
