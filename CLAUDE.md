# CLAUDE.md

> 이 문서는 Claude Code가 매 세션 시작 시 반드시 참조하는 프로젝트 규칙이다.
> 작업 전 항상 이 문서와 `PRD.md`, `TODO.md`, `design/DESIGN.md` 를 먼저 읽는다.

## 프로젝트 개요

평면도 위에 도형(랙·공간)을 배치하고, 자재 도형에는 자재를 **층(layer)으로 쌓아** 등록·열람·검색·학습·PDF 출력하는 도구형 앱이다.

- **성격**: 개인 MVP, **출시 안 함**, **Android 전용**
- **모드**: 단일 화면에서 Viewer(기본) ↔ Edit 토글. 별도로 학습 모드.

## 기술 스택 (확정)

- **Expo** (최신 SDK, **New Architecture 기본 활성화**), `expo prebuild` + **dev client** 기반 (Expo Go 아님)
- **네비게이션**: expo-router
- **제스처/애니메이션**: react-native-gesture-handler + react-native-reanimated (드래그·리사이즈, UI 스레드 처리)
- **도형 렌더링**: react-native-svg 또는 absolute View (Phase 1에서 결정)
- **로컬 DB**: expo-sqlite
- **이미지**: expo-image-picker(선택) + expo-file-system(앱 로컬 복사, DB엔 경로만)
- **상태 관리**: zustand (전역 UI 상태만, 영속 데이터는 DB)
- **PDF**: react-native-view-shot 캡처 → expo-print HTML 삽입
- **UI 토큰**: design/DESIGN.md 기반. 상세 규칙은 아래 "디자인 시스템 규칙" 섹션을 강제로 따른다.

> ⚠️ Android 전용. iOS 분기/설정 코드 금지.

## UI/UX 원칙 (가장 중요 — 화려함보다 사용성)

이 앱은 보여주기용이 아니라 **현장에서 빠르게 찾고 쓰는 도구**다. 목표는 **사용성 + 깔끔함 + 직관성**이지, 멋이 아니다. 아래를 판단 기준으로 따른다.

**전체 방향**

- 화려함·트렌디함을 추구하지 않는다. 군더더기 없는 실용적 UI가 정답이다.
- 의심스러우면 항상 **더 단순한 쪽**을 택한다. 기능을 더하기 전에 "이게 사용성을 높이나, 화면만 복잡하게 하나"를 자문한다.
- 한 화면은 한 가지 일을 명확히 한다. 정보 밀도는 적당히, 여백으로 숨 쉬게 한다.

**구체 규칙 (장식 억제)**

- 불필요한 애니메이션 금지. 모션은 의미 있는 전환(바텀시트 열림, 모드 전환)에만, 짧고 절제되게.
- 과한 그림자/글로우/그라데이션 금지. 깊이는 미묘한 구분선·연한 음영 정도로만.
- 강조색은 액션·선택·포커스 등 **소수 지점에만**. 색을 흩뿌리지 않는다.
- 아이콘만으로 모호하면 라벨을 붙인다. "예뻐 보이려고" 텍스트를 숨기지 않는다.

**조작성 (현장 사용 고려)**

- 터치 타겟은 충분히 크게(최소 44dp 권장). 버튼·핸들이 작아 누르기 어려우면 안 된다.
- 주요 동작(편집 진입, 도형 추가, 자재 추가, 검색)은 한두 번의 탭으로 도달한다.
- 파괴적 동작(삭제)은 확인을 받는다. 되돌릴 수 없는 실수를 만들지 않는다.
- 빈 상태/로딩/에러는 항상 명확한 안내 문구로 처리한다(빈 화면 방치 금지).

**일관성**

- 같은 동작은 어디서나 같은 위치·같은 모양. 화면마다 버튼 위치가 바뀌지 않는다.
- 간격·모서리·타이포는 theme 토큰을 따라 화면 간 통일한다.

> 한 줄 요약: **"멋있나?"가 아니라 "쓰기 쉬운가? 헷갈리지 않나?"로 판단한다.**

## 디자인 시스템 규칙 (강제 — "참고"가 아니라 규칙이다)

출처: `design/DESIGN.md` (웹 브랜드에서 추출한 토큰). 너는 RN이므로 그대로 못 쓴다. 아래 절차를 강제한다.

**1단계 (Phase 0에서 1회): DESIGN.md → 테마 파일로 번역.**

- `src/theme/` 에 토큰을 RN 상수로 옮긴다: `colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts` (또는 통합 `tokens.ts`).
- 색은 hex 그대로, spacing/radius 는 px 숫자를 dp 숫자로, 폰트는 RN에서 쓸 수 있는 패밀리로 매핑(예: Geist/StyreneB 등 웹폰트는 Inter 같은 대체폰트로). 매핑한 원본↔대체를 주석으로 남긴다.
- DESIGN.md 의 **웹 레이아웃 패턴(히어로/푸터/CTA 배너 등)은 옮기지 않는다.** 토큰만 옮긴다.

**2단계 (이후 모든 작업): 테마 토큰만 사용.**

- 모든 컴포넌트는 `src/theme` 의 토큰을 import 해서 쓴다.
- **색/폰트크기/간격/라운드 값 하드코딩 금지.** (`#3478f6`, `padding: 16`, `fontSize: 18` 같은 리터럴 금지 → 토큰 참조)
- 새 화면을 만들 때 DESIGN.md 를 다시 열지 말고 `theme` 토큰을 쓴다. DESIGN.md 는 Phase 0에서만 소비된다.

**원칙:**

- **도형 색과 자재 사진이 화면의 주인공이다.** UI 크롬(배경/툴바/패널)은 중립·저채도로 빠져준다. 브랜드 강조색은 액션/포커스 등 소수 지점에만.
- 토큰을 바꿔야 할 일이 생기면 컴포넌트에서 고치지 말고 `theme` 파일에서 고친다(단일 진실 소스).

## 데이터 모델 (이 구조를 임의로 바꾸지 않는다)

```
Project (= 평면도 1개. 실제 건물의 한 층/구역)
 - id, name(편집 가능), createdAt, updatedAt
 - Shape[]

Shape (도형)
 - id, projectId
 - category : 'material' | 'space'
 - type    : material → 'rect' | 'square' | 'L' | 'circle'
             space    → 'door' | 'office' | 'etc'
 - x, y, width, height, rotation, color
 - alias    // 구역 별칭 "A","B" (옵션, 검색 대상)
 - label    // 공간 도형 표시 텍스트: door="문", office="사무실", etc=기본"기타"(편집)
 - Material[]  // category==='material' 일 때만. 0..n. layerOrder 로 정렬

Material (자재)  // 자재 도형에만 속함
 - id, shapeId
 - layerOrder   // 랙 안 층 순서
 - name         // 필수
 - description  // 옵션
 - imageUri     // 옵션. 사용자가 업로드한 이미지를 앱 로컬로 복사한 경로
```

핵심 규칙:

- **"층(Layer)"은 건물 층이 아니라 랙 안에서 자재가 쌓이는 단**이다. = Material 의 layerOrder.
- 건물 층 단위는 **Project** 가 담당한다.
- **칸(Cell)·건물층(Floor)을 별도 엔티티로 두지 않는다.** "한 도형에 여러 자재"는 layer로 표현한다.
- **공간 도형(문/사무실/기타)은 Material 을 갖지 않는다.** 라벨·색만.

## 아키텍처 규칙 (강제)

1. **Repository 패턴 필수.** 컴포넌트는 SQLite를 직접 호출하지 않는다.
   `UI → repository(인터페이스) → LocalDataSource(SQLite)`
2. DB 쿼리는 `src/data/` 안에만 존재. 컴포넌트 내 raw 쿼리 금지.
3. 위 데이터 모델을 `src/types/` 에 TypeScript 타입으로 정의하고 그걸 기준으로 작업한다.
4. 모드(Viewer/Edit/학습)는 같은 데이터를 다르게 "보여줄" 뿐. 모드별로 데이터를 따로 만들지 않는다.

## 코드 컨벤션

- 언어: **TypeScript** (strict)
- 폴더 구조(권장):
    ```
    src/
      app/         # expo-router 화면 (프로젝트 목록 / 상세 캔버스)
      components/   # 재사용 UI
      features/     # shape-editor, material, search, pdf, learning …
      data/         # repository + SQLite datasource + 스키마
      types/        # 도메인 타입
      store/        # zustand
      theme/        # design/DESIGN.md 에서 번역한 토큰 (단일 진실 소스, 하드코딩 대신 여기서 import)
    ```
- 주석/문서는 한국어, 코드 식별자는 영어. 컴포넌트는 작게.

## 작업 방식 (중요)

- **수직 슬라이스로 진행.** PRD의 Phase 순서를 지키고, 한 번에 여러 모드를 만들지 않는다.
- 각 Phase 시작 전 `TODO.md` 갱신, 끝나면 동작 확인 후 커밋.
- 불확실하면 임의 진행하지 말고 질문한다. 특히 **데이터 모델 변경은 반드시 먼저 확인**.
- 패키지 추가 시 이유를 한 줄로 설명.

## 하지 말 것

- iOS/웹 대응 코드
- 인증·서버·클라우드 동기화 (MVP는 전부 로컬)
- 출시/스토어 설정
- 데이터 모델 임의 변경 (특히 Layer/Cell/Project 관계)
- 컴포넌트 내부에서 직접 DB 호출
- 사진을 갤러리 원본 경로로 참조 (반드시 앱 로컬 복사)
- 색/폰트크기/간격/라운드 하드코딩 (반드시 src/theme 토큰 사용)
- DESIGN.md 의 웹 레이아웃 패턴을 그대로 이식
