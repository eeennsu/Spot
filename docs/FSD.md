# FSD 아키텍처 — 이 앱(Expo) 적용판

woka_app(React Native CLI)의 Feature-Sliced Design을 **이 앱(Expo + expo-router + 로컬 SQLite, 서버 없음)** 에 맞게 치환한 버전이다.
레이어 철학·단방향 의존·"어디에 둘까" 판단은 원본을 그대로 따른다. 스택 전제만 우리 것으로 바꿨다.

## 원본과의 차이 (우리 스택 치환)

| 원본 FSD 전제                                           | 이 앱에서는                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| react-navigation + `navigators/` + ParamList            | **expo-router (`app/` 파일 기반 라우팅).** `navigators/` 레이어 제거     |
| `screens/` 가 라우트 진입점                             | **`app/` 가 라우트 진입점.** (screens 역할을 app/ 가 흡수)               |
| 서버 API: `features/<d>/apis/` + axios + TanStack Query | **로컬 SQLite: `features/<d>/repositories/`.** axios·TanStack Query 없음 |
| Tamagui                                                 | 우리 DS/`theme` 토큰 (`DESIGN.md` + `DESIGN-expo.md` 번역본)             |
| pnpm 강제                                               | **pnpm 강제 (동일).** npm·yarn·npx 금지, 일회성은 `pnpm dlx`             |

## 레이어 구조

```
src/
├── shared/      도메인 0 의존 공용 — utils·hooks·components·theme·전역 store·db(인프라)
├── entities/    도메인별 "타입·상수·zod 스키마"만. 로직·UI 금지
├── features/    도메인 단위 동작 — repositories/ hooks/ libs/ stores/ contexts/ ui/
├── widgets/     여러 feature 합성 재사용 블록
└── app/         expo-router 라우트 진입점 (원본의 screens/ + navigators/ 역할)
```

**의존성은 한 방향. 역방향 절대 금지:**

```
shared → entities → features → widgets → app
 (안쪽) ─────────────────────────────▶ (바깥쪽)
```

- 안쪽은 바깥쪽을 import 하지 않는다. 둘 곳이 모호하면 **항상 더 안쪽**.
- `entities` = 명사(데이터 모양), `features` = 동사(데이터로 하는 일).

## 레이어별 규칙

### shared/ — 도메인 0 의존

도메인 의존이 한 줄이라도 보이면 즉시 `features/<domain>/`로 이동.

| 폴더                                         | 역할                                                                              |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| `components/commons/`                        | RN/라이브러리 1차 래핑. 전역 빌딩블록                                             |
| `components/customs/`                        | `commons/` 조합 합성 (UX 결정 포함)                                               |
| `db/`                                        | **SQLite 인프라 (도메인 0 의존): 연결, 테이블 생성, 마이그레이션, 트랜잭션 헬퍼** |
| `hooks/`                                     | 도메인 0 의존 + 2개 이상 feature 재사용                                           |
| `stores/`                                    | 전역 Zustand (`camelCase.ts`, Store 접미사 없음)                                  |
| `utils/`                                     | `util_*.ts`                                                                       |
| `theme/`                                     | `DESIGN.md` + `DESIGN-expo.md` 번역 토큰 (색·타이포·spacing·radius·motion·elevation). 단일 진실 소스 |
| `consts/` `contracts/` `typings/` `locales/` | 전역 상수·zod·타입·i18n                                                           |

- 컴포넌트는 `commons/`(1차 래핑) → `customs/`(조합) 2단 계층. 모두 `<Name>/index.tsx` 폴더 형태.
- 로컬 이미지 표시 래퍼는 `shared/components/` 에 둔다(이 앱은 사진이 전부 로컬).

### entities/<domain>/ — 타입·상수·스키마만

허용 파일 3개뿐. `repositories/`·`hooks/` 폴더 만들면 안 됨.

| 파일           | 필수     | 내용                                       |
| -------------- | -------- | ------------------------------------------ |
| `types.ts`     | ✅       | `I<Domain><Name>` 인터페이스·DTO·enum 대용 |
| `consts.ts`    | ✅       | 테이블명·쿼리키(필요 시)·도메인 결합 상수  |
| `contracts.ts` | optional | zod 스키마 (입력 검증 필요 시)             |

- 도메인 예: `project`, `shape`, `material`.
- `enum` 대신 `as const` 객체 + 유니온 추출.
- `entities`는 `shared/`만 import.

```ts
// entities/shape/types.ts
export type IShapeCategory = 'material' | 'space'
export type IShapeMaterialType = 'rect' | 'square' | 'L' | 'circle'
export type IShapeSpaceType = 'door' | 'office' | 'etc'
export interface IShape {
    id: string
    projectId: string
    category: IShapeCategory
    type: IShapeMaterialType | IShapeSpaceType
    x: number
    y: number
    width: number
    height: number
    rotation: number
    color: string
    alias?: string
    label?: string
}
```

```ts
// entities/shape/consts.ts
export const SHAPE_TABLE = 'shapes' as const
export const SHAPE_MIN_SIZE = 40 as const // dp
```

### features/<domain>/ — 도메인 동작 (데이터 접근 = repository)

| 폴더                        | 역할                                                                   |
| --------------------------- | ---------------------------------------------------------------------- |
| `repositories/`             | **SQLite 접근. 도메인별 쿼리. 1파일 1관심사 + default export**         |
| `hooks/`                    | repository 호출 훅. `use<Domain><Action>` (Query/Mutation 접미사 없음) |
| `libs/`                     | row↔도메인 객체 변환 등 순수 함수 (`mapRow*.ts`)                       |
| `stores/` `contexts/` `ui/` | feature 내부 Zustand·Context·전용 컴포넌트                             |

- **repository 인터페이스는 `entities` 또는 feature 내부에 타입으로 정의**하고, 구현은 `repositories/`. 컴포넌트는 repository를 직접 import 하지 않고 `hooks/` 경유.
- **`repositories/` 는 SQLite 에 직접 접근한다. 별도 LocalDataSource 레이어는 없다.**
- DB 연결/마이그레이션 같은 인프라는 여기 두지 않는다 → `shared/db/`.
- **도메인 결합 store 는 `shared/stores/` 가 아니라 `features/<domain>/stores/` 에 둔다.** (예: project store 가 projectRepository 를 호출하면 `features/project/stores/` 에 위치해야 한다. `shared/stores/` 에는 도메인 의존 없는 전역 상태만.)
- 한 화면에서만 쓰는 컴포넌트도 `features/<domain>/ui/`. 2개 이상 feature 반복 시 `shared/`로 승격.

```ts
// features/shape/repositories/save_shape.ts — default export
import { getDb } from '@shared/db'
import { SHAPE_TABLE } from '@entities/shape/consts'
import type { IShape } from '@entities/shape/types'

export default async function repoShapeSave(shape: IShape): Promise<void> {
    const db = getDb()
    await db.runAsync(
        `INSERT OR REPLACE INTO ${SHAPE_TABLE} (...) VALUES (...)`,
        [
            /* ... */
        ],
    )
}
```

```ts
// features/shape/hooks/useShapeSave.ts
import repoShapeSave from '@features/shape/repositories/save_shape'
export function useShapeSave() {
    return async (shape: IShape) => {
        await repoShapeSave(shape) /* + 상태 갱신 */
    }
}
```

### widgets/ — feature 합성 블록

2개 이상 feature/route에서 실제 재사용될 때만. 단일 종속이면 `features/<domain>/ui/`로. `app/` import 금지.
예: 캔버스 셸, 공통 헤더, 바텀시트 셸.

### app/ — expo-router 라우트 진입점 (원본 screens/ + navigators/ 대체)

- **파일 구조가 곧 라우팅.** 예: `app/index.tsx`(프로젝트 목록), `app/project/[id].tsx`(상세 캔버스).
- **데이터 직접 접근 금지** — 반드시 `features/<domain>/hooks/` 경유 (repository·SQLite 직접 호출 금지).
- 네비게이션은 expo-router(`useRouter`, `Link`, `useLocalSearchParams`). ParamList/`useTypedNavigation` 방식은 쓰지 않는다.
- **Entry/Body 분리(무거운 화면 jank 방지)**: 라우트 파일은 헤더·skeleton 즉시 렌더, 무거운 데이터/트리는 `setImmediate` 후 하위 Content 컴포넌트로. 예: 상세 캔버스는 `[id].tsx`(셸) + `ProjectCanvasContent.tsx`(heavy).

## 작명 컨벤션

| 대상                   | 규칙                                                       | 예시                              |
| ---------------------- | ---------------------------------------------------------- | --------------------------------- |
| entity 타입            | `I<Domain><Name>`                                          | `IShape`, `IMaterial`             |
| 테이블 상수            | `<DOMAIN>_TABLE` (`as const`)                              | `SHAPE_TABLE`                     |
| repository 파일 / 함수 | `snake_case.ts` / `repo<Domain><Verb><Resource>` (default) | `save_shape.ts` / `repoShapeSave` |
| 훅                     | `use<Domain><Action>` (접미사 없음)                        | `useShapeSave`                    |
| 변환 순수함수          | `mapRow*.ts` / `mapRowToShape`                             | `map_row.ts`                      |
| Context                | `XxxContext.tsx` / `use<Xxx>Context`                       | `EditorContext`                   |
| 전역 store             | `camelCase.ts` (Store 접미사 없음)                         | `editor.ts`                       |
| util                   | `util_*.ts`                                                | `util_id.ts`                      |
| 컴포넌트               | `<Name>/index.tsx`                                         | `ShapeItem/index.tsx`             |
| 라우트                 | expo-router 파일 규칙                                      | `app/project/[id].tsx`            |

import alias는 `tsconfig.json` paths로 고정: `@shared/*`·`@entities/*`·`@features/*`·`@widgets/*`. `shared/`는 하위 폴더별 alias(`@shared/db`·`@shared/theme` 등)로 노출.

## "어디에 둘까?" 판단

```
도메인 의존?
├─ 아니오 → shared/ (DB인프라→db · 1차래핑→components/commons · 조합→components/customs · 토큰→theme)
└─ 예 ┬ 타입·상수·스키마 → entities/<domain>/
      ├ SQLite 쿼리·훅·상태·UI(동작) → features/<domain>/
      ├ 2+ feature 합성 재사용 → widgets/
      └ 라우트 진입점 → app/
```

## 금지 (PR 차단)

- ❌ 역방향 의존 (`entities`→`features`, `features`→`app` 등) — 단방향 `shared→entities→features→widgets→app` 절대 준수
- ❌ `entities/`에 `repositories/`·`hooks/` 폴더, 로직·UI
- ❌ `shared/`에 도메인 결합 코드 (DB 인프라는 OK, 도메인 쿼리는 ❌, 도메인 store 는 ❌ → `features/<domain>/stores/`)
- ❌ repository 함수 named export
- ❌ `app/`(라우트)·widget 에서 SQLite/repository 직접 호출 (반드시 hooks 경유)
- ❌ 테이블명·상수 하드코딩 (entities/<domain>/consts 참조)
- ❌ 단일 feature 종속 컴포넌트를 `widgets/`에
- ❌ react-navigation `navigators/`·ParamList 방식 (expo-router 사용)
- ❌ `npm`·`yarn`·`npx` (pnpm 고정, 일회성은 `pnpm dlx`)
- ❌ Floor·Cell 엔티티 추가 (데이터 모델은 Project→Shape→Material 고정, 상세는 docs/PRD.md §3)
