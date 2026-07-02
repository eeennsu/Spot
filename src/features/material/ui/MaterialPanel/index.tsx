// 자재 패널 — 한 랙(도형)의 층별 자재. editable=Edit(CRUD/순서), false=Viewer(읽기·펼침).
// 데이터는 useMaterialPanel 훅 경유. 이미지는 로컬 복사. 토큰만 사용.
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import LocalImage from '@shared/components/customs/LocalImage';
import { colors, radius, spacing, typography } from '@shared/theme';

import { DEFAULT_MATERIAL_NAME } from '@entities/material/consts';
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

      <BottomSheetScrollView
        style={styles.scroll}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps='handled'
        overScrollMode='never'
        showsVerticalScrollIndicator={false}
      >
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
                const picked = await pickImage(m.id);
                if (!picked) return;
                // 이름을 아직 안 건드렸으면(기본값) 파일명을 기본 이름으로.
                const keepName = m.name && m.name !== DEFAULT_MATERIAL_NAME;
                updateMaterial(m.id, {
                  imageUri: picked.uri,
                  ...(keepName || !picked.suggestedName ? {} : { name: picked.suggestedName }),
                });
              }}
              onDelete={() => removeMaterial(m.id)}
              onMove={dir => move(m.id, dir)}
            />
          ) : (
            <ReadCard key={m.id} material={m} layerNo={idx + 1} />
          ),
        )}
      </BottomSheetScrollView>

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
          <BottomSheetTextInput
            key={material.name}
            style={styles.nameInput}
            defaultValue={material.name}
            onEndEditing={e =>
              onChange({ name: e.nativeEvent.text.trim() || DEFAULT_MATERIAL_NAME })
            }
            placeholder='자재 이름 (필수)'
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.blue}
          />
          <TagEditor
            tags={material.tags ?? []}
            onChange={tags => onChange({ tags: tags.length ? tags : undefined })}
          />
          <BottomSheetTextInput
            style={styles.descInput}
            defaultValue={material.description ?? ''}
            onEndEditing={e => onChange({ description: e.nativeEvent.text.trim() || undefined })}
            placeholder='설명'
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
        {material.imageUri ? <LocalImage uri={material.imageUri} style={styles.readThumb} /> : null}
        <View style={styles.readMain}>
          <View style={styles.readNameLine}>
            <Text style={styles.layerBadge}>{layerNo}층</Text>
            <Text style={[typography.taskTitle, styles.readName]} numberOfLines={1}>
              {material.name}
            </Text>
          </View>
          {material.tags?.length ? (
            <View style={styles.readTags}>
              {material.tags.map(t => (
                <Text key={t} style={styles.tagChipText} numberOfLines={1}>
                  #{t}
                </Text>
              ))}
            </View>
          ) : null}
          {!open && material.description ? (
            <Text style={styles.descPreview} numberOfLines={1}>
              {material.description}
            </Text>
          ) : null}
        </View>
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

// ── 태그 편집기 — 칩 추가/삭제. 입력 후 Enter 또는 blur 시 추가, 칩 탭 시 삭제 ──
function TagEditor({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const t = draft.trim();
    setDraft('');
    if (!t || tags.includes(t)) return;
    onChange([...tags, t]);
  };

  return (
    <View style={styles.tagWrap}>
      {tags.map(t => (
        <Pressable
          key={t}
          onPress={() => onChange(tags.filter(x => x !== t))}
          style={styles.tagChip}
        >
          <Text style={styles.tagChipText}>{t}</Text>
          <Text style={styles.tagChipX}>×</Text>
        </Pressable>
      ))}
      <BottomSheetTextInput
        style={styles.tagInput}
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={add}
        onEndEditing={add}
        placeholder={tags.length ? '태그 추가' : '태그 (검색용)'}
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.blue}
        submitBehavior='submit'
        returnKeyType='done'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.xl, gap: spacing.md },
  scroll: { flex: 1 },
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
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.blueTint,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.soft,
  },
  tagChipText: { ...typography.metadata, color: colors.blue },
  tagChipX: { ...typography.metadata, color: colors.blue, fontSize: 15 },
  tagInput: {
    ...typography.body,
    color: colors.textPrimary,
    minWidth: 96,
    flexGrow: 1,
    paddingVertical: spacing.xs,
  },
  readTags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
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
  readThumb: { width: 44, height: 44, borderRadius: radius.soft },
  readMain: { flex: 1, gap: spacing.xs },
  readNameLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  readName: { flexShrink: 1 },
  descPreview: { ...typography.metadata, color: colors.textSecondary },
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
