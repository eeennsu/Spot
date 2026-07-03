// 도형 시각 채움 — type 별 모양. 컨테이너(부모) 크기를 100% 채운다.
// L(ㄴ자)는 SVG viewBox(0~100)로 그려 리사이즈 시 함께 스케일된다.
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';

import { pickOnFill } from '@shared/theme';
import { radius, spacing, typography } from '@shared/theme';

import type { IShapeType } from '@entities/shape/consts';

interface Props {
  type: IShapeType;
  color: string;
  /** 공간 도형 라벨(가운데 표시) */
  label?: string;
  /** 라벨 폰트 크기 공유값(dp) — 도형 크기에 비례, 리사이즈 중 라이브 스케일. 없으면 토큰 기본. */
  fontSize?: SharedValue<number>;
}

// ㄴ자 폴리곤(100×100 공간). 좌측 세로바 + 하단 가로바, 두께 45.
const L_POINTS = '0,0 45,0 45,55 100,55 100,100 0,100';

export default function ShapeFill({ type, color, label, fontSize }: Props) {
  // 라벨 폰트를 도형 크기에 맞춰 라이브로 스케일(shared value → animated fontSize).
  const labelFontStyle = useAnimatedStyle(() => {
    const sv = fontSize;
    if (!sv) return {};
    const fs = sv.value;
    return { fontSize: fs, lineHeight: Math.round(fs * 1.2) };
  });

  const labelNode = label ? (
    <Animated.Text
      style={[typography.shapeLabel, { color: pickOnFill(color) }, labelFontStyle]}
      numberOfLines={2}
    >
      {label}
    </Animated.Text>
  ) : null;

  if (type === 'L') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <Svg width='100%' height='100%' viewBox='0 0 100 100' preserveAspectRatio='none'>
          <Polygon points={L_POINTS} fill={color} />
        </Svg>
        {labelNode ? (
          <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents='none'>
            {labelNode}
          </View>
        ) : null}
      </View>
    );
  }

  const isCircle = type === 'circle';
  return (
    <View
      style={[
        styles.fill,
        { backgroundColor: color, borderRadius: isCircle ? radius.circle : radius.soft },
      ]}
    >
      {labelNode}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
});
