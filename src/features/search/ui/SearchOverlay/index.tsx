// 프로젝트 내 검색 오버레이 — Modal. 결과 탭 → onSelect(도형 포커스) 후 닫힘.
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SearchBar from '@shared/components/customs/SearchBar';
import { colors, spacing, typography } from '@shared/theme';

import { useSearch } from '../../hooks/useSearch';
import type { ISearchResult } from '../../types';
import SearchResultList from '../SearchResultList';

interface Props {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onSelect: (result: ISearchResult) => void;
}

export default function SearchOverlay({ visible, projectId, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { results } = useSearch(query, projectId);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <SearchBar value={query} onChangeText={setQuery} autoFocus placeholder="이 평면도에서 검색" />
          </View>
          <Pressable onPress={onClose} hitSlop={10} style={styles.cancel}>
            <Text style={[typography.button, { color: colors.blue }]}>닫기</Text>
          </Pressable>
        </View>

        <SearchResultList
          results={results}
          hasQuery={query.trim().length > 0}
          onSelect={(r) => {
            onSelect(r);
            onClose();
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  cancel: { minHeight: 44, justifyContent: 'center' },
});
