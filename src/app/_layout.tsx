// 루트 레이아웃 — 제스처 루트 / SafeArea / 폰트 게이트 / DB 초기화 / Stack 네비.
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { migrate } from '@shared/db';
import { colors } from '@shared/theme';

import { useSeedExampleProject } from '@features/seed/hooks/useSeedExampleProject';

export default function RootLayout() {
  // theme/typography 가 참조하는 패밀리명으로 Inter 로드.
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const seedExampleProject = useSeedExampleProject();
  // DB 준비(스키마 + 예시 시드) 완료 전엔 화면을 열지 않는다 — 목록이 시드를 놓치지 않게.
  const [dbReady, setDbReady] = useState(false);

  // 빈 DB 생성 + 스키마 초기화(쿼리 전에 1회) → 예시 평면도 1회 시드.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        migrate();
        await seedExampleProject();
      } finally {
        // 시드 실패해도 앱 부팅은 막지 않는다.
        if (alive) setDbReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [seedExampleProject]);

  if (!fontsLoaded || !dbReady) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <StatusBar style='dark' />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.canvas },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { color: colors.textPrimary },
                contentStyle: { backgroundColor: colors.canvas },
              }}
            >
              <Stack.Screen name='index' options={{ title: '평면도' }} />
              <Stack.Screen name='project/[id]' options={{ title: '도형 편집기' }} />
            </Stack>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
});
