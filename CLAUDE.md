# 한눈 플래너 — 작업 안내서 (Claude용)

이 파일은 다음에 이어서 작업할 때도 같은 규칙을 따르기 위한 안내서입니다.

## 사용자
- 코딩을 전혀 모르는 초보자. **쉬운 한국어**로 설명하고, 전문 용어는 풀어서 말한다.
- 친절한 개발 선생님이자 개발자 역할.

## 앱 컨셉
- 이름: **한눈 플래너**
- "일정, 할 일, 메모를 한 화면에서 5초 만에 입력하고 한눈에 보는, 광고 없고 내 폰에만 저장되는 플래너"

## 기술 조건
- React + TypeScript + Vite + Tailwind CSS (v4, `@tailwindcss/vite`)
- 백엔드·로그인 없음. 데이터는 **localStorage**에만 저장
- PWA(manifest, 서비스 워커, 아이콘)로 홈 화면 설치·오프라인 실행 (`vite-plugin-pwa`)
- 스마트폰 세로 화면 기준, 한 손 조작(하단 탭, 큰 버튼), **모든 문구는 한국어**

## 화면 (하단 탭 3개)
1. **오늘**(기본): 맨 위 항상 열린 빠른 입력창(엔터로 추가), 종류 선택(할 일/일정/메모, 기본 할 일),
   오늘의 일정·할 일·메모를 시간순 한 목록으로 통합, 동그라미로 완료(줄 긋기), 밀어서 삭제, 눌러서 수정
   - 오른쪽 위: 🔍 통합 검색(SearchPage), ⚙️ 설정
   - 밀어서 삭제는 공용 블록 `SwipeRow`로 처리 (ItemRow, MemoCard가 사용)
2. **달력**: 월간 달력, 항목 있는 날짜에 점, 날짜 누르면 그날 목록 + 바로 추가
3. **메모**: 제목+내용 메모 목록, 검색, + 버튼으로 새 메모

## 필수 기능
- 추가/수정/삭제/완료, 반복(매일/매주/매월), 중요 표시(별, 맨 위 고정), 통합 검색
- 일정 시간 알림(앱이 열려 있을 때만, 알림 권한은 사용자가 설정에서 켤 때만 요청)
- 다크모드(시스템 따라가기 + 수동 전환) — v1.1 디자인 개편 때 잠시 숨김 (아래 디자인 규칙 참고)

## 신뢰·안전 장치
- 설정에 "백업 내보내기/불러오기"(파일 저장·복원)
- "광고 없고 데이터는 이 기기에만 저장됩니다" 안내
- 삭제 시 3초간 "되돌리기" 안내

## 단순함 규칙
- 버튼·메뉴 최소화. 가입/설명서 없이 켜자마자 입력창
- 광고, 팝업, 유료 기능, 로그인 요구 금지
- 이번 버전 제외: 서버, 로그인, 기기 간 동기화, 공유, 위젯, 습관 트래커

## 디자인 규칙 (v1.1 "조용하지만 기분 좋은 플래너" — 사용자가 정함)
- 색은 `src/index.css`의 색상표에서만 가져오기. Tailwind 기본 색은 꺼 두었음(`--color-*: initial`)
  - 배경 `paper` #FAF8F5 / 카드·입력칸 `card` #FFFFFF / 글자 `ink` #2B2B2B / 보조 `muted` #8A8680 / 선 `line` #ECE8E2
  - 포인트 `sage` #4A7C6F 는 **체크 표시, 주요 버튼, 진행 표시에만**
  - 시간대 배경: 아침(6~11시) #FBF3E6, 낮 #FAF8F5, 저녁(18시~새벽) #EFF1F3 (`useDayPart` → `html[data-daypart]`)
    - 색 값은 index.css 와 index.html(첫 화면용 스크립트) 두 곳에 있음 → 바꿀 때 같이
    - 바뀔 때 1초 페이드(`--daypart-fade`). 처음 열 때는 0초, 첫 화면 뒤 `html.daypart-ready`가 붙으면 1초
    - 미리 보기: 주소에 `?daypart=morning|day|evening` (배경만 바뀜). 평소에는 실제 시간
    - 보조 글자(#8A8680) 대비는 세 배경 모두 3.2~3.4 (흰색에서도 최대 3.6). 사용자가 글자색 유지 결정
- 그림자·그라데이션 금지. 얇은 선과 여백으로 구분
- 글꼴 Pretendard(앱 안에 `public/fonts/` 로 포함, 오프라인 OK). 화면 제목 28px 얇게(font-light), 본문 16px
- 명언(오늘의 한 줄)만 명조체 `font-quote`: 마루부리 Regular(`public/fonts/MaruBuri-Regular.woff2`, OFL) → Noto Serif KR → serif. 기울임 없음
- 오늘의 한 줄: `src/data/quotes.ts` 목록 하나(54개, 위인의 말은 author, 직접 쓴 문구는 author 없음).
  **날짜로만** 하루 하나(`quoteOfDay(date)`, 시간대와 무관). 날짜·진행 표시 아래 15px muted 줄간격 1.6 두 줄까지, 작가 12px "— 이름".
  완료 축하에는 명언 없음(사용자 결정, 산만해서). 설정 "오늘의 한 줄 보기"(settings.showQuote, 기본 켜짐).
  목록 규칙: 아침·밤에만 어울리는 말 금지, 짧게(작은 폰에서도 두 줄 여유), 뜻 겹치는 말은 하나만
- 모서리: 카드 16px(rounded-2xl), 버튼 12px(rounded-xl). 누르는 곳 최소 44px
- 애니메이션 0.2~0.4초, `prefers-reduced-motion`이면 끔
- 특색: 오늘의 한 가지(별 붙인 오늘 할 일 중 첫 번째), 원형 진행 표시 + "오늘도 잘 해냈어요", 체크 펜 긋기·줄 긋기(`.check-path`, `.strike`), 짧은 진동(`haptic`), 다정한 빈 화면 문구
- 수정 창(EditSheet)은 아래로 끌어내리면 닫힘(`useDragToClose`: 120px 이상 또는 손 뗄 때 빠르면 닫기, 내용이 스크롤된 상태면 스크롤 우선)
  - 부드럽게 하려고 끄는 동안 React 상태를 바꾸지 않고 style.transform 을 직접 바꿈(requestAnimationFrame). 곡선 cubic-bezier(0.32,0.72,0,1), 0.3초
- 날짜·시간 칸은 `PickerField`: 글자는 직접 그리고(가운데 정렬) 그 위에 투명한 진짜 date/time 입력칸을 겹침 — 아이폰 기본 칸은 글자가 위로 붙거나 넘침
- 다크 모드: 지금은 숨김(사용자 결정). 다시 켜려면 index.css 에 어두운 색상표 추가 → App 의 `useTheme('light')` 를 `settings.theme` 로 → 설정에 화면 모드 다시 보이기

## 작업 방식 (꼭 지킬 것)
1. 코드 쓰기 전에 계획을 쉬운 말로 보여주고 승인받기
2. 단계별 진행: 1 뼈대+오늘 → 2 달력 → 3 메모+검색 → 4 반복·알림·설정·백업 → 5 PWA+마무리
   - 각 단계 끝나면 직접 실행해서 확인하고, 사용자가 볼 방법을 알려주기
3. 각 단계가 끝날 때마다 git 커밋
4. 오류는 직접 원인을 찾아 고치고, 무엇이 문제였는지 한 줄로 쉽게 설명
5. 프로젝트 폴더 안에서만 작업. 파일 삭제, 폴더 밖 수정, 시스템 설정 변경, 불필요한 패키지 설치는 먼저 물어보기
6. 비밀번호, API 키 등 민감한 정보는 코드에 넣지 않기
7. 마지막에 한국어 README.md(실행 방법, 폰 확인 방법, 무료 배포 방법, 백업 방법)

## 코드 구조
- `src/types.ts` 데이터 모양 / `src/store/` 저장 / `src/utils/` 날짜·반복 계산
- `src/components/` 재사용 블록 / `src/pages/` 화면
- 확인: `npm run dev` 실행 후 Playwright(폰 크기 390×844)로 스크린샷·동작 점검, `npm run build`로 오류 검사

## 설계 메모 (이미 정한 것)
- 설정: `src/store/settings.ts` (theme, notify, lastBackup) — localStorage `hannun-planner:settings`
- 백업 불러오기는 **덮어쓰기가 아니라 합치기**(같은 id면 updatedAt이 더 최근인 쪽). 데이터를 잃지 않게.
- 백업 파일 이름은 영어(`hannun-planner-backup-YYYY-MM-DD.json`) — 한글 이름은 일부 브라우저에서 "download"로 바뀜
- 알림: `useReminders`가 15초마다 확인, 시간 지나고 5분 안이면 알림. 이미 보낸 알림은 `hannun-planner:notified`에 기록.
  권한 요청은 설정에서 스위치를 켤 때만. 앱 안 파란 배너는 권한과 상관없이 표시.
- 반복 항목 완료는 날짜별(`doneDates`), 반복 항목 삭제는 모든 날짜에서 삭제
- 메모 탭에서 쓴 메모도 쓴 날짜의 오늘 목록에 보임 (사용자 확인함)
- 앱을 켤 때 입력칸 자동 선택(autoFocus) 안 함 — 키보드가 바로 올라와서 불편하다고 사용자가 요청. 입력칸을 눌렀을 때만 키보드
- 못 한 일 넘기기(`CarryOverBar`, 오늘 화면 날짜 아래): 오늘 이전 + 안 끝낸 + 반복 아닌 **할 일만**. "어제/지난 날 못 한 일 N개"
  [가져오기]=전부 오늘 날짜로, [✕]=그날만 숨김(localStorage `hannun-planner:carry-dismissed`에 날짜 저장)
- 한국어 한 줄 입력(날짜·시간 알아듣기), 밀어서 "내일로"는 계획만 하고 사용자가 이번엔 빼기로 함
- 휴대폰 캘린더에 추가(`src/utils/ics.ts`): 시간 있는 할 일·일정의 수정 창 버튼. 1시간 길이, 10분 전 알림(VALARM),
  반복은 RRULE(+UNTIL=끝나는 날), 이 날만 삭제한 날은 EXDATE. 시간은 폰 시간대를 따르는 floating time.
  아이폰 Safari는 data: 주소로 열어 바로 "추가" 화면, 그 외(안드로이드·설치 앱)는 .ics 파일 내려받기
- 반복 항목 삭제: 어디서 지우든 `requestDelete(item, day)` → 반복이면 `RepeatDeleteSheet`(이 날만/반복 전체/취소).
  이 날만 = `skipDates`에 날짜 추가. 둘 다 되돌리기 가능. 반복에 `endDate`(끝나는 날, 선택)
- 지운 기록(`src/store/deleted.ts`, localStorage `hannun-planner:deleted`: id→지운 시각). 되돌리기하면 기록에서 뺌.
  백업 불러오기 때 지운 시각보다 예전(updatedAt ≤ 지운 시각) 항목은 다시 넣지 않음
- 백업 안내(`BackupNudge`, 오늘 화면 맨 아래): 마지막 백업 14일 이상 또는 (백업 없음 + 항목 10개 이상).
  [지금 백업] / [✕]=7일 숨김(localStorage `hannun-planner:backup-nudge-until`)
- PWA: `vite-plugin-pwa` (generateSW, autoUpdate). `base: './'`라서 GitHub Pages 하위 주소에서도 동작
  - 아이콘: `public/icons/` (192, 512, maskable-512, apple-touch-icon 180), `public/favicon.svg`
  - 서비스 워커는 `npm run build` 결과물에만 있음 → 오프라인 확인은 `npm run preview`(4173)에서
- 배포: `.github/workflows/deploy.yml` (main에 push → GitHub Pages). README에 Netlify Drop 방법도 있음

## 공개 주소
- GitHub 저장소: https://github.com/sehyun558-spec/hannun-planner (main에 push하면 자동 배포)
- 앱 주소: https://sehyun558-spec.github.io/hannun-planner/
- Pages 설정(Source: GitHub Actions)은 사용자가 직접 켬. Claude 세션에서는 Pages API가 막혀 있음

## 다음에 할 수 있는 것 (아직 안 함, 사용자에게 먼저 물어보기)
- 이번 버전 제외 목록(서버, 로그인, 동기화, 공유, 위젯, 습관 트래커)은 계속 넣지 않기

## 진행 상황
- [x] 1단계 뼈대 + 오늘 화면
- [x] 2단계 달력
- [x] 3단계 메모 + 검색
- [x] 4단계 반복·알림·설정·백업
- [x] 5단계 PWA + 마무리 (v1.0.0)
- [x] 디자인 개편 "특색 있는 미니멀 화이트" (v1.1.0)
- [x] 캘린더 추가·반복 삭제 선택·지운 항목 보호·백업 안내 (v1.2.0)
- [x] 오늘의 한 줄(명언, 마루부리) + 시간대 배경 진하게·미리 보기 (v1.3.0)
- [x] 오늘의 한 줄 단순화: 하루 하나, 목록 하나로, 축하 명언 제거 (v1.3.1)
