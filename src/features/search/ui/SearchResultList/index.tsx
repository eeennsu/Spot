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

const KIND_LABEL: Record<ISearchResult['kind'], string> = {
  material: '자재',
  alias: '별칭',
  tag: '태그',
};

export default function SearchResultList({ results, hasQuery, showProject, onSelect }: Props) {
  if (!hasQuery) {
    return (
      <View style={styles.empty}>
        <Text style={[typography.body, styles.emptyText]}>
          자재 이름·별칭·태그로 검색해 보세요
        </Text>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[typography.body, styles.emptyText]}>검색 결과가 없습니다</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={r => r.key}
      keyboardShouldPersistTaps='handled'
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onSelect(item)}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <View style={styles.kindMark}>
            <View
              style={[
                styles.dot,
                item.kind === 'alias' && styles.dotAlias,
                item.kind === 'tag' && styles.dotTag,
              ]}
            />
            <Text style={typography.tinyUpper}>{KIND_LABEL[item.kind]}</Text>
          </View>
          <View style={styles.texts}>
            <Text style={typography.taskTitle} numberOfLines={1}>
              {item.matched}
            </Text>
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
  kindMark: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: radius.circle, backgroundColor: colors.blue },
  dotAlias: { backgroundColor: colors.today },
  dotTag: { backgroundColor: colors.success },
  texts: { flex: 1, gap: 2 },
  empty: { paddingVertical: spacing.xl3, alignItems: 'center' },
  emptyText: { color: colors.textSecondary },
});
