// 선택 도형 인스펙터 — Edit 하단 패널. 색/이름(검색용 alias)/라벨(기타)/자재 층 관리/삭제.
import { ChevronRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, layout, palette, radius, spacing, typography } from '@shared/theme';
import { utilHaptic } from '@shared/utils/util_haptics';

import { shapeCatalogOf } from '@entities/shape/consts';
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
  // 자재: 콘텐츠 색 후보. 공간: 중립(기본)도 고를 수 있게 앞에 추가.
  const colorOptions = isSpace ? [palette.spaceFill, ...palette.shapeFills] : palette.shapeFills;

  // 이름 — 공간 도형은 label(중앙 표시·기본 문/사무실/기타), 자재 도형은 alias(검색용)로 통일(#8).
  const spaceDefault = isSpace ? (shapeCatalogOf(shape.type).defaultLabel ?? '공간') : '';
  // onEndEditing(blur) 만 쓰면 '완료'로 닫을 때 인스펙터가 blur 커밋보다 먼저 언마운트돼
  // 입력이 저장 안 되는 문제가 있어, 매 입력마다 즉시 반영한다.
  const [nameText, setNameText] = useState((isSpace ? shape.label : shape.alias) ?? '');
  // 다른 도형을 선택할 때만(shape.id 변경) 입력값을 그 도형 값으로 재동기화.
  useEffect(() => {
    setNameText((isSpace ? shape.label : shape.alias) ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape.id]);

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <Text style={typography.heading}>{isSpace ? '공간 도형' : '자재 도형'}</Text>
        <Pressable
          onPress={onClose}
          hitSlop={10}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressedDim]}
        >
          <Text style={[typography.button, { color: colors.blue }]}>완료</Text>
        </Pressable>
      </View>

      {/* 색 — 자재·공간 모두 지정 가능 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>색</Text>
        <View style={styles.swatchRow}>
          {colorOptions.map(c => (
            <Pressable
              key={c}
              onPress={() => {
                onUpdate({ color: c });
                utilHaptic('light');
              }}
              hitSlop={8}
              style={({ pressed }) => [
                styles.swatch,
                { backgroundColor: c },
                shape.color === c && styles.swatchActive,
                pressed && styles.swatchPressed,
              ]}
            />
          ))}
        </View>
      </View>

      {/* 이름 — 공간=중앙 표시 이름, 자재=검색용 이름(통일) */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>이름</Text>
        <TextInput
          style={styles.input}
          value={nameText}
          onChangeText={t => {
            setNameText(t);
            if (isSpace) onUpdate({ label: t.trim() || spaceDefault });
            else onUpdate({ alias: t.trim() || undefined });
          }}
          placeholder={isSpace ? '예: 정문, 창고 사무실' : '예: A랙, 입구 선반 (검색용)'}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.blue}
          returnKeyType='done'
        />
      </View>

      {/* 자재 층 관리 + 삭제 */}
      <View style={styles.actionRow}>
        {!isSpace && onManageMaterials ? (
          <Pressable
            onPress={onManageMaterials}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.manageBtn,
              pressed && styles.pressedDim,
            ]}
          >
            <Text style={[typography.button, { color: colors.blue }]}>자재 층 관리</Text>
            <ChevronRight size={18} color={colors.blue} strokeWidth={2} />
          </Pressable>
        ) : null}
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.deleteBtn,
            pressed && styles.pressedDim,
          ]}
        >
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
  closeBtn: { minHeight: spacing.xl4, justifyContent: 'center', paddingHorizontal: spacing.xs },
  section: { gap: spacing.sm },
  sectionLabel: { ...typography.metadata, color: colors.textSecondary },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  swatchActive: { borderColor: colors.textPrimary },
  swatchPressed: { transform: [{ scale: 0.9 }] },
  pressedDim: { opacity: 0.6 },
  input: {
    height: spacing.xl4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.standard,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface1,
    ...typography.body,
  },
  manageBtn: {
    flex: 3,
    minHeight: layout.buttonHeight,
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
    minHeight: layout.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.standard,
    backgroundColor: colors.surface1,
  },
  deleteBtn: { backgroundColor: colors.deadline },
});
