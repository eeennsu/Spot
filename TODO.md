# TODO.md — Phase 진행 추적기

> `docs/PRD.md` Phase 로드맵 기반 체크리스트.
> **각 Phase가 끝나면 이 파일을 갱신하고 커밋한다.**

---

## Phase 0 — 세팅 & 프로젝트 토대 ✅ 완료

- [x] Expo(TS, New Architecture, dev client, prebuild) + 핵심 패키지 설치
- [x] FSD 폴더 구조 골격 생성
- [x] 도메인 타입 정의 (`entities/project`, `entities/shape`, `entities/material`)
- [x] SQLite 스키마 (Project/Shape/Material 테이블)
- [x] repository 골격 생성 (`features/<domain>/repositories/`)
- [x] 프로젝트 목록 화면: 생성 / 이름 수정 / 삭제 / 빈 상태
- [x] 상세 화면 진입(빈 캔버스) + expo-router 네비게이션
- [x] 디자인 토큰 (`src/shared/theme/`) — DESIGN.md + DESIGN-expo.md 기반 번역
- [x] **완료 기준**: 프로젝트를 만들고 이름을 바꾸고 열 수 있고, DB가 재실행 후 유지된다.

---

## Phase 1 — 도형 편집기 코어 (요구사항 1, 도형 7종) ✅ 완료

- [x] Viewer/Edit 토글 (기본 Viewer, 우상단 "편집" 버튼으로 진입)
- [x] Edit 모드: 도형 팔레트에서 7종 추가
  - [x] 자재 도형 4종: rect / square(1:1 고정) / L(ㄴ자, SVG 폴리곤) / circle(1:1 고정)
  - [x] 공간 도형 3종: door("문") / office("사무실") / etc("기타", 라벨 편집 가능)
- [x] 이동 / 리사이즈(우하단 핸들) / 회전(상단 핸들·인스펙터 15° 스텝) — reanimated UI 스레드
- [x] 색 지정 / 삭제 / 별칭(alias) 입력 — ShapeInspector
- [x] repository 경유 저장·복원 (useShapeCanvas → repositories → SQLite)
- [x] **완료 기준**: 7종 도형을 배치·조작·색/별칭 지정하고 앱 재실행 후 유지된다.

> 기술결정: 도형 렌더 = 절대배치 Animated.View + View 채움, ㄴ자만 react-native-svg
> Polygon(viewBox 0~100, preserveAspectRatio none → 리사이즈 라이브 스케일). 캔버스 = pan+pinch.
> 도형 채움색은 `@shared/theme` palette 토큰(콘텐츠 색). 캔버스 pan 은 blocksExternalGesture 로
> 도형 조작 중 차단. 알려진 한계: 회전 핸들은 수평 드래그 증분 방식(정밀 각도는 인스펙터 버튼).

---

## Phase 2 — 자재 + 층(랙 레이어) (요구사항 2) ✅ 완료

- [x] 자재 도형 탭 → 바텀시트(공용 BottomSheet) — Edit: 인스펙터 "자재 층 관리" / Viewer: 직접
- [x] 자재 추가: 이름(필수) / 설명(옵션) / 이미지(옵션, expo-file-system 로컬 복사)
- [x] 한 도형에 자재 여러 개 = 층(layerOrder)으로 쌓기 (+ 층 추가)
- [x] 층 순서 변경(▲▼) / 자재 수정(인라인) / 삭제(이미지 로컬본 정리)
- [x] **완료 기준**: 한 랙에 자재 층층이 등록·정렬, 사진 표시, 재실행 후 유지.

> 추가: React Compiler 활성화(app.json experiments.reactCompiler) — 수동 memo 불필요.
> expo-image-picker 플러그인 등록. 이미지는 documentDirectory/materials/ 로 복사, DB엔 경로만.
> 공용 컴포넌트 신설: BottomSheet(Modal+reanimated), LocalImage(사진 유실 플레이스홀더).

---

## Phase 3 — Viewer 모드 완성 (요구사항 4·5) ✅ 완료

- [x] Viewer 캔버스: 자재 도형에 대표 자재명(+N) 캡션 표시 (useProjectMaterials)
- [x] 자재 도형 탭 → 읽기전용 바텀시트: 층 목록 → 탭 시 설명·사진 펼침(ReadCard)
- [x] 빈 상태(자재 없음 안내) / 사진 유실 플레이스홀더(LocalImage)
- [x] **완료 기준**: 보기 전용으로 랙의 자재들을 사진까지 확인 가능.

> 자재명 맵은 shape JOIN 쿼리(repoMaterialListByProject). 시트 닫힐 때 재로드해 편집 반영.

---

## Phase 4 — 검색 (요구사항 3·6) ⏳ 대기

- [ ] 프로젝트 목록 화면 — 전역 검색 (모든 프로젝트 자재 대상)
- [ ] 프로젝트 상세 화면 — 현재 프로젝트 검색
- [ ] 자재 이름 + 별칭(alias) 부분 일치
- [ ] 결과 탭 → 해당 도형으로 이동 + 바텀시트로 자재 표시
- [ ] **완료 기준**: 두 화면 모두에서 자재 이름으로 찾아 해당 위치/자재로 이동한다.

---

## Phase 5 — PDF 출력 (요구사항 7) ⏳ 대기

- [ ] react-native-view-shot 으로 캔버스 캡처
- [ ] 자재 목록 HTML 생성 → expo-print 로 PDF 출력·공유
- [ ] **완료 기준**: 현재 평면도가 PDF로 떨어진다.

---

## Phase 6 — 학습 모드 (위치·이름 맞히기) ⏳ 대기

- [ ] 라벨 가린 상태에서 진입
- [ ] 위치 맞히기: 자재 이름 제시 → 평면도에서 도형 탭 → 정답/오답 피드백
- [ ] 이름 맞히기: 특정 도형 하이라이트 → 자재 이름 맞힘(객관식 또는 입력) → 피드백
- [ ] **완료 기준**: 두 방식의 퀴즈가 동작한다.
