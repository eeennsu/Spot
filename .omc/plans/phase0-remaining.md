# Phase 0 — 세팅 & 토대: 현황 점검 + 남은 작업 계획

> 상태: **pending approval** (승인 전 코드 작성 금지)
> 범위: **Phase 0 만**. Phase 1 이후 금지.
> 근거: PRD.md Phase 0, CLAUDE.md(기술스택·데이터모델·아키텍처 규칙).

---

## 1. 현황 점검 (Phase 0 완료 기준 대비)

실제 파일시스템 스캔 결과. 사용자가 생각한 "진행하다 중단"보다 실제 진척은 적음 — **`src/theme/*` 만 존재**, Expo 프로젝트 자체가 없음.

| Phase 0 항목 | 상태 | 근거 |
|---|---|---|
| **프로젝트 세팅** (Expo·TS·New Arch·dev client·prebuild) | ❌ 없음 | `package.json`/`app.json`/`tsconfig`/`babel`/`node_modules`/`android/` 전무 |
| **도메인 타입** (`src/types`) | ❌ 없음 | `src/types/` 자체 없음 |
| **SQLite 스키마** | ❌ 없음 | `src/data/` 없음 |
| **repository 골격 + LocalDataSource** | ❌ 없음 | `src/data/` 없음 |
| **프로젝트 목록 화면 + 네비게이션** | ❌ 없음 | `src/app/` 없음 (expo-router 미설치) |
| **DESIGN.md → `src/theme` 토큰 번역** | ✅ **완료(양호)** | `colors/typography/spacing/radius/elevation/motion + index` 7파일, DESIGN.md 수치와 일치 |
| **git 저장소** | ❌ 없음 | `.git` 없음, 커밋 0 |

### 발견된 불일치 (보고 필요)
- **`TODO.md` 없음** — 읽으라고 지시했으나 파일 부재. Phase 0 산출물로 **신규 생성** 예정.
- **`design/DESIGN.md` 없음** — `DESIGN.md`/`DESIGN-expo.md` 는 **저장소 루트**에 있음. `design/` 폴더 없음. theme 토큰은 이미 루트 `DESIGN.md` 기준으로 번역됨. (이동 필요하면 지시 요망.)

### 이미 된 것 — 다시 만들지 않음
- `src/theme/*` 7파일 (토큰). 단, **Inter 폰트(Inter-Regular/Medium/SemiBold)·Menlo** 를 typography 가 참조 → 앱 부팅 시 `expo-font` 로딩 미연결 상태. 프로젝트 생기면 **로딩만 연결**(토큰 재작성 X).

---

## 2. 남은 작업 계획 (Phase 0 완료까지)

순서 = 의존성 순. 각 묶음 끝나면 동작 확인 → 커밋.

### A. 프로젝트 스캐폴드 (Android 전용)
- 빈 temp 디렉터리에 `create-expo-app`(blank-typescript) 생성 → **설정 파일만** 기존 repo 로 복사. **`src/theme`·`*.md`·`.omc` 절대 덮어쓰지 않음.**
- 추가 파일: `package.json`, `app.json`, `tsconfig.json`(expo base + `strict`), `babel.config.js`(`babel-preset-expo` + **`react-native-reanimated/plugin` 맨 마지막**), `metro.config.js`, `.gitignore`, `assets/`.
- `main`: `expo-router/entry`.
- `app.json`: `newArchEnabled: true`, `scheme`, `android.package`, `plugins: ["expo-router","expo-sqlite"]`, `userInterfaceStyle: "dark"`. **iOS 블록 작성 안 함.**
- `tsconfig` path alias `@/* → src/*`.

### B. 패키지 설치 (`npx expo install` — SDK 호환 버전 고정)
각 한 줄 사유:
- `expo-router`, `react-native-safe-area-context`, `react-native-screens` — 라우팅/네비.
- `react-native-gesture-handler`, `react-native-reanimated` — Phase 1 드래그/리사이즈 토대(루트 `GestureHandlerRootView`·babel 플러그인 지금 구성).
- `react-native-svg` — Phase 1 ㅁ/ㄴ 도형 렌더 토대.
- `expo-sqlite` — 로컬 DB.
- `zustand` — 전역 UI 상태.
- `expo-font` + `@expo-google-fonts/inter` — theme 가 참조하는 Inter 로드.
- `expo-status-bar`, `expo-constants`, `expo-crypto` — 상태바/상수/`randomUUID`(ID).
- `expo-dev-client` — 네이티브 모듈용 dev client.
- `expo-file-system`, `expo-image-picker` — *(PRD Phase 0 명시. Phase 2 전까지 미사용. 설치 여부는 아래 결정 1.)*

### C. 폰트 연결
- `@expo-google-fonts/inter` 의 Inter_400/500/600 → root `_layout` `useFonts` 게이트. Menlo 는 시스템 mono(자산 불요).

### D. 도메인 타입 (`src/types`) — 타입 우선, 전체 데이터 모델
- `project.ts`(Project, Floor), `shape.ts`(Shape, ShapeType `'rect'|'L'`), `material.ts`(Cell, Material), `index.ts` 배럴.
- CLAUDE.md 데이터 모델 그대로. **타입 정의 ≠ 후속 Phase 기능 구현.**

### E. SQLite 스키마 + 마이그레이션 (`src/data/db.ts`, `schema.ts`)
- `openDatabaseSync('myspot.db')`, `user_version` 가드, `CREATE TABLE IF NOT EXISTS` (스키마 범위는 아래 결정 2).
- alias·material.name 인덱스(후속 검색 대비). 앱 시작 시 `migrate()` → "빈 DB 초기화" 충족.

### F. repository 인터페이스 + LocalDataSource 골격 (`src/data`)
- `local/projectLocalDataSource.ts` — 목록 화면용 최소 구현(list/insert/get).
- `local/{shape,material}LocalDataSource.ts` — 시그니처 골격(Phase 1/2 TODO).
- `repositories/projectRepository.ts` — 인터페이스 + 구현(데이터소스 결선).
- `repositories/{shape,material}Repository.ts` — 인터페이스 + 골격 구현.
- **모든 SQL 은 `src/data` 안에만.**

### G. 스토어 (`src/store`) — 최소
- `projectStore.ts`(zustand): `projects[]`, `load()`, `addProject()` — **repository 경유**(SQLite 직접 호출 금지).

### H. 네비게이션 + 프로젝트 목록 화면 (`src/app`)
- `_layout.tsx`: `GestureHandlerRootView`+`SafeAreaProvider` 루트, `useFonts` 게이트, `StatusBar light`, 마운트 시 `migrate()`, `Stack`, 다크 배경.
- `index.tsx`: **ProjectsScreen** — 프로젝트 목록(theme 다크 스타일), "새 프로젝트" 버튼 → `addProject` → 행 추가(쓰기·읽기·초기화 증명). 행 탭 → 상세로 push.
- `project/[id].tsx`: 플레이스홀더("Phase 1: 도형 편집기 예정") — 네비 동작 증명. **도형 편집기 없음(Phase 1).**

### I. 문서/형상관리
- `TODO.md` 신규 생성(Phase 체크리스트), 작업 끝에 갱신.
- `git init` + Phase 단위 커밋(PRD/CLAUDE 규칙). *(커밋은 승인·구현 후.)*

---

## 3. 완료 기준 검증 (PRD: "Android 실행 + 빈 DB 초기화 + 화면 이동")
- `npx tsc --noEmit` 통과(strict).
- `npx expo prebuild -p android` 성공(`android/` 생성).
- `npx expo run:android` → dev client 빌드 → ProjectsScreen 부팅. *(Android 에뮬/기기·SDK 필요 — 결정 3.)*
- DB 파일 생성·`migrate` 실행·프로젝트 추가가 재실행 후 유지(빈 DB 초기화+쓰기).
- 네비: 프로젝트 탭 → 상세 플레이스홀더 → 뒤로.
- grep 게이트: `Platform.OS === 'ios'` 0건; `src/data` 밖 SQL 0건.

---

## 4. 리스크 & 완화
| 리스크 | 완화 |
|---|---|
| temp 스캐폴드 머지 시 기존 파일 덮어씀 | temp 생성 후 **선택 복사**, `src/theme`/`*.md`/`.omc` 미접근, git diff 로 확인 |
| reanimated babel 플러그인 누락/순서 | 구성 + **맨 마지막** 확인 |
| New Arch 네이티브 호환 | `expo install` 이 SDK 호환 버전 고정 |
| Inter 미로딩 → 폰트 폴백 | `@expo-google-fonts/inter` + `useFonts` 게이트 |
| Android 에뮬/SDK 부재 → "실행" 검증 불가 | 스캐폴드/prebuild/tsc 는 무조건 수행, 실행은 환경 확인(결정 3) |

---

## 5. 결정 필요 (구현 착수 전)
1. **file-system + image-picker 설치 시점** — 지금(PRD Phase 0 명시, prebuild 1회) vs Phase 2 로 미룸. (추천: 지금)
2. **DB 스키마 범위** — 전체 모델(project/floor/shape/cell/material) 한 번에 vs Phase 0 최소(project 만). (추천: 전체 — 후속 데이터모델 변경 회피) *[데이터모델 인접 → 확인]*
3. **Android 실행 환경** — 에뮬/기기 있어 내가 빌드·실행 검증 vs 없음(스캐폴드·prebuild·tsc 까지만, 실행은 직접).

---

## 변경 이력
- v1: 현황 점검(theme 만 완료) + Phase 0 잔여 작업 계획 작성.
