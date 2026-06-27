// 도형 팔레트 — Edit 모드 하단. 7종 미니 프리뷰 탭하여 추가.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SHAPE_CATALOG, type IShapeType } from '@entities/shape/consts';
import { colors, palette, radius, spacing, typography } from '@shared/theme';

import ShapeFill from '../ShapeFill';

interface Props {
  onAdd: (type: IShapeType) => void;
}

export default function ShapePalette({ onAdd }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {SHAPE_CATALOG.map((item) => (
        <Pressable
          key={item.type}
          onPress={() => onAdd(item.type)}
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        >
          <View style={styles.preview}>
            <ShapeFill
              type={item.type}
              color={item.category === 'space' ? palette.spaceFill : palette.defaultMaterialFill}
            />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {item.labelKo}
          </Text>
        </Pressable>
      ))}
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
  label: { ...typography.metadata, color: colors.textSecondary },
});
