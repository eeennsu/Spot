# Phase 진행 워크플로 (연속 자동 모드 — 실험용)

> ⚠️ 실험 모드: 사용자 확인 없이 **Phase 1부터 7까지 연속으로** 설계→구현→검토를 자동 수행하고, 한 Phase가 끝나면 **스스로 다음 Phase로 넘어간다.** 중간 게이트가 없어 완성도는 단계별 확인보다 낮을 수 있다. "초안/실험" 목적으로 사용한다.

> ⚙️ **OMC 의존 명시 + 폴백**: 이 워크플로는 OMC(autopilot·ralph·team·ultraqa·code-review)에 의존한다. OMC 미설치 시 폴백 — 일반 프롬프트로 1) 설계 2) 구현 3) **별도 세션/컨텍스트**로 수동 검토 분리.

---

## 사용자가 "남은 Phase 다 자동으로 해줘" 라고 하면

`docs/PRD.md` 의 Phase 로드맵을 순서대로, **현재 미완료 Phase부터 마지막 Phase까지 연속으로** 자동 수행한다.

### 시작 시 1회

1. `CLAUDE.md`, `docs/PRD.md`, `docs/FSD.md`, `docs/UIUX.md`, `docs/PHASE_WORKFLOW.md`, `DESIGN.md`, `DESIGN-expo.md`, `TODO.md` 를 읽는다.
2. `TODO.md` 가 없으면 PRD 로드맵 기반으로 생성한다.
3. 기존 산출물을 점검해 **어느 Phase부터 시작할지** 판단하고, 그 지점부터 진행한다.

### 각 Phase 루프 (Phase 끝날 때마다 자동 반복)

1. **설계 (planner/critic)**: 해당 Phase 계획 — FSD 레이어 배치 + 데이터 흐름(app→hooks→repository) + 핵심 기술 결정 + UI/UX 적용 지점.
2. **구현 (executor/designer)**: 계획대로 구현. UI 비중 큰 부분은 designer 활용.
3. **검토 — 별도 컨텍스트 필수 (self-approve 금지)**

    구현한 컨텍스트가 스스로 완료를 승인하지 않는다. 반드시 **별도 컨텍스트의 code-reviewer + verifier** 가 아래 체크리스트를 통과한 뒤에만 커밋한다.

    **검증 게이트 체크리스트 (모두 통과해야 커밋)**
    - [ ] (a) 데이터 모델 일치 — Floor·Cell 엔티티 없음, layerOrder 유지, Project→Shape→Material 구조 준수 (`docs/PRD.md §3` 기준)
    - [ ] (b) FSD 레이어·역방향 의존 없음 — `shared→entities→features→widgets→app` 단방향 준수, repository 직접 호출 없음(hooks 경유), 도메인 store 가 `features/<domain>/stores/` 에 위치
    - [ ] (c) 토큰 하드코딩 없음 — 색·폰트크기·간격·라운드 리터럴 금지, 모두 `@shared/theme` 토큰 참조
    - [ ] (d) pnpm 준수 — npm·yarn·npx 흔적 없음, 패키지 추가 시 이유 한 줄 기록
    - [ ] (e) 완료 기준 충족 — `docs/PRD.md` 해당 Phase 완료 기준 항목 전부 실기기에서 동작 확인

4. **기록**: `TODO.md` 에 해당 Phase 완료 표시 + 변경 요약을 남긴다.
5. **다음 Phase로 자동 진행**: 멈추지 말고 다음 Phase의 1번부터 이어서 수행한다. **모든 Phase가 끝날 때까지 멈추지 않는다.** (ralph 지속 모드처럼 끝까지 간다)

### 전부 끝나면

- Phase 1~7 전체 완료 보고: Phase별 결과 요약 + 완료 기준 충족 여부 + 알려진 이슈 목록.
- `TODO.md` 최종 갱신.

---

## 모든 Phase에서 반드시 지킬 것

- **FSD(`docs/FSD.md`)**: 라우트·컴포넌트는 repository 직접 호출 금지(features/<domain>/hooks 경유), repository는 default export, 역방향 의존 금지, repositories/ 는 SQLite 직접 접근(별도 LocalDataSource 없음).
- **디자인 토큰**: 색·간격·폰트·라운드는 `@shared/theme` 토큰만, 하드코딩 금지.
- **UI/UX(`docs/UIUX.md`)**: 사용성 우선 + 부드러운 UX. 의미 있는 전환에 짧고 부드러운 모션(ease-out 150~300ms), 누르면 즉각 피드백. 빈 상태/로딩/에러 처리, 터치 타겟 44dp+.
- **패키지**: 추가 시 이유 한 줄 설명. pnpm 고정(npm·yarn·npx 금지).

---

## 연속 자동이라도 멈춰서 물어볼 것 (유일한 예외)

- **데이터 모델(Project/Shape/Material 구조)을 바꿔야 할 때** → 자동 진행을 멈추고 사용자에게 묻는다. (이건 잘못 가면 전체가 무너지므로 끝까지 자동화하지 않는다.)
- 그 외 되돌리기 어려운 핵심 기술 결정(예: 도형 SVG vs View)은 **멈추지 말고 자동 결정하되, 선택 이유를 그 Phase 보고에 명시**한다.

---

## 끝난 뒤 (사용자 몫)

전체 자동 실행이라 버그가 누적됐을 수 있다. 사용자는 Phase별로 앱을 점검하고, 문제가 있으면 해당 Phase만 다시 보완 요청한다.

---

## 참고: 통제 모드로 되돌리려면

단계별 확인이 필요해지면, 이 문서의 "다음 Phase로 자동 진행"을 "그 Phase에서 멈춘다"로 바꾸고, 사용자가 Phase마다 확인 후 다음을 지시하는 방식으로 돌아간다.
