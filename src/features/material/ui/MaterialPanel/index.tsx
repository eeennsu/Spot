// 자재 패널 — 한 랙(도형)의 층별 자재. editable=Edit(CRUD/순서), false=Viewer(읽기·펼침).
// 데이터는 useMaterialPanel 훅 경유. 이미지는 로컬 복사. 토큰만 사용.
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import LocalImage from '@shared/components/customs/LocalImage';
import { colors, radius, scrim, spacing, typography } from '@shared/theme';
import { utilHaptic, utilHapticNotify } from '@shared/utils/util_haptics';

import { DEFAULT_MATERIAL_NAME } from '@entities/material/consts';
import type { IMaterial } from '@entities/material/types';

import { useMaterialImagePick } from '@features/material/hooks/useMaterialImagePick';
import { useMaterialPanel } from '@features/material/hooks/useMaterialPanel';

interface Props {
  shapeId: string;
  title: string;
  editable: boolean;
  /** 시트 닫기(명시적 닫기 버튼용). 없으면 버튼 숨김. */
  onRequestClose?: () => void;
}

/** 스크롤 to-end 가능한 최소 인터페이스. */
type ScrollLike = { scrollToEnd: (opts?: { animated?: boolean }) => void };

export default function MaterialPanel({ shapeId, title, editable, onRequestClose }: Props) {
  const { materials, loaded, addMaterial, updateMaterial, removeMaterial, clearImage, move } =
    useMaterialPanel(shapeId);
  const pickImage = useMaterialImagePick();
  const scrollRef = useRef<ScrollLike | null>(null);
  // 전체화면으로 볼 이미지(Viewer 확대).
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  const sorted = [...materials].sort((a, b) => a.layerOrder - b.layerOrder);

  // 새 층 추가 → 목록 맨 아래로 스크롤(화면 밖 추가 방지).
  const onAddMaterial = async () => {
    await addMaterial();
    utilHaptic('light');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={[typography.heading, styles.headerTitle]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerRight}>
          <Text style={typography.metadata}>자재 {materials.length}개</Text>
          {onRequestClose ? (
            <Pressable
              onPress={onRequestClose}
              hitSlop={10}
              accessibilityRole='button'
              accessibilityLabel='닫기'
              style={({ pressed }) => [styles.closeBtn, pressed && styles.dim]}
            >
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <BottomSheetScrollView
        ref={scrollRef as never}
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
                utilHaptic('light');
              }}
              onClearImage={() => clearImage(m.id)}
              onDelete={() =>
                Alert.alert('자재 삭제', `"${m.name}" 층을 삭제할까요?`, [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                      await removeMaterial(m.id);
                      utilHapticNotify('success');
                    },
                  },
                ])
              }
              onMove={dir => {
                move(m.id, dir);
                utilHaptic('light');
              }}
            />
          ) : (
            <ReadCard key={m.id} material={m} layerNo={idx + 1} onOpenImage={setViewerUri} />
          ),
        )}
      </BottomSheetScrollView>

      {editable ? (
        <Pressable
          onPress={onAddMaterial}
          style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
        >
          <Text style={[typography.button, { color: colors.canvas }]}>+ 자재 층 추가</Text>
        </Pressable>
      ) : null}

      {/* 사진 전체화면 뷰어 */}
      <Modal
        visible={!!viewerUri}
        transparent
        animationType='fade'
        onRequestClose={() => setViewerUri(null)}
      >
        <Pressable style={styles.viewerBackdrop} onPress={() => setViewerUri(null)}>
          {viewerUri ? (
            <Image source={{ uri: viewerUri }} style={styles.viewerImage} resizeMode='contain' />
          ) : null}
        </Pressable>
      </Modal>
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
  onClearImage: () => void;
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
  onClearImage,
  onDelete,
  onMove,
}: EditCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.thumbWrap}>
          <Pressable onPress={onPickImage}>
            <LocalImage uri={material.imageUri} style={styles.thumb} emptyLabel='사진 추가' />
          </Pressable>
          {material.imageUri ? (
            <Pressable
              onPress={onClearImage}
              hitSlop={8}
              accessibilityRole='button'
              accessibilityLabel='사진 삭제'
              style={({ pressed }) => [styles.thumbClear, pressed && styles.dim]}
            >
              <X size={12} color={colors.canvas} strokeWidth={3} />
            </Pressable>
          ) : null}
        </View>

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
            returnKeyType='done'
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
          style={({ pressed }) => [
            styles.miniBtn,
            isFirst && styles.miniBtnOff,
            pressed && !isFirst && styles.dim,
          ]}
        >
          <Text style={styles.miniIcon}>▲</Text>
        </Pressable>
        <Pressable
          disabled={isLast}
          onPress={() => onMove('down')}
          style={({ pressed }) => [
            styles.miniBtn,
            isLast && styles.miniBtnOff,
            pressed && !isLast && styles.dim,
          ]}
        >
          <Text style={styles.miniIcon}>▼</Text>
        </Pressable>
        <View style={styles.spacer} />
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [styles.miniBtn, styles.deleteMini, pressed && styles.dim]}
        >
          <Text style={[styles.miniIcon, { color: colors.deadline }]}>삭제</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Viewer: 읽기 카드(탭하여 설명·사진 펼침) ──
function ReadCard({
  material,
  layerNo,
  onOpenImage,
}: {
  material: IMaterial;
  layerNo: number;
  onOpenImage: (uri: string) => void;
}) {
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
        <Animated.View
          style={styles.readDetail}
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(120)}
        >
          {material.imageUri ? (
            <Pressable onPress={() => onOpenImage(material.imageUri as string)}>
              <LocalImage uri={material.imageUri} style={styles.readImage} />
              <Text style={styles.imageHint}>탭하여 크게 보기</Text>
            </Pressable>
          ) : null}
          {material.description ? (
            <Text style={typography.body}>{material.description}</Text>
          ) : null}
        </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerTitle: { flexShrink: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.circle,
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
  thumbClear: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    width: 22,
    height: 22,
    borderRadius: radius.circle,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.soft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  miniBtnOff: { opacity: 0.35 },
  deleteMini: { backgroundColor: colors.canvas },
  miniIcon: { ...typography.metadata, color: colors.textPrimary },
  dim: { opacity: 0.55 },
  readRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  readThumb: { width: 44, height: 44, borderRadius: radius.soft },
  readMain: { flex: 1, gap: spacing.xs },
  readNameLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  readName: { flexShrink: 1 },
  descPreview: { ...typography.metadata, color: colors.textSecondary },
  chev: { ...typography.body, color: colors.textSecondary },
  readDetail: { gap: spacing.sm, paddingTop: spacing.xs },
  readImage: { width: '100%', height: 180 },
  imageHint: {
    ...typography.metadata,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingTop: spacing.xs,
  },
  addBtn: {
    minHeight: 48,
    borderRadius: radius.standard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    marginHorizontal: spacing.xl,
  },
  addBtnPressed: { backgroundColor: colors.bluePressed },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  viewerImage: { width: '100%', height: '80%' },
});
