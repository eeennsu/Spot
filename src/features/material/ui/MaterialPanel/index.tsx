// 자재 패널 — 한 랙(도형)의 층별 자재. editable=Edit(CRUD/순서), false=Viewer(읽기·펼침).
// 데이터는 useMaterialPanel 훅 경유. 이미지는 로컬 복사. 토큰만 사용.
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ChevronDown, ChevronRight, ChevronUp, Trash2, X } from 'lucide-react-native';
import { type ComponentProps, type ComponentType, useRef, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import LocalImage from '@shared/components/customs/LocalImage';
import { colors, layout, radius, scrim, spacing, typography } from '@shared/theme';
import { utilHaptic, utilHapticNotify } from '@shared/utils/util_haptics';

import type { IMaterial } from '@entities/material/types';

import { useMaterialImagePick } from '@features/material/hooks/useMaterialImagePick';
import { useMaterialPanel } from '@features/material/hooks/useMaterialPanel';

interface Props {
  shapeId: string;
  title: string;
  editable: boolean;
  /** 시트 닫기(명시적 닫기 버튼용). 없으면 버튼 숨김. */
  onRequestClose?: () => void;
  /**
   * 렌더 컨테이너. 'sheet'(기본)=바텀시트 내부(Viewer 읽기용, gorhom 스크롤/입력),
   * 'screen'=풀스크린 라우트(Edit 편집용, 일반 KeyboardAware 스크롤/입력).
   * gorhom 스크롤러블은 시트 밖에서 동작 안 하므로 컨테이너별로 프리미티브를 교체한다.
   */
  variant?: 'sheet' | 'screen';
}

/** name/desc/tag 입력에 쓰는 TextInput 계열 컴포넌트 타입. */
type InputComponentType = ComponentType<ComponentProps<typeof TextInput>>;

/** 스크롤 to-end 가능한 최소 인터페이스. */
type ScrollLike = { scrollToEnd: (opts?: { animated?: boolean }) => void };

export default function MaterialPanel({
  shapeId,
  title,
  editable,
  onRequestClose,
  variant = 'sheet',
}: Props) {
  const { materials, loaded, addMaterial, updateMaterial, removeMaterial, clearImage, move } =
    useMaterialPanel(shapeId);
  const pickImage = useMaterialImagePick();
  const scrollRef = useRef<ScrollLike | null>(null);

  // 컨테이너별 스크롤/입력 프리미티브. 'screen'은 시트 밖이라 gorhom 대신 일반 컴포넌트 사용.
  const Scroll: ComponentType<any> =
    variant === 'screen' ? KeyboardAwareScrollView : BottomSheetScrollView;
  const InputComponent: InputComponentType =
    variant === 'screen' ? TextInput : (BottomSheetTextInput as never);
  // 전체화면으로 볼 이미지(Viewer 확대).
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  // 방금 추가한 층 id — 이름 입력에 자동 포커스 + 전체선택(첫 입력으로 바로 덮어쓰기).
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  const sorted = [...materials].sort((a, b) => a.layerOrder - b.layerOrder);

  // 입력창의 라이브 텍스트를 리렌더 없이 모아두는 버퍼(자재 id → 미저장 name/description).
  // 이유: 이름 타이핑 직후 '완료'를 누르면 화면이 언마운트되며 blur(onEndEditing)가 안 걸려
  // 입력이 유실된다. 키 입력마다 여기에 쌓아두고, 닫기 전 DB로 flush 해 유실을 막는다.
  const pendingEdits = useRef<Map<string, { name?: string; description?: string }>>(new Map());

  // 키 입력마다 라이브 값을 버퍼에 적재(setState 없음 = 목록 리렌더 없음).
  const stagePending = (id: string, patch: { name?: string; description?: string }) => {
    pendingEdits.current.set(id, { ...pendingEdits.current.get(id), ...patch });
  };

  // 모아둔 미저장 입력을 모두 DB에 반영. onEndEditing과 동일하게 trim/빈값 정규화.
  const flushPending = async () => {
    const entries = [...pendingEdits.current.entries()];
    pendingEdits.current.clear();
    for (const [id, patch] of entries) {
      const next: Partial<IMaterial> = {};
      if (patch.name !== undefined) next.name = patch.name.trim();
      if (patch.description !== undefined) next.description = patch.description.trim() || undefined;
      await updateMaterial(id, next);
    }
  };

  // '완료'로 닫기 — 미저장 입력을 flush 한 뒤, 이름 없는 빈 층을 정리하고 닫는다.
  const handleClose = async () => {
    const staged = new Map(pendingEdits.current); // flush 가 버퍼를 비우므로 먼저 캡처
    await flushPending();
    // "추가"만 하고 안 채운 유령 자재(빈 이름)가 자재 개수·학습 퀴즈를 오염시키는 것 방지(name 필수).
    // 최종 이름 = 버퍼에 타이핑한 값 우선, 없으면 현재 값.
    for (const m of materials) {
      const finalName = (staged.get(m.id)?.name ?? m.name).trim();
      if (!finalName) await removeMaterial(m.id);
    }
    onRequestClose?.();
  };

  // 새 층 추가 → 목록 맨 아래로 스크롤(화면 밖 추가 방지) + 이름 입력 자동 포커스.
  const onAddMaterial = async () => {
    const created = await addMaterial();
    setNewlyAddedId(created.id);
    utilHaptic('light');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[typography.heading, styles.headerTitle]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[typography.metadata, styles.headerCount]}>자재 {materials.length}개</Text>
        </View>
        {onRequestClose ? (
          <Pressable
            onPress={handleClose}
            hitSlop={10}
            accessibilityRole='button'
            accessibilityLabel='완료'
            style={({ pressed }) => [styles.doneBtn, pressed && styles.dim]}
          >
            <Text style={[typography.button, { color: colors.blue }]}>완료</Text>
          </Pressable>
        ) : null}
      </View>

      <Scroll
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
              InputComponent={InputComponent}
              autoFocusName={m.id === newlyAddedId}
              onNameFocus={() => setNewlyAddedId(null)}
              onStage={patch => stagePending(m.id, patch)}
              onChange={patch => updateMaterial(m.id, patch)}
              onPickImage={async () => {
                // 유니크 파일명(id_타임스탬프)으로 복사 → 교체 시 URI 가 매번 달라져
                // RN 이미지 URI 캐시가 옛 사진을 계속 보여주는 문제 방지. 옛 파일은 updateMaterial 이 삭제.
                const picked = await pickImage(`${m.id}_${Date.now()}`);
                if (!picked) return;
                // 이름을 아직 안 넣었으면(빈 값) 파일명을 기본 이름으로.
                const keepName = !!m.name;
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
      </Scroll>

      {editable ? (
        <Pressable
          onPress={onAddMaterial}
          style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
        >
          <Text style={[typography.button, { color: colors.canvas }]}>
            + {materials.length + 1}층에 자재 추가하기
          </Text>
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
  /** 컨테이너별 TextInput 컴포넌트(시트=BottomSheetTextInput / 스크린=TextInput). */
  InputComponent: InputComponentType;
  /** 방금 추가된 층이면 이름 입력에 자동 포커스 + 전체선택. */
  autoFocusName?: boolean;
  /** 이름 입력이 실제 포커스를 받으면 호출(자동 포커스 재발동 방지). */
  onNameFocus?: () => void;
  /** 키 입력마다 라이브 값을 버퍼에 적재('완료' 즉시 닫힘 시 유실 방지, 리렌더 없음). */
  onStage: (patch: { name?: string; description?: string }) => void;
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
  InputComponent,
  autoFocusName,
  onNameFocus,
  onStage,
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
          <Pressable onPress={onPickImage} style={({ pressed }) => pressed && styles.dim}>
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
          <InputComponent
            key={material.name}
            style={styles.nameInput}
            defaultValue={material.name}
            autoFocus={autoFocusName}
            selectTextOnFocus={autoFocusName}
            onFocus={onNameFocus}
            onChangeText={text => onStage({ name: text })}
            onEndEditing={e => onChange({ name: e.nativeEvent.text.trim() })}
            placeholder='자재 이름 (필수)'
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.blue}
            returnKeyType='done'
          />
          <TagEditor
            InputComponent={InputComponent}
            tags={material.tags ?? []}
            onChange={tags => onChange({ tags: tags.length ? tags : undefined })}
          />
          <InputComponent
            style={styles.descInput}
            defaultValue={material.description ?? ''}
            onChangeText={text => onStage({ description: text })}
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
          <ChevronUp size={18} color={colors.textPrimary} strokeWidth={2} />
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
          <ChevronDown size={18} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <View style={styles.spacer} />
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [styles.miniBtn, styles.deleteMini, pressed && styles.dim]}
        >
          <Trash2 size={18} color={colors.deadline} strokeWidth={2} />
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
        </View>
        {hasDetail ? (
          open ? (
            <ChevronDown size={18} color={colors.textSecondary} strokeWidth={2} />
          ) : (
            <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2} />
          )
        ) : null}
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
function TagEditor({
  InputComponent,
  tags,
  onChange,
}: {
  InputComponent: InputComponentType;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
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
          style={({ pressed }) => [styles.tagChip, pressed && styles.dim]}
        >
          <Text style={styles.tagChipText}>{t}</Text>
          <X size={14} color={colors.blue} strokeWidth={2} />
        </Pressable>
      ))}
      <InputComponent
        style={styles.tagInput}
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={add}
        onEndEditing={add}
        placeholder={tags.length ? '입력 후 Enter로 추가' : '태그 입력 후 Enter (검색용)'}
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
  headerLeft: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, flexShrink: 1 },
  headerTitle: { flexShrink: 1 },
  headerCount: { color: colors.textSecondary, flexShrink: 0 },
  doneBtn: {
    minHeight: spacing.xl4,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
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
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.blueTint,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.soft,
  },
  tagChipText: { ...typography.metadata, color: colors.blue },
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
    minWidth: spacing.xl4,
    minHeight: spacing.xl4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.soft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  miniBtnOff: { opacity: 0.35 },
  deleteMini: { backgroundColor: colors.canvas },
  dim: { opacity: 0.55 },
  readRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  readThumb: { width: spacing.xl4, height: spacing.xl4, borderRadius: radius.soft },
  readMain: { flex: 1, gap: spacing.xs },
  readNameLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  readName: { flexShrink: 1 },
  readDetail: { gap: spacing.sm, paddingTop: spacing.xs },
  readImage: { width: '100%', height: 180 },
  imageHint: {
    ...typography.metadata,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingTop: spacing.xs,
  },
  addBtn: {
    minHeight: layout.buttonHeight,
    borderRadius: radius.standard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
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
