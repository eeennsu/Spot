// 프로젝트 캔버스 위젯 — Phase 1: pan/zoom + 도형 7종 배치·조작.
// shape feature 합성. 데이터는 features/shape/hooks 경유(repository 직접 호출 없음).
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomSheet from '@shared/components/customs/BottomSheet';
import { colors, spacing, typography } from '@shared/theme';

import type { IShape } from '@entities/shape/types';

import { useLearnData } from '@features/learn/hooks/useLearnData';
import { useLearnStore } from '@features/learn/stores/learn';
import type { ILearnType } from '@features/learn/types';
import LearnBar from '@features/learn/ui/LearnBar';
import LearnStart from '@features/learn/ui/LearnStart';
import { useProjectMaterials } from '@features/material/hooks/useProjectMaterials';
import MaterialPanel from '@features/material/ui/MaterialPanel';
import { useExportPdf } from '@features/pdf/hooks/useExportPdf';
import { useShapeCanvas } from '@features/shape/hooks/useShapeCanvas';
import { useEditorStore } from '@features/shape/stores/editor';
import ShapeInspector from '@features/shape/ui/ShapeInspector';
import ShapePalette from '@features/shape/ui/ShapePalette';
import ShapeView from '@features/shape/ui/ShapeView';

/** 시트 헤더 타이틀 — 별칭 > 라벨 > 기본명. */
function shapeTitle(shape: IShape): string {
  return shape.alias || shape.label || (shape.category === 'material' ? '자재 랙' : '공간');
}

interface Props {
  projectId: string;
  /** 뷰어에서 자재 도형 탭(Phase 2~3 바텀시트). Phase 1 은 선택만. */
  onTapMaterialShape?: (shape: IShape) => void;
  /** 검색 결과 이동 대상 도형 — 중앙 정렬 + 하이라이트 + (자재면) 시트 열기 */
  focusShapeId?: string;
  /** PDF 제목 */
  projectName?: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

export default function ProjectCanvas({
  projectId,
  onTapMaterialShape,
  focusShapeId,
  projectName,
}: Props) {
  const insets = useSafeAreaInsets();
  const canvasRef = useRef<View>(null);
  const { exportPdf, exporting } = useExportPdf();
  const { shapes, loaded, addShape, updateShape, removeShape } = useShapeCanvas(projectId);

  const mode = useEditorStore(s => s.mode);
  const selectedId = useEditorStore(s => s.selectedShapeId);
  const select = useEditorStore(s => s.select);
  const editable = mode === 'edit';

  const selectedShape = useMemo(
    () => shapes.find(s => s.id === selectedId) ?? null,
    [shapes, selectedId],
  );

  // 캔버스 변환 상태
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const scale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startScale = useSharedValue(1);

  const canvasPanRef = useRef<unknown>(undefined);

  // 자재 패널(바텀시트) 대상 도형
  const [sheetShape, setSheetShape] = useState<IShape | null>(null);

  // Viewer 캔버스 라벨용 자재명 맵
  const { namesByShape, reload: reloadMaterials } = useProjectMaterials(projectId);

  // 학습 모드
  const { count: learnCount, reload: reloadQuiz } = useLearnData(projectId);
  const learnActive = useLearnStore(s => s.active);
  const learnType = useLearnStore(s => s.type);
  const learnIndex = useLearnStore(s => s.index);
  const learnNameQs = useLearnStore(s => s.name);
  const startLearnStore = useLearnStore(s => s.start);
  const answerPosition = useLearnStore(s => s.answerPosition);
  const stopLearn = useLearnStore(s => s.stop);
  const [learnChooser, setLearnChooser] = useState(false);

  // 학습 중 편집 진입 시 학습 종료(혼선 방지).
  useEffect(() => {
    if (editable && learnActive) stopLearn();
  }, [editable, learnActive, stopLearn]);

  const learnTargetShapeId =
    learnActive && learnType === 'name' ? learnNameQs[learnIndex]?.shapeId : undefined;

  const startLearn = async (type: ILearnType) => {
    const set = await reloadQuiz();
    setSheetShape(null);
    setLearnChooser(false);
    startLearnStore(type, set.position, set.name);
  };

  // 시트 닫힘(편집 반영) 시 자재명 갱신.
  useEffect(() => {
    if (!sheetShape) reloadMaterials();
  }, [sheetShape, reloadMaterials]);

  // 캔버스 크기(중앙 정렬 계산용) + 검색 하이라이트
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // 검색 결과 포커스: 중앙 정렬 + 하이라이트 + 자재면 시트.
  useEffect(() => {
    if (!focusShapeId || !loaded || canvasSize.w === 0) return;
    const target = shapes.find(s => s.id === focusShapeId);
    if (!target) return;
    scale.value = withTiming(1, { duration: 220 });
    panX.value = withTiming(canvasSize.w / 2 - (target.x + target.width / 2), { duration: 260 });
    panY.value = withTiming(canvasSize.h / 2 - (target.y + target.height / 2), { duration: 260 });
    setHighlightId(target.id);
    if (target.category === 'material') setSheetShape(target);
    const t = setTimeout(() => setHighlightId(null), 1800);
    return () => clearTimeout(t);
    // panX/panY/scale 는 shared value(안정 참조)라 deps 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusShapeId, loaded, canvasSize.w, canvasSize.h, shapes]);

  const captionOf = (shape: IShape): string | undefined => {
    if (shape.category !== 'material') return undefined;
    const names = namesByShape[shape.id];
    if (!names || names.length === 0) return undefined;
    return names.length > 1 ? `${names[0]}  +${names.length - 1}` : names[0];
  };

  const pan = Gesture.Pan()
    .withRef(canvasPanRef as never)
    .averageTouches(true)
    .onBegin(() => {
      startX.value = panX.value;
      startY.value = panY.value;
    })
    .onUpdate(e => {
      panX.value = startX.value + e.translationX;
      panY.value = startY.value + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate(e => {
      const next = startScale.value * e.scale;
      scale.value = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
    });

  const tapBackground = Gesture.Tap().onEnd(() => {
    runOnJS(select)(null);
  });

  const canvasGesture = Gesture.Race(tapBackground, Gesture.Simultaneous(pan, pinch));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: panX.value }, { translateY: panY.value }, { scale: scale.value }],
  }));

  const onTapViewer = (shape: IShape) => {
    // 학습 위치 맞히기: 탭이 곧 응답(시트 열지 않음)
    if (learnActive) {
      if (learnType === 'position') answerPosition(shape.id);
      return;
    }
    if (shape.category !== 'material') return;
    onTapMaterialShape?.(shape);
    setSheetShape(shape); // 읽기전용 자재 패널
  };

  const onDelete = async () => {
    if (!selectedShape) return;
    await removeShape(selectedShape.id);
    select(null);
  };

  const showEmpty = loaded && shapes.length === 0;

  return (
    <View style={styles.root}>
      <View
        ref={canvasRef}
        collapsable={false}
        style={styles.canvas}
        onLayout={e =>
          setCanvasSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
        }
      >
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        <Animated.View style={[StyleSheet.absoluteFill, contentStyle]} pointerEvents='box-none'>
          {shapes.map(shape => (
            <ShapeView
              key={shape.id}
              shape={shape}
              editable={editable}
              selected={selectedId === shape.id}
              scale={scale}
              canvasPanRef={canvasPanRef as never}
              onSelect={select}
              onTapViewer={onTapViewer}
              onCommit={updateShape}
              caption={learnActive ? undefined : captionOf(shape)}
              highlighted={highlightId === shape.id || learnTargetShapeId === shape.id}
            />
          ))}
        </Animated.View>

        {showEmpty ? (
          <View style={styles.empty} pointerEvents='none'>
            <Text style={[typography.body, styles.emptyText]}>
              {editable
                ? '아래 팔레트에서 도형을 추가하세요'
                : '도형이 없습니다. 우상단 편집을 눌러 추가하세요'}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Edit 하단: 인스펙터(선택 시) 또는 팔레트 */}
      {editable ? (
        <View style={{ paddingBottom: insets.bottom }}>
          {selectedShape ? (
            <ShapeInspector
              shape={selectedShape}
              onUpdate={patch => updateShape(selectedShape.id, patch)}
              onDelete={onDelete}
              onClose={() => select(null)}
              onManageMaterials={() => setSheetShape(selectedShape)}
            />
          ) : (
            <View style={styles.paletteWrap}>
              <ShapePalette onAdd={addShape} />
            </View>
          )}
        </View>
      ) : null}

      {/* Viewer FAB — 학습 + PDF (학습 진행 중엔 숨김) */}
      {!editable && !learnActive ? (
        <>
          <Pressable
            onPress={() => setLearnChooser(true)}
            style={[styles.fab, styles.fabSecondary, { bottom: insets.bottom + spacing.xl + 60 }]}
          >
            <Text style={[styles.fabText, { color: colors.blue }]}>학습</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              exportPdf({ viewRef: canvasRef, projectId, title: projectName ?? '평면도' })
            }
            disabled={exporting}
            style={[
              styles.fab,
              { bottom: insets.bottom + spacing.xl },
              exporting && styles.fabDisabled,
            ]}
          >
            <Text style={styles.fabText}>{exporting ? '...' : 'PDF'}</Text>
          </Pressable>
        </>
      ) : null}

      {/* 학습 하단 바 */}
      {learnActive ? <LearnBar onRestart={() => startLearn(learnType)} /> : null}

      {/* 학습 시작 선택 시트 */}
      <LearnStart
        visible={learnChooser}
        count={learnCount}
        onClose={() => setLearnChooser(false)}
        onPick={startLearn}
      />

      {/* 자재 패널 바텀시트 — Edit=편집 / Viewer=읽기 */}
      <BottomSheet visible={!!sheetShape} onClose={() => setSheetShape(null)}>
        {sheetShape ? (
          <MaterialPanel
            shapeId={sheetShape.id}
            title={shapeTitle(sheetShape)}
            editable={editable}
          />
        ) : null}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  canvas: { flex: 1, overflow: 'hidden', backgroundColor: colors.canvas },
  empty: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: { color: colors.textSecondary, textAlign: 'center' },
  paletteWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.canvas,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    minWidth: 56,
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    // magicPlus 글로우 토큰과 동일 의도
    shadowColor: colors.blue,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  fabSecondary: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowOpacity: 0.12,
    shadowColor: colors.textPrimary,
  },
  fabDisabled: { opacity: 0.6 },
  fabText: { ...typography.button, color: colors.canvas },
});
