// 선택 도형 인스펙터 — Edit 하단 패널. 색/별칭/라벨(기타)/자재 층 관리/삭제.
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, palette, radius, spacing, typography } from '@shared/theme';

import type { IShape } from '@entities/shape/types';

interface Props {
  shape: IShape;
  onUpdate: (patch: Partial<IShape>) => void;
  onDelete: () => void;
  onClose: () => void;
  /** 자재 도형에서 자재 패널 열기 */
  onManageMaterials?: () => void;
}

export default function ShapeInspector({
  shape,
  onUpdate,
  onDelete,
  onClose,
  onManageMaterials,
}: Props) {
  const isSpace = shape.category === 'space';
  const labelEditable = shape.type === 'etc';

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <Text style={typography.heading}>{isSpace ? '공간 도형' : '자재 도형'}</Text>
        <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
          <Text style={[typography.button, { color: colors.blue }]}>완료</Text>
        </Pressable>
      </View>

      {/* 색 */}
      {!isSpace && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>색</Text>
          <View style={styles.swatchRow}>
            {palette.shapeFills.map(c => (
              <Pressable
                key={c}
                onPress={() => onUpdate({ color: c })}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  shape.color === c && styles.swatchActive,
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* 별칭 (검색 대상) */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>별칭</Text>
        <TextInput
          style={styles.input}
          defaultValue={shape.alias ?? ''}
          onEndEditing={e => onUpdate({ alias: e.nativeEvent.text.trim() || undefined })}
          placeholder='예: A, B 구역'
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.blue}
          returnKeyType='done'
        />
      </View>

      {/* 라벨 (기타 공간만 편집) */}
      {labelEditable && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>라벨</Text>
          <TextInput
            style={styles.input}
            defaultValue={shape.label ?? ''}
            onEndEditing={e => onUpdate({ label: e.nativeEvent.text.trim() || '기타' })}
            placeholder='기타'
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.blue}
            returnKeyType='done'
          />
        </View>
      )}

      {/* 자재 층 관리 + 삭제 */}
      <View style={styles.actionRow}>
        {!isSpace && onManageMaterials ? (
          <Pressable onPress={onManageMaterials} style={[styles.actionBtn, styles.manageBtn]}>
            <Text style={[typography.button, { color: colors.blue }]}>자재 층 관리</Text>
            <ChevronRight size={18} color={colors.blue} strokeWidth={2} />
          </Pressable>
        ) : null}
        <Pressable onPress={onDelete} style={[styles.actionBtn, styles.deleteBtn]}>
          <Text style={[typography.button, { color: colors.canvas }]}>삭제</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.canvas,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.xs },
  section: { gap: spacing.sm },
  sectionLabel: { ...typography.metadata, color: colors.textSecondary },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: radius.circle,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  swatchActive: { borderColor: colors.textPrimary },
  input: {
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.standard,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface1,
    ...typography.body,
  },
  manageBtn: {
    flex: 3,
    minHeight: 48,
    borderRadius: radius.standard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.blueTint,
  },
  actionRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.sm },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.standard,
    backgroundColor: colors.surface1,
  },
  deleteBtn: { backgroundColor: colors.deadline },
});
