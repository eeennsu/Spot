// PDF 출력 훅 — 도화지 캡처 + HTML → expo-print → 공유.
// 파일명 = "YYYY-MM-DD_평면도이름.pdf" (printToFileAsync 는 랜덤명이라 원하는 이름으로 복사).
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { captureRef } from 'react-native-view-shot';

import { utilHapticNotify } from '@shared/utils/util_haptics';
import { utilToast } from '@shared/utils/util_toast';

import buildPdfHtml from '../libs/build_html';

interface ExportArgs {
  /** 캡처 대상 뷰 ref(도화지 전체 — 뷰포트 아님). 줌/팬 무관하게 도화지 전체가 잡힌다. */
  viewRef: React.RefObject<unknown>;
  /** PDF 제목 = 평면도(프로젝트) 이름 */
  title: string;
}

/** 파일명 금지 문자 제거 + 공백 정리. 비면 기본명. */
function safeFileName(s: string): string {
  return s.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim() || '평면도';
}

/** 로컬 날짜 YYYY-MM-DD. */
function dateStamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function useExportPdf() {
  const [exporting, setExporting] = useState(false);

  const exportPdf = async ({ viewRef, title }: ExportArgs) => {
    if (exporting) return;
    setExporting(true);
    try {
      const now = new Date();

      // 1) 도화지 전체 캡처(data-uri png). 뷰포트가 아니라 도화지 뷰 자체라 잘리지 않는다.
      const image = await captureRef(viewRef as never, {
        format: 'png',
        quality: 1,
        result: 'data-uri',
      });

      // 2) HTML(순수 도화지 이미지만, 비율 유지) → PDF
      const html = buildPdfHtml({ image });
      const { uri } = await Print.printToFileAsync({ html });

      // 3) "날짜_평면도이름.pdf" 로 복사 후 공유(공유 대화창 파일명이 이 이름으로 뜬다).
      const fileName = `${dateStamp(now)}_${safeFileName(title)}.pdf`;
      const dest = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.deleteAsync(dest, { idempotent: true });
      await FileSystem.copyAsync({ from: uri, to: dest });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dest, { mimeType: 'application/pdf', dialogTitle: `${title} PDF` });
        utilHapticNotify('success');
      } else {
        utilToast('이 기기에서 공유를 사용할 수 없어요');
      }
    } catch (error) {
      console.log('[useExportPdf] PDF 내보내기 실패:', error);
      utilToast('PDF 내보내기에 실패했어요');
      utilHapticNotify('error');
    } finally {
      setExporting(false);
    }
  };

  return { exportPdf, exporting };
}
