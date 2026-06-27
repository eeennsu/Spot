// 프로젝트 상세 = 도형 편집기 셸. Entry/Body 분리(헤더 즉시 + 캔버스 지연 마운트).
// 데이터 접근은 features/*/hooks 경유. 모드 토글은 editor store.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useProjectGet } from '@features/project/hooks/useProjectGet';
import { useEditorStore } from '@features/shape/stores/editor';
import { useLearnStore } from '@features/learn/stores/learn';
import SearchOverlay from '@features/search/ui/SearchOverlay';
import ProjectCanvas from '@widgets/ProjectCanvas';
import { colors, spacing, typography } from '@shared/theme';

export default function ProjectDetailScreen() {
  const { id, focus } = useLocalSearchParams<{ id: string; focus?: string }>();
  const { project } = useProjectGet(id);

  const reset = useEditorStore((s) => s.reset);
  const stopLearn = useLearnStore((s) => s.stop);

  // 검색 결과/전역 이동 포커스 도형
  const [focusId, setFocusId] = useState<string | undefined>(focus);
  const [searchVisible, setSearchVisible] = useState(false);

  // 무거운 캔버스는 한 틱 뒤 마운트(헤더·배경 먼저).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  // 화면 떠날 때 편집기·학습 상태 초기화.
  useEffect(() => {
    return () => {
      reset();
      stopLearn();
    };
  }, [reset, stopLearn]);

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          title: project?.name ?? '평면도',
          headerRight: () => (
            <View style={styles.headerRow}>
              <Pressable onPress={() => setSearchVisible(true)} hitSlop={10} style={styles.headerBtn}>
                <Text style={styles.searchIcon}>🔍</Text>
              </Pressable>
              <EditToggle />
            </View>
          ),
        }}
      />
      {ready ? (
        <ProjectCanvas projectId={id} focusShapeId={focusId} projectName={project?.name} />
      ) : (
        <View style={styles.loading} />
      )}

      <SearchOverlay
        visible={searchVisible}
        projectId={id}
        onClose={() => setSearchVisible(false)}
        onSelect={(r) => setFocusId(r.shapeId)}
      />
    </View>
  );
}

/** 우상단 Viewer↔Edit 토글. editor store 직접 사용(전역 UI 상태). */
function EditToggle() {
  const mode = useEditorStore((s) => s.mode);
  const toggle = useEditorStore((s) => s.toggleMode);
  const editing = mode === 'edit';
  return (
    <Pressable onPress={toggle} hitSlop={10} style={styles.headerBtn}>
      <Text style={[typography.button, { color: colors.blue }]}>
        {editing ? '완료' : '편집'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  loading: { flex: 1, backgroundColor: colors.canvas },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerBtn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  searchIcon: { fontSize: 18 },
});
