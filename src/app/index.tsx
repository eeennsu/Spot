// 프로젝트 목록 + 전역 검색. 행 탭 → 상세. 검색 결과 탭 → 해당 프로젝트 도형으로 이동.
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
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

  // 관리(이름 수정/삭제) 대상 프로젝트 + 편집 중 이름.
  const [managing, setManaging] = useState<IProject | null>(null);
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

  const openManage = (project: IProject) => {
    setManaging(project);
    setEditName(project.name);
  };

  const onRename = async () => {
    if (!managing) return;
    const trimmed = editName.trim();
    if (trimmed && trimmed !== managing.name) await renameProject(managing.id, trimmed);
    setManaging(null);
    utilHaptic('light');
  };

  const onDelete = () => {
    if (!managing) return;
    const target = managing;
    Alert.alert('평면도 삭제', `"${target.name}"을(를) 삭제할까요? 되돌릴 수 없습니다.`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await removeProject(target.id);
          setManaging(null);
          utilHapticNotify('success');
        },
      },
    ]);
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
              <Pressable
                onPress={() => router.push(`/project/${item.id}`)}
                onLongPress={() => openManage(item)}
                delayLongPress={300}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <Text style={typography.taskTitle}>{item.name}</Text>
                <Text style={typography.metadata}>탭하여 열기 · 길게 눌러 관리</Text>
              </Pressable>
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

      {/* 프로젝트 관리 — 이름 수정 + 삭제 */}
      <Modal
        visible={!!managing}
        transparent
        animationType='fade'
        onRequestClose={() => setManaging(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setManaging(null)}>
          <KeyboardAvoidingView behavior='padding' style={styles.sheetWrap}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={typography.heading}>평면도 관리</Text>
              <TextInput
                style={styles.input}
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
                  onPress={onDelete}
                  style={({ pressed }) => [
                    styles.sheetBtn,
                    styles.deleteBtn,
                    pressed && styles.dim,
                  ]}
                >
                  <Text style={[typography.button, { color: colors.deadline }]}>삭제</Text>
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
  row: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  rowPressed: { backgroundColor: colors.surface2 },
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
  deleteBtn: { backgroundColor: colors.surface1 },
  saveBtn: { backgroundColor: colors.blue },
  dim: { opacity: 0.6 },
});
