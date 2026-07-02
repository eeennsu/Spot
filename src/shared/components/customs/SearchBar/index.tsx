// 공용 검색 입력 — 토큰 기반. 전역/프로젝트 검색 공용.
import { Search, X } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = '자재 이름·별칭 검색',
  autoFocus,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Search size={15} color={colors.textTertiary} strokeWidth={2} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.blue}
        autoFocus={autoFocus}
        returnKeyType='search'
        autoCorrect={false}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} style={styles.clear}>
          <X size={16} color={colors.textSecondary} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.standard,
    backgroundColor: colors.surface1,
  },
  input: { flex: 1, ...typography.body },
  clear: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});
