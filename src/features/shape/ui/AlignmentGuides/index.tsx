// 정렬 가이드선 — 스냅 흡착 순간 기준선(세로/가로)을 도화지 위에 표시.
// 도화지 변환(pan/zoom) 안에 위치하므로 좌표는 보드 좌표 그대로 쓴다(선이 도형과 함께 이동·확대).
// guideX/guideY: 보드 좌표. -1 이면 숨김. 선 두께는 1/scale 로 역보정해 줌 무관 ~1.5px 유지.
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { colors } from '@shared/theme';

/** 화면상 선 두께(dp) — scale 역보정 기준 */
const LINE = 1.5;

interface Props {
  /** 세로 가이드선 x(보드 좌표), -1=숨김 */
  guideX: SharedValue<number>;
  /** 가로 가이드선 y(보드 좌표), -1=숨김 */
  guideY: SharedValue<number>;
  scale: SharedValue<number>;
  boardW: SharedValue<number>;
  boardH: SharedValue<number>;
}

export default function AlignmentGuides({ guideX, guideY, scale, boardW, boardH }: Props) {
  const vStyle = useAnimatedStyle(() => {
    const w = LINE / scale.value;
    return {
      opacity: guideX.value < 0 ? 0 : 1,
      width: w,
      height: boardH.value,
      transform: [{ translateX: guideX.value - w / 2 }],
    };
  });

  const hStyle = useAnimatedStyle(() => {
    const h = LINE / scale.value;
    return {
      opacity: guideY.value < 0 ? 0 : 1,
      height: h,
      width: boardW.value,
      transform: [{ translateY: guideY.value - h / 2 }],
    };
  });

  return (
    <>
      <Animated.View pointerEvents='none' style={[styles.line, vStyle]} />
      <Animated.View pointerEvents='none' style={[styles.line, hStyle]} />
    </>
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: colors.snapGuide,
  },
});
