// 프로젝트 목록 + 전역 검색. 행 탭 → 상세. 검색 결과 탭 → 해당 프로젝트 도형으로 이동.
import { Stack, useRouter } from 'expo-router';
import { AlertCircle, Map, Pencil, Plus, Trash2 } from 'lucide-react-native';
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

import SearchBar from '@shared/components/customs/SearchBar';
import { colors, layout, radius, scrim, spacing, typography } from '@shared/theme';
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
  const { projects, load, loading, error } = useProjectList();
  const addProject = useProjectCreate();
  const renameProject = useProjectRename();
  const removeProject = useProjectDelete();
  const [name, setName] = useState('');
  // 새 평면도 추가 모달(우상단 + 버튼으로 열기).
  const [adding, setAdding] = useState(false);

  const [query, setQuery] = useState('');
  const { results } = useSearch(query); // 전역(projectId 없음)
  const searching = query.trim().length > 0;

  // 이름 수정 대상 프로젝트 + 편집 중 이름.
  const [editing, setEditing] = useState<IProject | null>(null);
  const [editName, setEditName] = useState('');
  // 삭제 확인 대상 프로젝트.
  const [deleting, setDeleting] = useState<IProject | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setName('');
    setAdding(true);
    utilHaptic('light');
  };

  const onAdd = async () => {
    const trimmed = name.trim() || `평면도 ${projects.length + 1}`;
    await addProject(trimmed);
    setName('');
    setAdding(false);
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

  // 삭제는 파괴적 동작이라 인앱 확인 시트로 한 번 막는다(시스템 alert 대신 앱 톤).
  const askDelete = (project: IProject) => {
    setDeleting(project);
    utilHaptic('light');
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    await removeProject(deleting.id);
    setDeleting(null);
    utilHapticNotify('success');
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior='height'>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={openAdd}
              hitSlop={10}
              accessibilityRole='button'
              accessibilityLabel='새 평면도 추가'
              style={({ pressed }) => [styles.headerAdd, pressed && styles.dim]}
            >
              <Plus size={22} color={colors.blue} strokeWidth={2.5} />
            </Pressable>
          ),
        }}
      />
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
      ) : error && !loading ? (
        // 목록 로드 실패 — 무한 로딩/빈 화면에 갇히지 않도록 재시도 가능한 에러 상태를 보여준다.
        <View style={styles.emptyState}>
          <AlertCircle size={40} color={colors.deadline} strokeWidth={1.5} />
          <Text style={[typography.body, styles.emptyText]}>{error}</Text>
          <Pressable
            onPress={() => load()}
            accessibilityRole='button'
            accessibilityLabel='다시 시도'
            style={({ pressed }) => [styles.emptyCta, pressed && styles.addBtnPressed]}
          >
            <Text style={[typography.button, { color: colors.canvas }]}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={projects}
            keyExtractor={p => p.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              // 로딩(초기 DB 로드/시드) 중에는 진짜 빈 상태가 아니므로 표시하지 않는다(깜빡임 방지).
              loading ? null : (
                <View style={styles.emptyState}>
                  <Map size={40} color={colors.textTertiary} strokeWidth={1.5} />
                  <Text style={[typography.body, styles.emptyText]}>
                    아직 만든 평면도가 없어요{'\n'}첫 평면도를 만들어볼까요?
                  </Text>
                  <Pressable
                    onPress={openAdd}
                    accessibilityRole='button'
                    accessibilityLabel='새 평면도 만들기'
                    style={({ pressed }) => [styles.emptyCta, pressed && styles.addBtnPressed]}
                  >
                    <Text style={[typography.button, { color: colors.canvas }]}>
                      새 평면도 만들기
                    </Text>
                  </Pressable>
                </View>
              )
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
                    hitSlop={6}
                    accessibilityRole='button'
                    accessibilityLabel='이름 수정'
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.dim]}
                  >
                    <Pencil size={18} color={colors.textSecondary} strokeWidth={2} />
                  </Pressable>
                  <Pressable
                    onPress={() => askDelete(item)}
                    hitSlop={6}
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
        </>
      )}

      {/* 새 평면도 추가 */}
      <Modal visible={adding} transparent animationType='fade' onRequestClose={() => setAdding(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAdding(false)}>
          <KeyboardAvoidingView behavior='padding' style={styles.sheetWrap}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={typography.heading}>새 평면도</Text>
              <TextInput
                style={styles.editInput}
                value={name}
                onChangeText={setName}
                placeholder='평면도 이름 (예: 1층 창고)'
                placeholderTextColor={colors.textTertiary}
                selectionColor={colors.blue}
                autoFocus
                returnKeyType='done'
                onSubmitEditing={onAdd}
              />
              <View style={styles.sheetActions}>
                <Pressable
                  onPress={() => setAdding(false)}
                  style={({ pressed }) => [styles.sheetBtn, styles.cancelBtn, pressed && styles.dim]}
                >
                  <Text style={[typography.button, { color: colors.textSecondary }]}>취소</Text>
                </Pressable>
                <Pressable
                  onPress={onAdd}
                  style={({ pressed }) => [styles.sheetBtn, styles.saveBtn, pressed && styles.dim]}
                >
                  <Text style={[typography.button, { color: colors.canvas }]}>추가하기</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

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

      {/* 프로젝트 삭제 확인 */}
      <Modal
        visible={!!deleting}
        transparent
        animationType='fade'
        onRequestClose={() => setDeleting(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setDeleting(null)}>
          <View style={styles.sheetWrap}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={typography.heading}>평면도 삭제</Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                &apos;{deleting?.name}&apos;을(를) 삭제할까요?{'\n'}등록한 도형·자재·사진이 모두
                사라져요.
              </Text>
              <View style={styles.sheetActions}>
                <Pressable
                  onPress={() => setDeleting(null)}
                  style={({ pressed }) => [styles.sheetBtn, styles.cancelBtn, pressed && styles.dim]}
                >
                  <Text style={[typography.button, { color: colors.textSecondary }]}>취소</Text>
                </Pressable>
                <Pressable
                  onPress={confirmDelete}
                  style={({ pressed }) => [styles.sheetBtn, styles.deleteBtn, pressed && styles.dim]}
                >
                  <Text style={[typography.button, { color: colors.canvas }]}>삭제</Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  searchWrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  listContent: { paddingVertical: spacing.md },
  emptyState: {
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.xl5,
    paddingHorizontal: spacing.xl,
  },
  emptyText: { textAlign: 'center', color: colors.textSecondary },
  emptyCta: {
    height: layout.buttonHeight,
    paddingHorizontal: spacing.xl2,
    borderRadius: radius.standard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
  },
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
    // 오탭 방지(#2): hitSlop(6)*2 보다 넓은 간격을 둬서 두 터치 영역이 겹치지 않게 한다.
    gap: spacing.lg,
    paddingRight: spacing.lg,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.soft,
  },
  headerAdd: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
  editInput: {
    height: spacing.xl4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.standard,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface1,
    ...typography.body,
    // 배경과 대비되는 진한 잉크색 명시(피드백 #2 — 글자 안 보임 방지).
    color: colors.textPrimary,
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
    minHeight: layout.buttonHeight,
    borderRadius: radius.standard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: colors.surface1 },
  saveBtn: { backgroundColor: colors.blue },
  deleteBtn: { backgroundColor: colors.deadline },
  dim: { opacity: 0.6 },
});
