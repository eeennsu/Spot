// 도형 팔레트 — Edit 모드 하단. 7종 미니 프리뷰 탭하여 추가.
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { colors, palette, radius, spacing } from '@shared/theme';

import { SHAPE_CATALOG, type IShapeType } from '@entities/shape/consts';

import ShapeFill from '../ShapeFill';

interface Props {
  onAdd: (type: IShapeType) => void;
}

/** 도형 기본 비율을 44dp 프리뷰 박스에 맞춰 축소 — rect 는 rect, square 는 square 로 보인다. */
const PREVIEW_BOX = 44;
function previewSize(w: number, h: number) {
  const scale = PREVIEW_BOX / Math.max(w, h);
  return { width: w * scale, height: h * scale };
}

export default function ShapePalette({ onAdd }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
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
  );
}

const styles = StyleSheet.create({
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
});
