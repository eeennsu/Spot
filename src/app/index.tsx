// 프로젝트 목록 화면(Phase 0 네비/DB 동작 증명).
// 프로젝트 추가 → DB 쓰기·읽기·재실행 유지. 행 탭 → 상세(도형 편집기 자리).
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProjectList } from '@features/project/hooks/useProjectList';
import { useProjectCreate } from '@features/project/hooks/useProjectCreate';
import { colors, radius, spacing, typography } from '@shared/theme';

export default function ProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { projects, load } = useProjectList();
  const addProject = useProjectCreate();
  const [name, setName] = useState('');

  useEffect(() => {
    load();
  }, [load]);

  const onAdd = async () => {
    const trimmed = name.trim() || `평면도 ${projects.length + 1}`;
    await addProject(trimmed);
    setName('');
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={projects}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[typography.metadata, styles.empty]}>
            프로젝트가 없다. 아래에서 새 평면도를 추가하라.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/project/${item.id}`)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={typography.taskTitle}>{item.name}</Text>
            <Text style={typography.metadata}>탭하여 열기</Text>
          </Pressable>
        )}
      />

      <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="새 평면도 이름"
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.blue}
          returnKeyType="done"
          onSubmitEditing={onAdd}
        />
        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
        >
          <Text style={typography.button}>추가</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
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
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface1,
    ...typography.body,
  },
  addBtn: {
    height: 40,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
  },
  addBtnPressed: { backgroundColor: colors.bluePressed },
});
