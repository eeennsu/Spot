// 프로젝트 캔버스 위젯 — Phase 1: pan/zoom + 도형 7종 배치·조작.
// shape feature 합성. 데이터는 features/shape/hooks 경유(repository 직접 호출 없음).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import BottomSheet from '@shared/components/customs/BottomSheet';
import { useBottomSheet } from '@shared/components/customs/BottomSheet/useBottomSheet';
import { colors, radius, spacing, typography } from '@shared/theme';
import { utilHaptic, utilHapticNotify } from '@shared/utils/util_haptics';

import { BOARD_MAX_SIZE, BOARD_MIN_SIZE, shapeCatalogOf } from '@entities/shape/consts';
import type { IShapeType } from '@entities/shape/consts';
import type { IShape } from '@entities/shape/types';

import { useLearnData } from '@features/learn/hooks/useLearnData';
import { useLearnStore } from '@features/learn/stores/learn';
import type { ILearnType } from '@features/learn/types';
import LearnBar from '@features/learn/ui/LearnBar';
import LearnStart from '@features/learn/ui/LearnStart';
import { useProjectMaterials } from '@features/material/hooks/useProjectMaterials';
import MaterialPanel from '@features/material/ui/MaterialPanel';
import { useExportPdf } from '@features/pdf/hooks/useExportPdf';
import { useProjectBoard } from '@features/project/hooks/useProjectBoard';
import { useShapeCanvas } from '@features/shape/hooks/useShapeCanvas';
import { useEditorStore } from '@features/shape/stores/editor';
import ShapeInspector from '@features/shape/ui/ShapeInspector';
import ShapePalette from '@features/shape/ui/ShapePalette';
import ShapeView from '@features/shape/ui/ShapeView';

/** 시트 헤더 타이틀 — 별칭 > 라벨 > 기본명. */
function shapeTitle(shape: IShape): string {
  return shape.alias || shape.label || (shape.category === 'material' ? '자재 랙' : '공간');
}

interface Props {
  projectId: string;
  /** 뷰어에서 자재 도형 탭(Phase 2~3 바텀시트). Phase 1 은 선택만. */
  onTapMaterialShape?: (shape: IShape) => void;
  /** 검색 결과 이동 대상 도형 — 중앙 정렬 + 하이라이트 + (자재면) 시트 열기 */
  focusShapeId?: string;
  /** PDF 제목 */
  projectName?: string;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 3;
/** fit 계산의 절대 하한 — 큰 도화지도 화면에 다 들어오도록(잘림 방지). 대화형 MIN_SCALE 와 별개. */
const ABS_MIN_FIT = 0.03;
/** Edit 모드 fit 비율(조작 여백 확보) */
const BOARD_FIT_RATIO = 0.92;
/** Viewer 모드 fit 비율(화면 꽉 채움) */
const BOARD_FILL_RATIO = 1.0;
/** 도화지 리사이즈 핸들 지름(dp) */
const HANDLE = 28;

export default function ProjectCanvas({
  projectId,
  onTapMaterialShape,
  focusShapeId,
  projectName,
}: Props) {
  const insets = useSafeAreaInsets();
  const canvasRef = useRef<View>(null);
  const { exportPdf, exporting } = useExportPdf();
  const { shapes, loaded, addShape, updateShape, removeShape } = useShapeCanvas(projectId);
  // 프로젝트별 도화지 크기(조절 대상). board.{w,h} 는 JS 값(ShapeView 클램프용),
  // boardW/boardH shared 는 드래그 중 실시간 렌더용.
  const { board, loaded: boardLoaded, save: saveBoard } = useProjectBoard(projectId);

  const mode = useEditorStore(s => s.mode);
  const selectedId = useEditorStore(s => s.selectedShapeId);
  const select = useEditorStore(s => s.select);
  const editable = mode === 'edit';

  const selectedShape = useMemo(
    () => shapes.find(s => s.id === selectedId) ?? null,
    [shapes, selectedId],
  );

  // 캔버스 변환 상태
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const scale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startScale = useSharedValue(1);

  // 도화지 크기 shared(드래그 실시간 렌더). 시작 스냅샷은 핸들 드래그 보정용.
  const boardW = useSharedValue(board.w);
  const boardH = useSharedValue(board.h);
  const startBoardW = useSharedValue(board.w);
  const startBoardH = useSharedValue(board.h);
  // 최초 fit 전까지 캔버스 콘텐츠를 숨겨 원본 스케일 한 프레임 깜빡임 방지.
  const contentOpacity = useSharedValue(0);

  // DB 로드/저장 결과를 shared value 에 반영.
  useEffect(() => {
    boardW.value = board.w;
    boardH.value = board.h;
  }, [board.w, board.h, boardW, boardH]);

  const canvasPanRef = useRef<unknown>(undefined);

  // 자재 패널(바텀시트) — ref 주입 제어 + 대상 도형 데이터
  const materialSheet = useBottomSheet();
  const learnSheet = useBottomSheet();
  const [sheetShape, setSheetShape] = useState<IShape | null>(null);

  // 자재 시트 열기: 데이터 세팅 후 present(ref). 콘텐츠 마운트 뒤 다음 틱에 열린다.
  const openMaterialSheet = (shape: IShape) => {
    setSheetShape(shape);
    materialSheet.present();
  };

  // Viewer 캔버스 라벨용 자재명 맵
  const { namesByShape, reload: reloadMaterials } = useProjectMaterials(projectId);

  // 학습 모드
  const { count: learnCount, reload: reloadQuiz } = useLearnData(projectId);
  const learnActive = useLearnStore(s => s.active);
  const learnType = useLearnStore(s => s.type);
  const learnIndex = useLearnStore(s => s.index);
  const learnNameQs = useLearnStore(s => s.name);
  const startLearnStore = useLearnStore(s => s.start);
  const answerPosition = useLearnStore(s => s.answerPosition);
  const stopLearn = useLearnStore(s => s.stop);

  // 학습 중 편집 진입 시 학습 종료(혼선 방지).
  useEffect(() => {
    if (editable && learnActive) stopLearn();
  }, [editable, learnActive, stopLearn]);

  const learnTargetShapeId =
    learnActive && learnType === 'name' ? learnNameQs[learnIndex]?.shapeId : undefined;

  const startLearn = async (type: ILearnType) => {
    const set = await reloadQuiz();
    materialSheet.dismiss();
    learnSheet.dismiss();
    startLearnStore(type, set.position, set.name);
  };

  // 시트 닫힘(편집 반영) 시 자재명 갱신.
  useEffect(() => {
    if (!sheetShape) reloadMaterials();
  }, [sheetShape, reloadMaterials]);

  // 캔버스 크기(중앙 정렬 계산용) + 검색 하이라이트
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // 도화지를 화면에 맞춰 가운데 정렬. animated=true 면 부드럽게 전환.
  const fitBoard = useCallback(
    (ratio: number, animated: boolean) => {
      if (canvasSize.w === 0) return;
      const fit = Math.min(canvasSize.w / board.w, canvasSize.h / board.h) * ratio;
      // 큰 도화지가 화면보다 크면 s 가 MIN_SCALE 이하여도 허용 → 절대 잘리지 않게.
      const s = Math.min(Math.max(fit, ABS_MIN_FIT), MAX_SCALE);
      const px = (canvasSize.w / 2 - board.w / 2) * s;
      const py = (canvasSize.h / 2 - board.h / 2) * s;
      if (animated) {
        scale.value = withTiming(s, { duration: 260 });
        panX.value = withTiming(px, { duration: 260 });
        panY.value = withTiming(py, { duration: 260 });
      } else {
        scale.value = s;
        panX.value = px;
        panY.value = py;
      }
    },
    // panX/panY/scale 는 shared value(안정 참조)라 deps 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvasSize.w, canvasSize.h, board.w, board.h],
  );

  // 더블탭·복귀용 — 현재 모드에 맞는 fit 로 애니메이션.
  const resetFit = () => fitBoard(editable ? BOARD_FIT_RATIO : BOARD_FILL_RATIO, true);

  // 최초 측정 시 fit(크기 제한 공간 인지). 모드에 맞는 비율로.
  const didFit = useRef(false);
  useEffect(() => {
    if (didFit.current || canvasSize.w === 0 || !boardLoaded) return;
    didFit.current = true;
    fitBoard(editable ? BOARD_FIT_RATIO : BOARD_FILL_RATIO, false);
    contentOpacity.value = withTiming(1, { duration: 200 });
  }, [canvasSize.w, canvasSize.h, boardLoaded, editable, fitBoard, contentOpacity]);

  // Viewer 진입 시 화면 꽉 채우도록 재정렬(확대해 보다가 돌아와도 정위치 복귀).
  useEffect(() => {
    if (!boardLoaded || canvasSize.w === 0 || !didFit.current) return;
    if (!editable) fitBoard(BOARD_FILL_RATIO, true);
  }, [editable, boardLoaded, canvasSize.w, canvasSize.h, fitBoard]);

  // 검색 결과 포커스: 중앙 정렬 + 하이라이트 + 자재면 시트.
  useEffect(() => {
    if (!focusShapeId || !loaded || canvasSize.w === 0) return;
    const target = shapes.find(s => s.id === focusShapeId);
    if (!target) return;
    scale.value = withTiming(1, { duration: 220 });
    panX.value = withTiming(canvasSize.w / 2 - (target.x + target.width / 2), { duration: 260 });
    panY.value = withTiming(canvasSize.h / 2 - (target.y + target.height / 2), { duration: 260 });
    setHighlightId(target.id);
    if (target.category === 'material') openMaterialSheet(target);
    const t = setTimeout(() => setHighlightId(null), 1800);
    return () => clearTimeout(t);
    // panX/panY/scale 는 shared value(안정 참조)라 deps 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusShapeId, loaded, canvasSize.w, canvasSize.h, shapes]);

  const captionOf = (shape: IShape): { name: string; extra: number } | undefined => {
    if (shape.category !== 'material') return undefined;
    const names = namesByShape[shape.id];
    if (!names || names.length === 0) return undefined;
    return { name: names[0], extra: names.length - 1 };
  };

  // 시트 열림 동안 캔버스 제스처를 끈다. RNGH 제스처 중재는 GestureHandlerRootView 전역이라,
  // 시트 위로 스와이프해도 아래 캔버스 pan/pinch가 같은 터치를 노려 시트 스크롤과 경쟁한다.
  // → 첫 몇 번 스와이프가 캔버스로 먹혀 "여러 번 당겨야 스크롤됨" 증상. 시트 열리면 캔버스 제스처 비활성.
  const sheetOpen = !!sheetShape;

  // 진입 시 도화지가 화면을 꽉 채우지만(fit), Viewer 에서도 자재명을 읽으려면 확대가 필요하다.
  // → pan/pinch 는 두 모드 모두 허용(시트 열림 중에는 비활성). 더블탭으로 항상 fit 로 복귀.
  const pan = Gesture.Pan()
    .withRef(canvasPanRef as never)
    .enabled(!sheetOpen)
    .averageTouches(true)
    .onBegin(() => {
      startX.value = panX.value;
      startY.value = panY.value;
    })
    .onUpdate(e => {
      panX.value = startX.value + e.translationX;
      panY.value = startY.value + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .enabled(!sheetOpen)
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate(e => {
      const next = startScale.value * e.scale;
      scale.value = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
    });

  const tapBackground = Gesture.Tap()
    .enabled(!sheetOpen)
    .onEnd(() => {
      scheduleOnRN(select, null);
    });

  // 더블탭 → 현재 모드 fit 로 부드럽게 복귀(확대 후 원위치).
  const doubleTap = Gesture.Tap()
    .enabled(!sheetOpen)
    .numberOfTaps(2)
    .onEnd(() => {
      scheduleOnRN(resetFit);
    });

  const canvasGesture = Gesture.Race(
    Gesture.Exclusive(doubleTap, tapBackground),
    Gesture.Simultaneous(pan, pinch),
  );

  // 도화지 우하단 핸들 드래그 → 보드 크기 조절(좌상단 고정). 최소/최대 도달 시 햅틱, 종료 시 DB 저장.
  const atBound = useSharedValue(false);
  const boardResize = Gesture.Pan()
    .onBegin(() => {
      startBoardW.value = boardW.value;
      startBoardH.value = boardH.value;
      scheduleOnRN(utilHaptic, 'medium');
    })
    .onUpdate(e => {
      const nw = Math.min(
        Math.max(startBoardW.value + e.translationX / scale.value, BOARD_MIN_SIZE),
        BOARD_MAX_SIZE,
      );
      const nh = Math.min(
        Math.max(startBoardH.value + e.translationY / scale.value, BOARD_MIN_SIZE),
        BOARD_MAX_SIZE,
      );
      // 경계(최소·최대)에 새로 닿는 순간 한 번만 햅틱.
      const hit =
        nw === BOARD_MIN_SIZE ||
        nw === BOARD_MAX_SIZE ||
        nh === BOARD_MIN_SIZE ||
        nh === BOARD_MAX_SIZE;
      if (hit && !atBound.value) {
        atBound.value = true;
        scheduleOnRN(utilHaptic, 'light');
      } else if (!hit && atBound.value) {
        atBound.value = false;
      }
      boardW.value = nw;
      boardH.value = nh;
    })
    .onEnd(() => {
      atBound.value = false;
      scheduleOnRN(saveBoard, Math.round(boardW.value), Math.round(boardH.value));
    });
  boardResize.blocksExternalGesture(canvasPanRef as never);

  const boardStyle = useAnimatedStyle(() => ({ width: boardW.value, height: boardH.value }));

  // 핸들을 보드 우하단 모서리에 붙인다(보드 변환 안에 위치 → pan/zoom 따라감).
  const boardHandleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: boardW.value - HANDLE / 2 },
      { translateY: boardH.value - HANDLE / 2 },
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateX: panX.value }, { translateY: panY.value }, { scale: scale.value }],
  }));

  const onTapViewer = (shape: IShape) => {
    // 학습 위치 맞히기: 탭이 곧 응답(시트 열지 않음)
    if (learnActive) {
      if (learnType === 'position') answerPosition(shape.id);
      return;
    }
    if (shape.category !== 'material') return;
    onTapMaterialShape?.(shape);
    openMaterialSheet(shape); // 읽기전용 자재 패널
  };

  // 도형 삭제 — 자재 층까지 함께 사라지므로 확인 후 실행(되돌릴 수 없음).
  const onDelete = () => {
    if (!selectedShape) return;
    const target = selectedShape;
    const label = shapeTitle(target);
    Alert.alert('도형 삭제', `"${label}"을(를) 삭제할까요? 등록된 자재도 함께 사라집니다.`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await removeShape(target.id);
          select(null);
          utilHapticNotify('success');
        },
      },
    ]);
  };

  // 신규 도형은 도화지 중앙(하단 툴바에 가리지 않는 위치)에 계단식으로 놓고 즉시 선택.
  const handleAdd = async (type: IShapeType) => {
    const meta = shapeCatalogOf(type);
    // 연속 추가 시 완전 겹침 방지 — 개수에 따라 우하향 계단 오프셋(6개 주기로 순환).
    const cascade = (shapes.length % 6) * spacing.lg;
    const cx = board.w / 2 - meta.defaultWidth / 2 + cascade;
    const cy = board.h / 2 - meta.defaultHeight / 2 + cascade;
    const x = Math.min(Math.max(cx, 0), board.w - meta.defaultWidth);
    const y = Math.min(Math.max(cy, 0), board.h - meta.defaultHeight);
    const shape = await addShape(type, { x, y });
    select(shape.id);
    utilHaptic('medium');
  };

  const showEmpty = loaded && shapes.length === 0;

  return (
    <View style={styles.root}>
      <View
        ref={canvasRef}
        collapsable={false}
        style={styles.canvas}
        onLayout={e =>
          setCanvasSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
        }
      >
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        <Animated.View style={[StyleSheet.absoluteFill, contentStyle]} pointerEvents='box-none'>
          {/* 도화지 — 크기 제한 있는 배치 영역(검은 테두리). 시각용이라 터치 통과. */}
          <Animated.View style={[styles.board, boardStyle]} pointerEvents='none' />
          {shapes.map(shape => (
            <ShapeView
              key={shape.id}
              shape={shape}
              editable={editable}
              selected={selectedId === shape.id}
              scale={scale}
              boardWidth={board.w}
              boardHeight={board.h}
              canvasPanRef={canvasPanRef as never}
              onSelect={select}
              onTapViewer={onTapViewer}
              onCommit={updateShape}
              caption={learnActive ? undefined : captionOf(shape)}
              highlighted={highlightId === shape.id || learnTargetShapeId === shape.id}
            />
          ))}

          {/* 도화지 우하단 크기 조절 핸들 — Edit 에서만. 보드 변환 안에 있어 pan/zoom 따라감. */}
          {editable ? (
            <GestureDetector gesture={boardResize}>
              <Animated.View style={[styles.boardHandle, boardHandleStyle]} hitSlop={20} />
            </GestureDetector>
          ) : null}
        </Animated.View>

        {showEmpty ? (
          <View style={styles.empty} pointerEvents='none'>
            <Text style={[typography.body, styles.emptyText]}>
              {editable
                ? '아래 팔레트에서 도형을 추가하세요'
                : '도형이 없습니다. 우상단 편집을 눌러 추가하세요'}
            </Text>
          </View>
        ) : null}

        {/* Edit 모드: 도화지 크기 + 조절 안내(핸들 발견성) */}
        {editable ? (
          <View style={[styles.boardInfo, { top: spacing.sm }]} pointerEvents='none'>
            <Text style={styles.boardInfoText}>
              도화지 {board.w}×{board.h} · 우하단 모서리로 크기 조절
            </Text>
          </View>
        ) : null}
      </View>

      {/* Edit 하단: 인스펙터(선택 시) 또는 팔레트.
          오버레이로 띄워 캔버스(도화지) 높이를 고정 — 인스펙터 열려도 도화지 안 움직임. */}
      {editable ? (
        <View style={[styles.editBar, { paddingBottom: insets.bottom }]}>
          {selectedShape ? (
            <Animated.View key='inspector' entering={FadeIn.duration(160)}>
              <ShapeInspector
                shape={selectedShape}
                onUpdate={patch => updateShape(selectedShape.id, patch)}
                onDelete={onDelete}
                onClose={() => select(null)}
                onManageMaterials={() => openMaterialSheet(selectedShape)}
              />
            </Animated.View>
          ) : (
            <Animated.View key='palette' entering={FadeIn.duration(160)} style={styles.paletteWrap}>
              <ShapePalette onAdd={handleAdd} />
            </Animated.View>
          )}
        </View>
      ) : null}

      {/* Viewer FAB — 학습 + PDF (학습 진행 중엔 숨김) */}
      {!editable && !learnActive ? (
        <>
          <Pressable
            onPress={() => {
              utilHaptic('light');
              learnSheet.present();
            }}
            accessibilityRole='button'
            accessibilityLabel='학습 시작'
            style={({ pressed }) => [
              styles.fab,
              styles.fabSecondary,
              { bottom: insets.bottom + spacing.xl + 60 },
              pressed && styles.fabPressed,
            ]}
          >
            <Text style={[styles.fabText, { color: colors.blue }]}>학습</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              utilHaptic('light');
              exportPdf({ viewRef: canvasRef, projectId, title: projectName ?? '평면도' });
            }}
            disabled={exporting}
            accessibilityRole='button'
            accessibilityLabel='평면도 PDF 내보내기'
            style={({ pressed }) => [
              styles.fab,
              { bottom: insets.bottom + spacing.xl },
              exporting && styles.fabDisabled,
              pressed && styles.fabPressed,
            ]}
          >
            <Text style={styles.fabText}>{exporting ? '내보내는 중…' : 'PDF'}</Text>
          </Pressable>
        </>
      ) : null}

      {/* 학습 하단 바 */}
      {learnActive ? <LearnBar onRestart={() => startLearn(learnType)} /> : null}

      {/* 학습 시작 선택 시트 */}
      <LearnStart sheetRef={learnSheet.ref} count={learnCount} onPick={startLearn} />

      {/* 자재 패널 바텀시트 — Edit=편집 / Viewer=읽기 */}
      <BottomSheet ref={materialSheet.ref} onClose={() => setSheetShape(null)} maxHeightRatio={0.7}>
        {sheetShape ? (
          <MaterialPanel
            shapeId={sheetShape.id}
            title={shapeTitle(sheetShape)}
            editable={editable}
            onRequestClose={() => materialSheet.dismiss()}
          />
        ) : null}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  // 도화지 바깥은 옅은 회색 → 흰 도화지가 떠 보이고 경계가 분명해짐.
  canvas: { flex: 1, overflow: 'hidden', backgroundColor: colors.surface1 },
  board: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: colors.board,
    borderWidth: 2,
    borderColor: colors.boardBorder,
    borderRadius: radius.soft,
  },
  // 우하단 크기 조절 핸들 — 눈에 띄는 원형(블루 테두리). translate 로 보드 모서리에 붙는다.
  boardHandle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    backgroundColor: colors.canvas,
    borderWidth: 3,
    borderColor: colors.blue,
  },
  empty: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: { color: colors.textSecondary, textAlign: 'center' },
  boardInfo: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.circle,
    backgroundColor: colors.surface2,
  },
  boardInfoText: { ...typography.metadata, color: colors.textSecondary },
  editBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.canvas,
  },
  paletteWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.canvas,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    minWidth: 56,
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    // magicPlus 글로우 토큰과 동일 의도
    shadowColor: colors.blue,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  fabSecondary: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowOpacity: 0.12,
    shadowColor: colors.textPrimary,
  },
  fabDisabled: { opacity: 0.6 },
  fabPressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
  fabText: { ...typography.button, color: colors.canvas },
});
