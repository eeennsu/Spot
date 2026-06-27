// 검색 결과 리스트 — 행 탭 시 onSelect. 전역(showProject)/프로젝트내 공용.
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

import type { ISearchResult } from '../../types';

interface Props {
  results: ISearchResult[];
  /** 질의 입력 여부(빈 상태 문구 분기) */
  hasQuery: boolean;
  showProject?: boolean;
  onSelect: (result: ISearchResult) => void;
}

export default function SearchResultList({ results, hasQuery, showProject, onSelect }: Props) {
  if (hasQuery && results.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[typography.body, styles.emptyText]}>검색 결과가 없습니다</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(r) => r.key}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onSelect(item)}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <View style={[styles.dot, item.kind === 'alias' && styles.dotAlias]} />
          <View style={styles.texts}>
            <Text style={typography.taskTitle} numberOfLines={1}>{item.matched}</Text>
            <Text style={typography.metadata} numberOfLines={1}>
              {showProject && item.projectName ? `${item.projectName} · ` : ''}
              {item.shapeLabel ? `${item.shapeLabel} 도형` : '도형'}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  rowPressed: { backgroundColor: colors.surface1 },
  dot: { width: 8, height: 8, borderRadius: radius.circle, backgroundColor: colors.blue },
  dotAlias: { backgroundColor: colors.today },
  texts: { flex: 1, gap: 2 },
  empty: { paddingVertical: spacing.xl3, alignItems: 'center' },
  emptyText: { color: colors.textSecondary },
});
