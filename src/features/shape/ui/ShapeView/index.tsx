// 단일 도형 — 절대배치 Animated.View + 제스처(이동/리사이즈/회전).
// Edit + 선택 시에만 핸들/외곽선 노출. canvas pan 은 blocksExternalGesture 로 차단.
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import {
  colors,
  elevation,
  motion,
  palette,
  pickOnFill,
  radius,
  spacing,
  typography,
} from '@shared/theme';
import { utilHaptic } from '@shared/utils/util_haptics';

import {
  SHAPE_MAX_SIZE,
  SHAPE_MIN_SIZE,
  SHAPE_ROTATE_SNAP_THRESHOLD,
  SHAPE_ROTATE_STEP,
  isAspectLocked,
} from '@entities/shape/consts';
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

const HANDLE = 32; // 핸들 지름(터치 타겟 위해 hitSlop 추가)
const HANDLE_HITSLOP = 22; // 핸들 주변 여유 터치 영역 — 잘 눌리게
const LIFT_SCALE = motion.magicPlusLiftScale; // 드래그 시작 시 살짝 들어올림

/** 각도 스냅 — 카디널(90배수) 우선 흡착, 아니면 STEP 배수로 반올림. */
function snapAngle(deg: number): number {
  'worklet';
  const a = ((deg % 360) + 360) % 360;
  const nearest90 = Math.round(a / 90) * 90;
  if (Math.abs(a - nearest90) < SHAPE_ROTATE_SNAP_THRESHOLD) return nearest90 % 360;
  return (Math.round(a / SHAPE_ROTATE_STEP) * SHAPE_ROTATE_STEP) % 360;
}

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
  const lift = useSharedValue(1); // 드래그 들어올림 스케일
  const pulse = useSharedValue(0); // 검색 하이라이트 맥동

  // props(영속 결과·인스펙터 편집)로 shared value 동기화.
  useEffect(() => {
    tx.value = shape.x;
    ty.value = shape.y;
    w.value = shape.width;
    h.value = shape.height;
    rot.value = shape.rotation;
  }, [shape.x, shape.y, shape.width, shape.height, shape.rotation, tx, ty, w, h, rot]);

  // 하이라이트 동안 외곽선 맥동(검색 결과 눈에 띄게).
  useEffect(() => {
    if (highlighted) {
      pulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 450 }), withTiming(0, { duration: 450 })),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(0, { duration: 150 });
    }
  }, [highlighted, pulse]);

  const locked = isAspectLocked(shape.type);
  // 도형 중앙 라벨/캡션 폰트 — 도형 크기에 비례(작으면 축소, 크면 확대).
  // 리사이즈 중 라이브 스케일: w/h 공유값에서 폰트 크기 산출(shapeLabelFontSize 와 동일 클램프).
  const liveFontSize = useDerivedValue(() => {
    const base = Math.min(w.value, h.value) * 0.3;
    return Math.round(Math.min(48, Math.max(16, base)));
  });
  // 작은 도형일수록 핸들 hitSlop 을 줄여 본체(이동) 터치영역을 남긴다.
  const handleSlop = Math.max(
    8,
    Math.min(HANDLE_HITSLOP, Math.floor(Math.min(shape.width, shape.height) / 4)),
  );

  const containerStyle = useAnimatedStyle(() => ({
    width: w.value,
    height: h.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
      { scale: lift.value },
    ],
  }));

  // 도형 회전을 상쇄해 캡션/배지가 항상 수평으로 보이게 한다.
  const counterRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rot.value}deg` }],
  }));

  const highlightStyle = useAnimatedStyle(() => ({ opacity: 0.45 + pulse.value * 0.55 }));

  // 캡션 폰트를 리사이즈 제스처 동안 부드럽게 스케일(commit 시 튀지 않게).
  const captionFontStyle = useAnimatedStyle(() => ({
    fontSize: liveFontSize.value,
    lineHeight: Math.round(liveFontSize.value * 1.2),
  }));

  // ── 핸들 줌 역보정(S1) ──
  // 도화지는 scale.value 로 확대/축소되어 렌더된다. 핸들은 보드 좌표 고정(32dp)이라
  // 줌아웃(도화지 최대 4000dp, fit-scale 0.1 미만) 시 화면상 3~6px 로 쪼그라들어
  // 리사이즈/회전을 손으로 잡을 수 없다(캔버스 최다 불만). → 1/scale 로 역보정해
  // 화면상 크기를 ~32dp 로 유지한다. 핸들 View 자체가 커지므로 터치 타겟도 함께 커진다.
  // 배율 클램프 [1, 12]:
  //  · 하한 1 — 줌인(scale>1)에도 기본 32dp 밑으로 줄이지 않는다(effective factor = max(1, 1/scale)).
  //  · 상한 12 — 극단 줌아웃에서 핸들이 도형을 통째로 덮지 않도록 확대 상한.
  //    (상한에 걸리는 scale≈0.083 이하부턴 화면상 크기가 다시 줄지만 그런 극단 줌은 드묾.)
  const handleScale = useDerivedValue(() => clamp(1 / scale.value, 1, 12));

  // 리사이즈 핸들 — 중심을 도형 우하단 모서리에 고정(오프셋 = -size/2)한 채 역보정 확대.
  const resizeHandleStyle = useAnimatedStyle(() => {
    const f = handleScale.value;
    const size = HANDLE * f;
    return {
      width: size,
      height: size,
      bottom: -size / 2,
      right: -size / 2,
      borderWidth: 2 * f, // 테두리도 함께 키워 흰 도화지 위에서 계속 보이게
    };
  });

  // 회전 핸들 — 상단 회전점(기존 중심 y = -HANDLE/2 - 6)에 중심 고정, 수평 중앙 유지하며 확대.
  const rotateHandleStyle = useAnimatedStyle(() => {
    const f = handleScale.value;
    const size = HANDLE * f;
    return {
      width: size,
      height: size,
      top: -HANDLE / 2 - 6 - size / 2,
      marginLeft: -size / 2,
      borderWidth: 2 * f,
    };
  });

  // ── 탭: 선택(Edit) / 뷰어 콜백 ──
  const tap = Gesture.Tap().onEnd(() => {
    if (editable) {
      scheduleOnRN(onSelect, shape.id);
      scheduleOnRN(utilHaptic, 'light');
    } else {
      scheduleOnRN(onTapViewer, shape);
    }
  });

  // ── 드래그 이동(Edit) ──
  const drag = Gesture.Pan()
    .enabled(editable)
    // 이동만 하려는데 수정 패널이 뜨는 불편 제거(#9): 드래그는 선택하지 않는다.
    // 선택(인스펙터 열기)은 탭에서만. 드래그는 순수 이동.
    .onStart(() => {
      // 실제 드래그 시작 시 들어올림 + 픽업 햅틱.
      lift.value = withTiming(LIFT_SCALE, { duration: 120 });
      scheduleOnRN(utilHaptic, 'medium');
    })
    .onUpdate(e => {
      const nx = shape.x + e.translationX / scale.value;
      const ny = shape.y + e.translationY / scale.value;
      // 회전 고려한 AABB 클램프 — 회전된 도형도 도화지 밖으로 안 나가게.
      const r = (shape.rotation * Math.PI) / 180;
      const halfW =
        (Math.abs(shape.width * Math.cos(r)) + Math.abs(shape.height * Math.sin(r))) / 2;
      const halfH =
        (Math.abs(shape.width * Math.sin(r)) + Math.abs(shape.height * Math.cos(r))) / 2;
      const cx = clamp(nx + shape.width / 2, halfW, boardWidth - halfW);
      const cy = clamp(ny + shape.height / 2, halfH, boardHeight - halfH);
      tx.value = cx - shape.width / 2;
      ty.value = cy - shape.height / 2;
    })
    .onEnd(() => {
      lift.value = withTiming(1, { duration: 150 });
      scheduleOnRN(onCommit, shape.id, { x: tx.value, y: ty.value });
    });
  if (canvasPanRef) drag.blocksExternalGesture(canvasPanRef as never);

  const bodyGesture = Gesture.Exclusive(drag, tap);

  // ── 리사이즈(우하단 핸들) ──
  const resize = Gesture.Pan()
    .onUpdate(e => {
      // 화면 델타를 도형 로컬 축으로 역회전 보정 → 핸들 방향과 성장 방향 일치.
      const r = (shape.rotation * Math.PI) / 180;
      const sdx = e.translationX / scale.value;
      const sdy = e.translationY / scale.value;
      const dw = sdx * Math.cos(r) + sdy * Math.sin(r);
      const dh = -sdx * Math.sin(r) + sdy * Math.cos(r);
      // 축정렬 도형만 도화지 경계로 상한; 회전 도형은 단순 상한(경계 클램프 부정확 방지).
      const rotated = shape.rotation % 360 !== 0;
      const maxW = rotated ? SHAPE_MAX_SIZE : Math.min(SHAPE_MAX_SIZE, boardWidth - shape.x);
      const maxH = rotated ? SHAPE_MAX_SIZE : Math.min(SHAPE_MAX_SIZE, boardHeight - shape.y);
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

  // ── 회전(상단 핸들) — 수평 드래그로 각도 증감, 종료 시 스냅 흡착 ──
  const rotate = Gesture.Pan()
    .onUpdate(e => {
      rot.value = shape.rotation + e.translationX * 0.5;
    })
    .onEnd(() => {
      const snapped = snapAngle(rot.value);
      rot.value = withTiming(snapped, { duration: 150 });
      scheduleOnRN(onCommit, shape.id, { rotation: snapped });
      scheduleOnRN(utilHaptic, 'light');
    });
  if (canvasPanRef) rotate.blocksExternalGesture(canvasPanRef as never);

  const showHandles = editable && selected;
  // 기울기(회전) 핸들은 ㄱ자(L) 도형만 노출(#1).
  const canRotate = shape.type === 'L';
  // 도형 이름(중앙 표시) — 공간=label, 자재=alias(없으면 대표 자재명 캡션)(#4/#8).
  const centerName = shape.category === 'space' ? shape.label : shape.alias || caption?.name;

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(140)}
    >
      <GestureDetector gesture={bodyGesture}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <ShapeFill type={shape.type} color={shape.color} />
        </Animated.View>
      </GestureDetector>

      {/* 도형 이름(중앙) — 회전과 무관하게 항상 수평 (Viewer·Edit 공통) */}
      {centerName ? (
        <Animated.View style={[styles.caption, counterRotateStyle]} pointerEvents='none'>
          <Animated.Text
            style={[typography.metadata, { color: pickOnFill(shape.color) }, captionFontStyle]}
            numberOfLines={2}
          >
            {centerName}
          </Animated.Text>
        </Animated.View>
      ) : null}

      {/* 추가 자재 개수 배지 — 도형 우상단 원형(도형 위로 떠 보이게 크게·zIndex·그림자) */}
      {caption && caption.extra > 0 ? (
        <Animated.View style={[styles.countBadge, counterRotateStyle]} pointerEvents='none'>
          <Text style={styles.countText}>+{caption.extra}</Text>
        </Animated.View>
      ) : null}

      {/* 선택 외곽선(정적) */}
      {selected ? <View style={styles.outline} pointerEvents='none' /> : null}

      {/* 검색 하이라이트 외곽선(맥동) */}
      {highlighted ? (
        <Animated.View style={[styles.highlightOutline, highlightStyle]} pointerEvents='none' />
      ) : null}

      {/* 핸들 */}
      {showHandles ? (
        <>
          {/* 기울기(회전) 핸들 — ㄱ자(L) 도형만. 나머지는 회전 불필요(#1). */}
          {canRotate ? (
            <GestureDetector gesture={rotate}>
              <Animated.View
                style={[styles.handle, styles.rotateHandle, rotateHandleStyle]}
                hitSlop={handleSlop}
              />
            </GestureDetector>
          ) : null}
          <GestureDetector gesture={resize}>
            <Animated.View
              style={[styles.handle, styles.resizeHandle, resizeHandleStyle]}
              hitSlop={handleSlop}
            />
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
  // 도형은 화면의 주인공 — 흰 도화지 위에서 떠 보이도록 아주 옅은 그림자.
  // (UI 크롬은 flat 유지, 콘텐츠 오브젝트만 살짝 깊이를 준다.)
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    ...elevation.dragLift,
  },
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
  highlightOutline: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderWidth: 3,
    borderColor: colors.blue,
    borderRadius: radius.standard,
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
  countBadge: {
    position: 'absolute',
    top: -spacing.sm,
    right: -spacing.sm,
    minWidth: 30,
    height: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.circle,
    backgroundColor: colors.canvas,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    ...elevation.sheet,
  },
  countText: { ...typography.metadata, color: colors.textPrimary, fontSize: 14, lineHeight: 16 },
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
