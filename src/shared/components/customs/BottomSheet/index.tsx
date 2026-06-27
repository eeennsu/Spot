// 공용 바텀시트 — Modal + reanimated 슬라이드업. Android 뒤로가기 → 닫기.
// 자재 패널(Phase 2 편집 / Phase 3 읽기) 등 재사용. 토큰만 사용.
import type { ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors, radius, scrim, spacing } from '@shared/theme'

interface Props {
    visible: boolean
    onClose: () => void
    children: ReactNode
    /** 시트 최대 높이 비율(0~1). 기본 0.85 */
    maxHeightRatio?: number
}

export default function BottomSheet({
    visible,
    onClose,
    children,
    maxHeightRatio = 0.85,
}: Props) {
    const insets = useSafeAreaInsets()

    return (
        <Modal
            visible={visible}
            transparent
            animationType='none'
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.root}>
                <Animated.View
                    entering={FadeIn.duration(180)}
                    exiting={FadeOut.duration(150)}
                    style={styles.backdropWrap}
                >
                    <Pressable style={styles.backdrop} onPress={onClose} />
                </Animated.View>

                <Animated.View
                    entering={SlideInDown.duration(260)}
                    style={[
                        styles.sheet,
                        {
                            maxHeight: `${Math.round(maxHeightRatio * 100)}%`,
                            paddingBottom: insets.bottom + spacing.lg,
                        },
                    ]}
                >
                    <View style={styles.handle} />
                    {children}
                </Animated.View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdropWrap: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backdrop: { flex: 1, backgroundColor: scrim },
    sheet: {
        backgroundColor: colors.canvas,
        borderTopLeftRadius: radius.comfortable,
        borderTopRightRadius: radius.comfortable,
        paddingTop: spacing.sm,
        // sheet 그림자(elevation.sheet 토큰과 동일 의도)
        shadowColor: 'rgba(0,0,0,0.12)',
        shadowOpacity: 1,
        shadowRadius: 32,
        shadowOffset: { width: 0, height: -8 },
        elevation: 8,
    },
    handle: {
        alignSelf: 'center',
        width: 36,
        height: 4,
        borderRadius: radius.circle,
        backgroundColor: colors.surface2,
        marginBottom: spacing.sm,
    },
})
