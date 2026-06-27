# CLAUDE.md

> 이 문서는 Claude Code가 매 세션 시작 시 반드시 참조하는 프로젝트 규칙이다.
> 작업 전 항상 이 문서와 `docs/PRD.md`, `docs/FSD.md`, `docs/UIUX.md`, `docs/PHASE_WORKFLOW.md`, `DESIGN.md`, `DESIGN-expo.md`, `TODO.md` 를 먼저 읽는다.

## 프로젝트 개요

평면도 위에 도형(랙·공간)을 배치하고, 자재 도형에는 자재를 **층(layer)으로 쌓아** 등록·열람·검색·학습·PDF 출력하는 도구형 앱이다.

- **성격**: 개인 MVP, **출시 안 함**, **Android 전용**
- **모드**: 단일 화면에서 Viewer(기본) ↔ Edit 토글. 별도로 학습 모드.

## 기술 스택 (확정)

- **Expo** (최신 SDK, **New Architecture 기본 활성화**), `expo prebuild` + **dev client** 기반 (Expo Go 아님)
- **네비게이션**: expo-router (파일 기반, `app/`). react-navigation `navigators/`·ParamList 방식 금지
- **패키지 매니저**: **pnpm 고정** (npm·yarn·npx 금지, 일회성은 `pnpm dlx`)
- **폴더 구조**: Feature-Sliced Design. 상세는 `docs/FSD.md` 강제 준수
- **제스처/애니메이션**: react-native-gesture-handler + react-native-reanimated (드래그·리사이즈, UI 스레드 처리)
- **도형 렌더링**: react-native-svg 또는 absolute View (Phase 1에서 결정)
- **로컬 DB**: expo-sqlite
- **이미지**: expo-image-picker(선택) + expo-file-system(앱 로컬 복사, DB엔 경로만)
- **상태 관리**: zustand (전역 UI 상태만, 영속 데이터는 DB)
- **PDF**: react-native-view-shot 캡처 → expo-print HTML 삽입
- **UI 토큰**: `DESIGN.md` + `DESIGN-expo.md` 기반. 상세 규칙은 아래 "디자인 시스템 규칙" 섹션을 강제로 따른다.

> ⚠️ Android 전용. iOS 분기/설정 코드 금지.

## UI/UX 원칙 (상세는 docs/UIUX.md 강제 준수)

- **목표: 사용성 우선 + 부드러운 UX (토스처럼).** 깔끔하되 차갑지 않고, 흐름이 매끄럽고 손에 붙게.
- 딱딱함과 화려함 사이를 잡는다: 정보는 깔끔히 정리하되 **전환·피드백을 부드럽게**. 장식이 아니라 "흐름"에 공들인다.
- 모션은 의미 있는 전환(화면/시트/모드 전환, 선택)에 짧고 부드럽게(ease-out, 150~300ms). 누르면 즉각 피드백. 부드러움 ≠ 느림.
- 주요 동작은 한두 탭, 터치 타겟 44dp+, 빈 상태/로딩/에러는 친절하게. 색·여백·라운드·모션은 @shared/theme 토큰으로 일관되게.
- 판단 기준: **"멋있나?"가 아니라 "쓰기 쉬운가? 흐름이 매끄럽고 기분 좋은가?"**

> 세부 지침·체크리스트는 `docs/UIUX.md`. UI 작업 시 반드시 참조한다.

## 디자인 시스템 규칙 (강제 — "참고"가 아니라 규칙이다)

출처: `DESIGN.md` (프레임워크 중립 스펙) + `DESIGN-expo.md` (RN 토큰·코드). 둘 다 repo 루트. 영감 원천은 **Things 3 iOS** — 순백 캔버스(#FFFFFF), 블루(#4F97FF), today 옐로(#FFD60A), 넉넉한 여백, flat·soft spring 느낌.

**1단계 (Phase 0에서 1회): DESIGN.md + DESIGN-expo.md → 테마 파일로 번역.**

- `src/shared/theme/` 에 토큰을 RN 상수로 옮긴다: `colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts` (또는 통합 `tokens.ts`).
- 색은 hex 그대로. spacing/radius 는 px 숫자를 dp 숫자로. 폰트: SF Pro → **Inter** 대체(Android 전용이므로 Inter 직접 사용, `Platform.select`·iOS 분기 코드 금지). Inter 굵기 400/600/700. 매핑한 원본↔대체를 주석으로 남긴다.
- **토큰만 옮긴다.** Things 고유 레이아웃·컴포넌트(사이드바·Magic-Plus·체크박스 To-Do row·When picker 등)는 이식하지 않는다. 색·타이포·spacing·radius·motion·elevation **토큰만** 가져와 우리 도구앱(평면도)에 입힌다.

**2단계 (이후 모든 작업): 테마 토큰만 사용.**

- 모든 컴포넌트는 `@shared/theme` 의 토큰을 import 해서 쓴다.
- **색/폰트크기/간격/라운드 값 하드코딩 금지.** (`#4F97FF`, `padding: 16`, `fontSize: 18` 같은 리터럴 금지 → 토큰 참조)
- 새 화면을 만들 때 DESIGN.md·DESIGN-expo.md 를 다시 열지 말고 `@shared/theme` 토큰을 쓴다. 두 파일은 Phase 0에서만 소비된다.

**원칙:**

- **도형 색과 자재 사진이 화면의 주인공이다.** UI 크롬(배경/툴바/패널)은 중립·저채도(흰 방)로 빠져준다. 브랜드 강조색은 액션/포커스 등 소수 지점에만.
- 토큰을 바꿔야 할 일이 생기면 컴포넌트에서 고치지 말고 `theme` 파일에서 고친다(단일 진실 소스).

## 데이터 모델 (이 구조를 임의로 바꾸지 않는다)

> 정식 정의는 `docs/PRD.md §3` 참조. 여기는 핵심 요약만.

구조: **Project → Shape(projectId) → Material(shapeId)**

- `Project`: 평면도 1개(건물 한 층/구역). id·name·createdAt·updatedAt.
- `Shape`: category(`'material'|'space'`), type, x/y/width/height/rotation/color, alias?(검색 대상), label?(공간 도형 텍스트).
- `Material`: 자재 도형에만 속함. shapeId, layerOrder(랙 안 층 순서), name(필수), description?, imageUri?.

핵심 규칙:

- **"층(Layer)"은 건물 층이 아니라 랙 안에서 자재가 쌓이는 단**이다. = Material 의 layerOrder.
- 건물 층 단위는 **Project** 가 담당한다.
- **칸(Cell)·건물층(Floor)을 별도 엔티티로 두지 않는다.** "한 도형에 여러 자재"는 layer로 표현한다.
- **공간 도형(문/사무실/기타)은 Material 을 갖지 않는다.** 라벨·색만.

## 아키텍처 규칙 (강제 — FSD)

폴더 구조는 Feature-Sliced Design을 따른다. 전체 규칙·예시는 `docs/FSD.md`. 핵심만 여기 박는다.

**레이어 & 단방향 의존 (역방향 금지)**

```
shared → entities → features → widgets → app
 (안쪽) ─────────────────────────────▶ (바깥쪽)
```

- `shared/` 도메인 0 의존 (DB 인프라·theme·공용 컴포넌트·전역 store)
- `entities/<domain>/` 타입·상수·zod 만 (project/shape/material). 로직·UI 금지
- `features/<domain>/` 도메인 동작: **repositories/**(SQLite 쿼리)·hooks/·libs/·stores/·ui/
- `widgets/` 2+ feature 합성 블록
- `app/` expo-router 라우트 진입점
- 둘 곳이 모호하면 항상 더 안쪽 레이어.

**데이터 접근 (이 앱은 서버 없음 = SQLite)**

1. DB 연결·테이블 생성·마이그레이션 등 **인프라는 `shared/db/`** (도메인 0 의존).
2. **도메인별 쿼리는 `features/<domain>/repositories/`** (1파일 1관심사, default export).
3. **라우트(`app/`)·widget·컴포넌트는 SQLite/repository를 직접 호출하지 않는다.** 반드시 `features/<domain>/hooks/` 경유.
4. 도메인 타입·테이블명·상수는 `entities/<domain>/` 에 정의하고 참조(하드코딩 금지).

**그 외**

- 데이터 모델(위 "데이터 모델" 섹션)을 임의로 바꾸지 않는다. 변경 필요 시 먼저 보고.
- 모드(Viewer/Edit/학습)는 같은 데이터를 다르게 보여줄 뿐. 모드별 데이터 분리 금지.

## 코드 컨벤션

- 언어: **TypeScript** (strict)
- 폴더 구조 (FSD — 상세는 docs/FSD.md):
    ```
    src/
      shared/      # 도메인 0 의존: db(인프라)·theme·components·hooks·stores·utils
      entities/    # 도메인 타입·상수·zod (project/shape/material)
      features/    # 도메인 동작: repositories(SQLite)·hooks·libs·stores·ui
      widgets/     # 2+ feature 합성 블록
      app/         # expo-router 라우트 진입점 (목록/상세 캔버스)
    ```
- import alias는 tsconfig paths 고정: @shared/_ · @entities/_ · @features/_ · @widgets/_
- 주석/문서는 한국어, 코드 식별자는 영어. 컴포넌트는 작게.

## 작업 방식 (중요)

- **Phase 진행은 `docs/PHASE_WORKFLOW.md` 를 따른다.** 사용자가 "Phase N 진행해" 또는 "남은 Phase 다 자동으로 해줘" 라고 하면, 그 문서의 절차(설계→구현→검토 자율 수행, 지킬 규칙, 멈춰서 물어볼 예외)를 적용한다. Phase별 구체 범위·완료 기준은 docs/PRD.md 의 해당 Phase에서 읽는다.

- **수직 슬라이스로 진행.** PRD의 Phase 순서를 지키고, 한 번에 여러 모드를 만들지 않는다.
- 각 Phase 시작 전 `TODO.md` 갱신, 끝나면 동작 확인 후 커밋.
- 불확실하면 임의 진행하지 말고 질문한다. 특히 **데이터 모델 변경은 반드시 먼저 확인**.
- 패키지 추가 시 이유를 한 줄로 설명.

## 하지 말 것

- iOS/웹 대응 코드
- 인증·서버·클라우드 동기화 (MVP는 전부 로컬)
- 출시/스토어 설정
- 데이터 모델 임의 변경 (특히 Layer/Cell/Project 관계)
- 컴포넌트/라우트(app)/widget 에서 SQLite·repository 직접 호출 (반드시 features/<domain>/hooks 경유)
- FSD 역방향 의존 (entities→features, features→app 등)
- shared/ 에 도메인 결합 코드 (DB 인프라는 OK, 도메인 쿼리는 features/)
- npm·yarn·npx 사용 (pnpm 고정)
- 사진을 갤러리 원본 경로로 참조 (반드시 앱 로컬 복사)
- 색/폰트크기/간격/라운드 하드코딩 (반드시 @shared/theme 토큰 사용)
- Things 3 고유 레이아웃·컴포넌트(사이드바·Magic-Plus 등)를 그대로 이식 (토큰만 가져온다)
