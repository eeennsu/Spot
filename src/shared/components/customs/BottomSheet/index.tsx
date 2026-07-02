// 공용 바텀시트 — @gorhom/bottom-sheet v5(BottomSheetModal) 기반.
// 제어는 visible state 가 아니라 ref 주입 방식(useBottomSheet 훅). woka_app 패턴.
// dynamic=true: 콘텐츠 높이맞춤(짧은 시트). false(기본): maxHeightRatio 고정 높이(스크롤·고정 푸터용).
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { type ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { BackHandler, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, scrim, spacing } from '@shared/theme';

interface Props {
  /** useBottomSheet().ref 주입 → present/dismiss 로 제어 */
  ref?: React.Ref<BottomSheetModal>;
  onClose?: () => void;
  children: ReactNode;
  /** 시트 최대(또는 고정) 높이 비율(0~1). 기본 0.85 */
  maxHeightRatio?: number;
  /** true면 콘텐츠 높이에 맞춰 시트 크기 결정. false(기본)면 maxHeightRatio 고정 높이. */
  dynamic?: boolean;
}

export default function BottomSheet({
  ref,
  onClose,
  children,
  maxHeightRatio = 0.85,
  dynamic = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // 내부 ref(back 핸들러에서 dismiss용) + 외부 주입 ref 동시 연결.
  const innerRef = useRef<BottomSheetModal>(null);
  const setRefs = useCallback(
    (node: BottomSheetModal | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<BottomSheetModal | null>).current = node;
    },
    [ref],
  );

  // 실제 열림 상태(백드롭 탭 닫힘 포함) 추적. index>=0 이면 열림.
  const openRef = useRef(false);
  const handleChange = useCallback((index: number) => {
    openRef.current = index >= 0;
  }, []);

  // Android 하드웨어 back: 시트 열려 있으면 시트만 닫고 네비게이션 차단.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (openRef.current) {
        innerRef.current?.dismiss();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  // 고정 모드: 단일 스냅 포인트. 동적 모드: 콘텐츠 측정 + 최대 높이 캡.
  const snapPoints = useMemo(() => [`${Math.round(maxHeightRatio * 100)}%`], [maxHeightRatio]);
  const maxDynamicContentSize = useMemo(
    () => Math.round(height * maxHeightRatio),
    [height, maxHeightRatio],
  );

  // 스크림 + 바깥 탭 닫기.
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior='close'
        opacity={1}
        style={[props.style, styles.backdrop]}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={setRefs}
      onChange={handleChange}
      onDismiss={onClose}
      enableDynamicSizing={dynamic}
      snapPoints={dynamic ? undefined : snapPoints}
      maxDynamicContentSize={dynamic ? maxDynamicContentSize : undefined}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
      handleStyle={styles.handleArea}
      keyboardBehavior='interactive'
      keyboardBlurBehavior='restore'
      android_keyboardInputMode='adjustResize'
    >
      {dynamic ? (
        // 동적: 콘텐츠 높이 측정 필요 → BottomSheetView.
        <BottomSheetView style={[styles.contentDynamic, { paddingBottom: insets.bottom + spacing.lg }]}>
          {children}
        </BottomSheetView>
      ) : (
        // 고정: 일반 View(flex:1). BottomSheetView로 감싸면 내부 BottomSheetScrollView 스크롤이 안 됨.
        <View style={[styles.contentFixed, { paddingBottom: insets.bottom + spacing.lg }]}>
          {children}
        </View>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: scrim },
  sheet: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.comfortable,
    borderTopRightRadius: radius.comfortable,
  },
  handleArea: { paddingTop: spacing.sm, paddingBottom: spacing.sm },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.circle,
    backgroundColor: colors.surface2,
  },
  contentFixed: { flex: 1, paddingTop: spacing.sm },
  contentDynamic: { paddingTop: spacing.sm },
});
