// BottomSheet 내부에서 키보드를 회피하는 스크롤뷰.
// @gorhom/bottom-sheet 의 스크롤 연동 + react-native-keyboard-controller 의 KeyboardAwareScrollView 결합.
import {
  SCROLLABLE_TYPE,
  createBottomSheetScrollableComponent,
  type BottomSheetScrollViewMethods,
} from '@gorhom/bottom-sheet';
import type { BottomSheetScrollViewProps } from '@gorhom/bottom-sheet/src/components/bottomSheetScrollable/types';
import { memo } from 'react';
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-controller';
import Reanimated from 'react-native-reanimated';

const AnimatedScrollView = Reanimated.createAnimatedComponent(KeyboardAwareScrollView);
const BottomSheetScrollViewComponent = createBottomSheetScrollableComponent<
  BottomSheetScrollViewMethods,
  BottomSheetScrollViewProps
>(SCROLLABLE_TYPE.SCROLLVIEW, AnimatedScrollView);
const CommonBottomSheetKeyboardAwareScrollView = memo(BottomSheetScrollViewComponent);

CommonBottomSheetKeyboardAwareScrollView.displayName = 'CommonBottomSheetKeyboardAwareScrollView';

export default CommonBottomSheetKeyboardAwareScrollView as (
  props: BottomSheetScrollViewProps & KeyboardAwareScrollViewProps,
) => ReturnType<typeof CommonBottomSheetKeyboardAwareScrollView>;
