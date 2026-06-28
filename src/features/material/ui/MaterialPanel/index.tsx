// 자재 패널 — 한 랙(도형)의 층별 자재. editable=Edit(CRUD/순서), false=Viewer(읽기·펼침).
// 데이터는 useMaterialPanel 훅 경유. 이미지는 로컬 복사. 토큰만 사용.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import LocalImage from '@shared/components/customs/LocalImage';
import { colors, radius, spacing, typography } from '@shared/theme';

import type { IMaterial } from '@entities/material/types';

import { useMaterialImagePick } from '@features/material/hooks/useMaterialImagePick';
import { useMaterialPanel } from '@features/material/hooks/useMaterialPanel';

interface Props {
  shapeId: string;
  title: string;
  editable: boolean;
}

export default function MaterialPanel({ shapeId, title, editable }: Props) {
  const { materials, loaded, addMaterial, updateMaterial, removeMaterial, move } =
    useMaterialPanel(shapeId);
  const pickImage = useMaterialImagePick();

  const sorted = [...materials].sort((a, b) => a.layerOrder - b.layerOrder);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={typography.heading} numberOfLines={1}>
          {title}
        </Text>
        <Text style={typography.metadata}>자재 {materials.length}개</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps='handled'>
        {loaded && materials.length === 0 ? (
          <Text style={[typography.body, styles.empty]}>
            {editable ? '자재가 없습니다. 아래에서 추가하세요.' : '등록된 자재가 없습니다.'}
          </Text>
        ) : null}

        {sorted.map((m, idx) =>
          editable ? (
            <EditCard
              key={m.id}
              material={m}
              layerNo={idx + 1}
              isFirst={idx === 0}
              isLast={idx === sorted.length - 1}
              onChange={patch => updateMaterial(m.id, patch)}
              onPickImage={async () => {
                const uri = await pickImage(m.id);
                if (uri) updateMaterial(m.id, { imageUri: uri });
              }}
              onDelete={() => removeMaterial(m.id)}
              onMove={dir => move(m.id, dir)}
            />
          ) : (
            <ReadCard key={m.id} material={m} layerNo={idx + 1} />
          ),
        )}
      </ScrollView>

      {editable ? (
        <Pressable
          onPress={addMaterial}
          style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
        >
          <Text style={[typography.button, { color: colors.canvas }]}>+ 자재 층 추가</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ── Edit: 인라인 편집 카드 ──
interface EditCardProps {
  material: IMaterial;
  layerNo: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<IMaterial>) => void;
  onPickImage: () => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
}

function EditCard({
  material,
  layerNo,
  isFirst,
  isLast,
  onChange,
  onPickImage,
  onDelete,
  onMove,
}: EditCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Pressable onPress={onPickImage} style={styles.thumbWrap}>
          <LocalImage uri={material.imageUri} style={styles.thumb} emptyLabel='사진 추가' />
        </Pressable>

        <View style={styles.cardFields}>
          <View style={styles.layerRow}>
            <Text style={styles.layerBadge}>{layerNo}층</Text>
          </View>
          <TextInput
            style={styles.nameInput}
            defaultValue={material.name}
            onEndEditing={e => onChange({ name: e.nativeEvent.text.trim() || '새 자재' })}
            placeholder='자재 이름 (필수)'
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.blue}
          />
          <TextInput
            style={styles.descInput}
            defaultValue={material.description ?? ''}
            onEndEditing={e => onChange({ description: e.nativeEvent.text.trim() || undefined })}
            placeholder='설명 (선택)'
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.blue}
            multiline
          />
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          disabled={isFirst}
          onPress={() => onMove('up')}
          style={[styles.miniBtn, isFirst && styles.miniBtnOff]}
        >
          <Text style={styles.miniIcon}>▲</Text>
        </Pressable>
        <Pressable
          disabled={isLast}
          onPress={() => onMove('down')}
          style={[styles.miniBtn, isLast && styles.miniBtnOff]}
        >
          <Text style={styles.miniIcon}>▼</Text>
        </Pressable>
        <View style={styles.spacer} />
        <Pressable onPress={onDelete} style={[styles.miniBtn, styles.deleteMini]}>
          <Text style={[styles.miniIcon, { color: colors.deadline }]}>삭제</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Viewer: 읽기 카드(탭하여 설명·사진 펼침) ──
function ReadCard({ material, layerNo }: { material: IMaterial; layerNo: number }) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!material.description || !!material.imageUri;
  return (
    <Pressable
      onPress={() => hasDetail && setOpen(o => !o)}
      style={({ pressed }) => [styles.card, pressed && hasDetail && styles.cardPressed]}
    >
      <View style={styles.readRow}>
        <Text style={styles.layerBadge}>{layerNo}층</Text>
        <Text style={[typography.taskTitle, styles.readName]} numberOfLines={1}>
          {material.name}
        </Text>
        {hasDetail ? <Text style={styles.chev}>{open ? '▾' : '▸'}</Text> : null}
      </View>
      {open ? (
        <View style={styles.readDetail}>
          {material.imageUri ? (
            <LocalImage uri={material.imageUri} style={styles.readImage} />
          ) : null}
          {material.description ? (
            <Text style={typography.body}>{material.description}</Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: spacing.xl, gap: spacing.md, flexShrink: 1 },
  spacer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  list: { gap: spacing.md, paddingBottom: spacing.sm },
  empty: { color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.xl2 },
  card: {
    backgroundColor: colors.surface1,
    borderRadius: radius.comfortable,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardPressed: { backgroundColor: colors.surface2 },
  cardTop: { flexDirection: 'row', gap: spacing.md },
  thumbWrap: { width: 72, height: 72 },
  thumb: { width: 72, height: 72 },
  cardFields: { flex: 1, gap: spacing.xs },
  layerRow: { flexDirection: 'row' },
  layerBadge: {
    ...typography.metadata,
    color: colors.blue,
    fontFamily: typography.datePill.fontFamily,
  },
  nameInput: {
    ...typography.taskTitle,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  descInput: {
    ...typography.body,
    color: colors.textSecondary,
    paddingVertical: spacing.xs,
    minHeight: 32,
  },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  miniBtn: {
    minWidth: 44,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.soft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  miniBtnOff: { opacity: 0.35 },
  deleteMini: { backgroundColor: colors.canvas },
  miniIcon: { ...typography.metadata, color: colors.textPrimary },
  readRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  readName: { flex: 1 },
  chev: { ...typography.body, color: colors.textSecondary },
  readDetail: { gap: spacing.sm, paddingTop: spacing.xs },
  readImage: { width: '100%', height: 180 },
  addBtn: {
    minHeight: 48,
    borderRadius: radius.standard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    marginHorizontal: spacing.xl,
  },
  addBtnPressed: { backgroundColor: colors.bluePressed },
});
