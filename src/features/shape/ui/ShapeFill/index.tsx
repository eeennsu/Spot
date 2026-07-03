// 도형 시각 채움 — type 별 모양. 컨테이너(부모) 크기를 100% 채운다.
// L(ㄴ자)는 SVG viewBox(0~100)로 그려 리사이즈 시 함께 스케일된다.
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { pickOnFill } from '@shared/theme';
import { radius, spacing, typography } from '@shared/theme';

import type { IShapeType } from '@entities/shape/consts';

interface Props {
  type: IShapeType;
  color: string;
  /** 공간 도형 라벨(가운데 표시) */
  label?: string;
  /** 라벨 폰트 크기(dp) — 도형 크기에 비례. 없으면 토큰 기본. */
  fontSize?: number;
}

// ㄴ자 폴리곤(100×100 공간). 좌측 세로바 + 하단 가로바, 두께 45.
const L_POINTS = '0,0 45,0 45,55 100,55 100,100 0,100';

/** 폰트 크기 override 스타일(라벨 크기를 도형에 맞춤). */
function labelSize(fontSize?: number) {
  if (!fontSize) return null;
  return { fontSize, lineHeight: Math.round(fontSize * 1.2) };
}

export default function ShapeFill({ type, color, label, fontSize }: Props) {
  if (type === 'L') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <Svg width='100%' height='100%' viewBox='0 0 100 100' preserveAspectRatio='none'>
          <Polygon points={L_POINTS} fill={color} />
        </Svg>
        {label ? <Centered label={label} color={color} fontSize={fontSize} /> : null}
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
      {label ? (
        <Text
          style={[typography.shapeLabel, { color: pickOnFill(color) }, labelSize(fontSize)]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

function Centered({ label, color, fontSize }: { label: string; color: string; fontSize?: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents='none'>
      <Text
        style={[typography.shapeLabel, { color: pickOnFill(color) }, labelSize(fontSize)]}
        numberOfLines={2}
      >
        {label}
      </Text>
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
