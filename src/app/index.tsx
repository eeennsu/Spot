// 프로젝트 목록 + 전역 검색. 행 탭 → 상세. 검색 결과 탭 → 해당 프로젝트 도형으로 이동.
import { useRouter } from 'expo-router';
import { Pencil, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SearchBar from '@shared/components/customs/SearchBar';
import { colors, radius, scrim, spacing, typography } from '@shared/theme';
import { utilHaptic, utilHapticNotify } from '@shared/utils/util_haptics';

import type { IProject } from '@entities/project/types';

import { useProjectCreate } from '@features/project/hooks/useProjectCreate';
import { useProjectDelete } from '@features/project/hooks/useProjectDelete';
import { useProjectList } from '@features/project/hooks/useProjectList';
import { useProjectRename } from '@features/project/hooks/useProjectRename';
import { useSearch } from '@features/search/hooks/useSearch';
import SearchResultList from '@features/search/ui/SearchResultList';

export default function ProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { projects, load } = useProjectList();
  const addProject = useProjectCreate();
  const renameProject = useProjectRename();
  const removeProject = useProjectDelete();
  const [name, setName] = useState('');

  const [query, setQuery] = useState('');
  const { results } = useSearch(query); // 전역(projectId 없음)
  const searching = query.trim().length > 0;

  // 이름 수정 대상 프로젝트 + 편집 중 이름.
  const [editing, setEditing] = useState<IProject | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    load();
  }, [load]);

  const onAdd = async () => {
    const trimmed = name.trim() || `평면도 ${projects.length + 1}`;
    await addProject(trimmed);
    setName('');
    utilHaptic('medium');
  };

  const openEdit = (project: IProject) => {
    setEditing(project);
    setEditName(project.name);
    utilHaptic('light');
  };

  const onRename = async () => {
    if (!editing) return;
    const trimmed = editName.trim();
    if (trimmed && trimmed !== editing.name) await renameProject(editing.id, trimmed);
    setEditing(null);
    utilHaptic('light');
  };

  // 삭제는 즉시 실행(피드백 #3 — alert 없음).
  const onDelete = async (project: IProject) => {
    await removeProject(project.id);
    utilHapticNotify('success');
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior='height'>
      <View style={styles.searchWrap}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder='모든 평면도에서 자재·별칭 검색'
        />
      </View>

      {searching ? (
        <SearchResultList
          results={results}
          hasQuery
          showProject
          onSelect={r => router.push(`/project/${r.projectId}?focus=${r.shapeId}`)}
        />
      ) : (
        <>
          <FlatList
            data={projects}
            keyExtractor={p => p.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={[typography.metadata, styles.empty]}>
                평면도가 없습니다. 아래에서 새로 만드세요.
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Pressable
                  onPress={() => router.push(`/project/${item.id}`)}
                  style={({ pressed }) => [styles.rowMain, pressed && styles.rowPressed]}
                >
                  <Text style={typography.taskTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={typography.metadata}>탭하여 열기</Text>
                </Pressable>
                <View style={styles.rowActions}>
                  <Pressable
                    onPress={() => openEdit(item)}
                    hitSlop={8}
                    accessibilityRole='button'
                    accessibilityLabel='이름 수정'
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.dim]}
                  >
                    <Pencil size={18} color={colors.textSecondary} strokeWidth={2} />
                  </Pressable>
                  <Pressable
                    onPress={() => onDelete(item)}
                    hitSlop={8}
                    accessibilityRole='button'
                    accessibilityLabel='삭제'
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.dim]}
                  >
                    <Trash2 size={18} color={colors.deadline} strokeWidth={2} />
                  </Pressable>
                </View>
              </View>
            )}
          />

          <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.lg }]}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder='새 평면도 이름'
              placeholderTextColor={colors.textTertiary}
              selectionColor={colors.blue}
              returnKeyType='done'
              onSubmitEditing={onAdd}
            />
            <Pressable
              onPress={onAdd}
              style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
            >
              <Text style={[typography.button, { color: colors.canvas }]}>추가</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* 프로젝트 이름 수정 */}
      <Modal
        visible={!!editing}
        transparent
        animationType='fade'
        onRequestClose={() => setEditing(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setEditing(null)}>
          <KeyboardAvoidingView behavior='padding' style={styles.sheetWrap}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={typography.heading}>평면도 이름 수정</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder='평면도 이름'
                placeholderTextColor={colors.textTertiary}
                selectionColor={colors.blue}
                autoFocus
                returnKeyType='done'
                onSubmitEditing={onRename}
              />
              <View style={styles.sheetActions}>
                <Pressable
                  onPress={() => setEditing(null)}
                  style={({ pressed }) => [
                    styles.sheetBtn,
                    styles.cancelBtn,
                    pressed && styles.dim,
                  ]}
                >
                  <Text style={[typography.button, { color: colors.textSecondary }]}>취소</Text>
                </Pressable>
                <Pressable
                  onPress={onRename}
                  style={({ pressed }) => [styles.sheetBtn, styles.saveBtn, pressed && styles.dim]}
                >
                  <Text style={[typography.button, { color: colors.canvas }]}>저장</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  searchWrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  listContent: { paddingVertical: spacing.md },
  empty: { textAlign: 'center', marginTop: spacing.xl5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowMain: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  rowPressed: { backgroundColor: colors.surface2 },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.lg,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.soft,
  },
  composer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.canvas,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.standard,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface1,
    ...typography.body,
    color: colors.textPrimary,
  },
  editInput: {
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.standard,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface1,
    ...typography.body,
    // 배경과 대비되는 진한 잉크색 명시(피드백 #2 — 글자 안 보임 방지).
    color: colors.textPrimary,
  },
  addBtn: {
    height: 44,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.standard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
  },
  addBtnPressed: { backgroundColor: colors.bluePressed },
  backdrop: {
    flex: 1,
    backgroundColor: scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheetWrap: { width: '100%' },
  sheet: {
    width: '100%',
    backgroundColor: colors.canvas,
    borderRadius: radius.comfortable,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  sheetActions: { flexDirection: 'row', gap: spacing.md },
  sheetBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.standard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: colors.surface1 },
  saveBtn: { backgroundColor: colors.blue },
  dim: { opacity: 0.6 },
});
