// 프로젝트 캔버스 위젯 — Phase 1: pan/zoom + 도형 7종 배치·조작.
// shape feature 합성. 데이터는 features/shape/hooks 경유(repository 직접 호출 없음).
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IShape } from '@entities/shape/types';
import { useShapeCanvas } from '@features/shape/hooks/useShapeCanvas';
import { useEditorStore } from '@features/shape/stores/editor';
import ShapeView from '@features/shape/ui/ShapeView';
import ShapePalette from '@features/shape/ui/ShapePalette';
import ShapeInspector from '@features/shape/ui/ShapeInspector';
import MaterialPanel from '@features/material/ui/MaterialPanel';
import { useProjectMaterials } from '@features/material/hooks/useProjectMaterials';
import BottomSheet from '@shared/components/customs/BottomSheet';
import { colors, spacing, typography } from '@shared/theme';

/** 시트 헤더 타이틀 — 별칭 > 라벨 > 기본명. */
function shapeTitle(shape: IShape): string {
  return shape.alias || shape.label || (shape.category === 'material' ? '자재 랙' : '공간');
}

interface Props {
  projectId: string;
  /** 뷰어에서 자재 도형 탭(Phase 2~3 바텀시트). Phase 1 은 선택만. */
  onTapMaterialShape?: (shape: IShape) => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

export default function ProjectCanvas({ projectId, onTapMaterialShape }: Props) {
  const insets = useSafeAreaInsets();
  const { shapes, loaded, addShape, updateShape, removeShape } = useShapeCanvas(projectId);

  const mode = useEditorStore((s) => s.mode);
  const selectedId = useEditorStore((s) => s.selectedShapeId);
  const select = useEditorStore((s) => s.select);
  const editable = mode === 'edit';

  const selectedShape = useMemo(
    () => shapes.find((s) => s.id === selectedId) ?? null,
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

  // 시트 닫힘(편집 반영) 시 자재명 갱신.
  useEffect(() => {
    if (!sheetShape) reloadMaterials();
  }, [sheetShape, reloadMaterials]);

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
    .onUpdate((e) => {
      panX.value = startX.value + e.translationX;
      panY.value = startY.value + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = startScale.value * e.scale;
      scale.value = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
    });

  const tapBackground = Gesture.Tap().onEnd(() => {
    runOnJS(select)(null);
  });

  const canvasGesture = Gesture.Race(
    tapBackground,
    Gesture.Simultaneous(pan, pinch),
  );

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: panX.value },
      { translateY: panY.value },
      { scale: scale.value },
    ],
  }));

  const onTapViewer = (shape: IShape) => {
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
      <View style={styles.canvas}>
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        <Animated.View style={[StyleSheet.absoluteFill, contentStyle]} pointerEvents="box-none">
          {shapes.map((shape) => (
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
              caption={captionOf(shape)}
            />
          ))}
        </Animated.View>

        {showEmpty ? (
          <View style={styles.empty} pointerEvents="none">
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
              onUpdate={(patch) => updateShape(selectedShape.id, patch)}
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
});
