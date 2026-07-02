// 단일 도형 — 절대배치 Animated.View + 제스처(이동/리사이즈/회전).
// Edit + 선택 시에만 핸들/외곽선 노출. canvas pan 은 blocksExternalGesture 로 차단.
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, palette, pickOnFill, radius, spacing, typography } from '@shared/theme';

import { SHAPE_MAX_SIZE, SHAPE_MIN_SIZE, isAspectLocked } from '@entities/shape/consts';
import type { IShape } from '@entities/shape/types';

import ShapeFill from '../ShapeFill';

type GestureRef = React.MutableRefObject<unknown> | undefined;

interface Props {
  shape: IShape;
  editable: boolean;
  selected: boolean;
  /** 캔버스 줌 배율(제스처 델타 보정용) */
  scale: SharedValue<number>;
  /** 도화지 경계(이동·리사이즈 클램프 기준) — 프로젝트별 크기 */
  boardWidth: number;
  boardHeight: number;
  /** 캔버스 pan 제스처 ref — 도형 조작 시 캔버스 이동 차단 */
  canvasPanRef: GestureRef;
  onSelect: (id: string) => void;
  onTapViewer: (shape: IShape) => void;
  onCommit: (id: string, patch: Partial<IShape>) => void;
  /** Viewer 에서 자재 도형에 표시할 캡션(대표 자재명 + 추가 개수) */
  caption?: { name: string; extra: number };
  /** 검색 결과 이동 시 일시 하이라이트 */
  highlighted?: boolean;
}

const HANDLE = 26; // 핸들 지름(터치 타겟 위해 hitSlop 추가)

export default function ShapeView({
  shape,
  editable,
  selected,
  scale,
  boardWidth,
  boardHeight,
  canvasPanRef,
  onSelect,
  onTapViewer,
  onCommit,
  caption,
  highlighted,
}: Props) {
  const tx = useSharedValue(shape.x);
  const ty = useSharedValue(shape.y);
  const w = useSharedValue(shape.width);
  const h = useSharedValue(shape.height);
  const rot = useSharedValue(shape.rotation);

  // props(영속 결과·인스펙터 편집)로 shared value 동기화.
  useEffect(() => {
    tx.value = shape.x;
    ty.value = shape.y;
    w.value = shape.width;
    h.value = shape.height;
    rot.value = shape.rotation;
  }, [shape.x, shape.y, shape.width, shape.height, shape.rotation, tx, ty, w, h, rot]);

  const locked = isAspectLocked(shape.type);

  const containerStyle = useAnimatedStyle(() => ({
    width: w.value,
    height: h.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate: `${rot.value}deg` }],
  }));

  // 도형 회전을 상쇄해 캡션/배지가 항상 수평으로 보이게 한다.
  const counterRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rot.value}deg` }],
  }));

  // ── 탭: 선택(Edit) / 뷰어 콜백 ──
  const tap = Gesture.Tap().onEnd(() => {
    if (editable) scheduleOnRN(onSelect, shape.id);
    else scheduleOnRN(onTapViewer, shape);
  });

  // ── 드래그 이동(Edit) ──
  const drag = Gesture.Pan()
    .enabled(editable)
    .onBegin(() => {
      scheduleOnRN(onSelect, shape.id);
    })
    .onUpdate(e => {
      // 도화지 경계 안으로 제한 — 가장자리에 닿으면 딱 붙음.
      const nx = shape.x + e.translationX / scale.value;
      const ny = shape.y + e.translationY / scale.value;
      tx.value = clamp(nx, 0, boardWidth - shape.width);
      ty.value = clamp(ny, 0, boardHeight - shape.height);
    })
    .onEnd(() => {
      scheduleOnRN(onCommit, shape.id, { x: tx.value, y: ty.value });
    });
  if (canvasPanRef) drag.blocksExternalGesture(canvasPanRef as never);

  const bodyGesture = Gesture.Exclusive(drag, tap);

  // ── 리사이즈(우하단 핸들) ──
  const resize = Gesture.Pan()
    .onUpdate(e => {
      const dw = e.translationX / scale.value;
      const dh = e.translationY / scale.value;
      // 도화지 경계 넘지 않게 최대 크기 제한(좌상단 고정).
      const maxW = Math.min(SHAPE_MAX_SIZE, boardWidth - shape.x);
      const maxH = Math.min(SHAPE_MAX_SIZE, boardHeight - shape.y);
      let nw = clamp(shape.width + dw, SHAPE_MIN_SIZE, maxW);
      let nh = locked ? nw : clamp(shape.height + dh, SHAPE_MIN_SIZE, maxH);
      if (locked) {
        nw = Math.min(nw, maxH);
        nh = nw;
      }
      w.value = nw;
      h.value = nh;
    })
    .onEnd(() => {
      scheduleOnRN(onCommit, shape.id, { width: w.value, height: h.value });
    });
  if (canvasPanRef) resize.blocksExternalGesture(canvasPanRef as never);

  // ── 회전(상단 핸들) — 수평 드래그로 각도 증감 ──
  const rotate = Gesture.Pan()
    .onUpdate(e => {
      rot.value = shape.rotation + e.translationX * 0.5;
    })
    .onEnd(() => {
      scheduleOnRN(onCommit, shape.id, { rotation: Math.round(rot.value) });
    });
  if (canvasPanRef) rotate.blocksExternalGesture(canvasPanRef as never);

  const showHandles = editable && selected;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <GestureDetector gesture={bodyGesture}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <ShapeFill type={shape.type} color={shape.color} label={shape.label} />
        </Animated.View>
      </GestureDetector>

      {/* 자재명 캡션 — 도형 회전과 무관하게 항상 수평 (Viewer·Edit 공통) */}
      {caption ? (
        <Animated.View style={[styles.caption, counterRotateStyle]} pointerEvents='none'>
          <Text style={[typography.metadata, { color: pickOnFill(shape.color) }]} numberOfLines={2}>
            {caption.name}
          </Text>
        </Animated.View>
      ) : null}

      {/* 추가 자재 개수 배지 — 도형 최우측 최상단 원형 */}
      {caption && caption.extra > 0 ? (
        <Animated.View style={[styles.countBadge, counterRotateStyle]} pointerEvents='none'>
          <Text style={styles.countText}>+{caption.extra}</Text>
        </Animated.View>
      ) : null}

      {/* 별칭 배지 */}
      {shape.alias ? (
        <View style={styles.aliasBadge} pointerEvents='none'>
          <Text style={styles.aliasText}>{shape.alias}</Text>
        </View>
      ) : null}

      {/* 선택/하이라이트 외곽선 */}
      {selected || highlighted ? <View style={styles.outline} pointerEvents='none' /> : null}

      {/* 핸들 */}
      {showHandles ? (
        <>
          <GestureDetector gesture={rotate}>
            <View style={[styles.handle, styles.rotateHandle]} hitSlop={12} />
          </GestureDetector>
          <GestureDetector gesture={resize}>
            <View style={[styles.handle, styles.resizeHandle]} hitSlop={12} />
          </GestureDetector>
        </>
      ) : null}
    </Animated.View>
  );
}

function clamp(v: number, lo: number, hi: number): number {
  'worklet';
  return Math.min(Math.max(v, lo), hi);
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, top: 0 },
  outline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: palette.handle,
    borderRadius: radius.soft,
  },
  caption: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  aliasBadge: {
    position: 'absolute',
    top: -spacing.sm,
    left: -spacing.sm,
    minWidth: 20,
    height: 20,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.circle,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aliasText: { ...typography.metadata, color: colors.canvas, fontSize: 11, lineHeight: 14 },
  countBadge: {
    position: 'absolute',
    top: -spacing.sm,
    right: -spacing.sm,
    minWidth: 24,
    height: 24,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.circle,
    backgroundColor: colors.canvas,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { ...typography.metadata, color: colors.textPrimary, fontSize: 12, lineHeight: 15 },
  handle: {
    position: 'absolute',
    width: HANDLE,
    height: HANDLE,
    borderRadius: radius.circle,
    backgroundColor: colors.canvas,
    borderWidth: 2,
    borderColor: palette.handle,
  },
  rotateHandle: { top: -HANDLE - 6, alignSelf: 'center', left: '50%', marginLeft: -HANDLE / 2 },
  resizeHandle: { bottom: -HANDLE / 2, right: -HANDLE / 2 },
});
