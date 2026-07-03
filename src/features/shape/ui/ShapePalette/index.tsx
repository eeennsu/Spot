// 도형 팔레트 — Edit 모드 하단. 7종 미니 프리뷰 탭하여 추가.
// 안내 문구 + 가로 스크롤 잔여 표시(끝단 페이드 + 셰브런)로 뒤에 더 있는 도형을 알린다.
import { ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors, palette, radius, spacing, typography } from '@shared/theme';

import { SHAPE_CATALOG, type IShapeType } from '@entities/shape/consts';

import ShapeFill from '../ShapeFill';

interface Props {
  onAdd: (type: IShapeType) => void;
}

/** 도형 기본 비율을 44dp 프리뷰 박스에 맞춰 축소 — rect 는 rect, square 는 square 로 보인다. */
const PREVIEW_BOX = 44;
/** 끝단 페이드 폭(dp) — 스크롤 잔여 힌트 */
const FADE_W = 28;

function previewSize(w: number, h: number) {
  const scale = PREVIEW_BOX / Math.max(w, h);
  return { width: w * scale, height: h * scale };
}

/** 스크롤 방향에 더 볼 게 남았음을 알리는 끝단 페이드(캔버스색 → 투명). */
function EdgeFade({ side }: { side: 'left' | 'right' }) {
  const leftOpaque = side === 'left';
  const id = `paletteFade-${side}`;
  return (
    <Svg
      width={FADE_W}
      height='100%'
      pointerEvents='none'
      style={[styles.fade, side === 'left' ? styles.fadeLeft : styles.fadeRight]}
    >
      <Defs>
        <LinearGradient id={id} x1='0' y1='0' x2='1' y2='0'>
          <Stop offset='0' stopColor={colors.canvas} stopOpacity={leftOpaque ? 1 : 0} />
          <Stop offset='1' stopColor={colors.canvas} stopOpacity={leftOpaque ? 0 : 1} />
        </LinearGradient>
      </Defs>
      <Rect x='0' y='0' width={FADE_W} height='100%' fill={`url(#${id})`} />
    </Svg>
  );
}

export default function ShapePalette({ onAdd }: Props) {
  // 뷰포트/콘텐츠 폭 + 스크롤 위치 → 좌우 잔여 스크롤 여부 계산.
  const [viewW, setViewW] = useState(0);
  const [contentW, setContentW] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const canLeft = offsetX > 4;
  const canRight = contentW - viewW - offsetX > 4;

  return (
    <View style={styles.wrap}>
      <View style={styles.scrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          scrollEventThrottle={16}
          onLayout={(e: LayoutChangeEvent) => setViewW(e.nativeEvent.layout.width)}
          onContentSizeChange={(w: number) => setContentW(w)}
          onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
            setOffsetX(e.nativeEvent.contentOffset.x)
          }
        >
          {SHAPE_CATALOG.map(item => {
            const { width, height } = previewSize(item.defaultWidth, item.defaultHeight);
            return (
              <Pressable
                key={item.type}
                onPress={() => onAdd(item.type)}
                accessibilityRole='button'
                accessibilityLabel={`${item.labelKo} 추가`}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              >
                <View style={styles.preview}>
                  <View style={{ width, height }}>
                    <ShapeFill
                      type={item.type}
                      color={
                        item.category === 'space' ? palette.spaceFill : palette.defaultMaterialFill
                      }
                      label={item.category === 'space' ? item.labelKo : undefined}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {canLeft ? <EdgeFade side='left' /> : null}
        {canRight ? <EdgeFade side='right' /> : null}
        {canRight ? (
          <View style={styles.chevron} pointerEvents='none'>
            <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2.5} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, paddingTop: spacing.sm },

  scrollWrap: { position: 'relative' },
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  item: {
    width: 64,
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.standard,
  },
  itemPressed: { backgroundColor: colors.surface1 },
  preview: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fade: { position: 'absolute', top: 0, bottom: 0, width: FADE_W },
  fadeLeft: { left: 0 },
  fadeRight: { right: 0 },
  chevron: { position: 'absolute', right: spacing.xs, top: 0, bottom: 0, justifyContent: 'center' },
});
