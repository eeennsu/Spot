// 도형 시각 채움 — type 별 모양. 컨테이너(부모) 크기를 100% 채운다.
// L(ㄴ자)는 SVG viewBox(0~100)로 그려 리사이즈 시 함께 스케일된다.
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { pickOnFill } from '@shared/theme';
import { radius, typography } from '@shared/theme';

import type { IShapeType } from '@entities/shape/consts';

interface Props {
  type: IShapeType;
  color: string;
  /** 공간 도형 라벨(가운데 표시) */
  label?: string;
}

// ㄴ자 폴리곤(100×100 공간). 좌측 세로바 + 하단 가로바, 두께 45.
const L_POINTS = '0,0 45,0 45,55 100,55 100,100 0,100';

export default function ShapeFill({ type, color, label }: Props) {
  if (type === 'L') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <Svg width='100%' height='100%' viewBox='0 0 100 100' preserveAspectRatio='none'>
          <Polygon points={L_POINTS} fill={color} />
        </Svg>
        {label ? <Centered label={label} color={color} /> : null}
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
        <Text style={[typography.metadata, { color: pickOnFill(color) }]} numberOfLines={2}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

function Centered({ label, color }: { label: string; color: string }) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents='none'>
      <Text style={[typography.metadata, { color: pickOnFill(color) }]} numberOfLines={2}>
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
    padding: 4,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
});
