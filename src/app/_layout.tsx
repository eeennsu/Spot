// 루트 레이아웃 — 제스처 루트 / SafeArea / 폰트 게이트 / DB 초기화 / Stack 네비.
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';

import { migrate } from '@/data';
import { colors } from '@/theme';

export default function RootLayout() {
  // theme/typography 가 참조하는 패밀리명으로 Inter 로드.
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  // 빈 DB 생성 + 스키마 초기화(쿼리 전에 1회).
  useEffect(() => {
    migrate();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.canvas },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: { color: colors.textPrimary },
            contentStyle: { backgroundColor: colors.canvas },
          }}
        >
          <Stack.Screen name="index" options={{ title: '평면도' }} />
          <Stack.Screen name="project/[id]" options={{ title: '도형 편집기' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
