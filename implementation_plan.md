# Industrial Mission Control Dashboard 구현 계획서

현장 근로자 100명의 생체 데이터를 실시간으로 모니터링하는 Full HD 최적화 관제 대시보드 구현을 제안합니다.

## User Review Required

> [!IMPORTANT]
> 프로젝트 환경 설정과 관련하여 피드백이 필요합니다.
> 현재 작업 공간(`c:\Works\Web\Safety-Vest`)에 순수 HTML/CSS/JS(Vanilla JS) 기반으로 구축할지, 혹은 React나 Vue 같은 프론트엔드 프레임워크(Vite 사용)를 도입하여 컴포넌트 기반으로 구축할지 결정이 필요합니다. 
> 
> *추천:* 100개의 카드와 실시간 정렬, 차트 렌더링 등 복잡한 상태 관리가 필요하므로 **React (Vite 기반)** 환경을 사용하는 것을 적극 권장합니다.

## Open Questions

> [!WARNING]
> 1. "Click to Detail" 차트 팝업에 들어갈 차트 라이브러리로 어떤 것을 선호하시나요? (예: Recharts, Chart.js, ApexCharts 등. 기본적으로 가볍고 React에 잘 맞는 Recharts를 고려 중입니다.)
> 2. 실제 백엔드 API가 연결되기 전까지, 더미 데이터를 생성하여 실시간 변화(시뮬레이션)를 보여주도록 구현해도 될까요?

## Proposed Changes

### 기술 스택 및 환경 설정 (React + Vite 가정)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (선택사항, 사용자가 순수 CSS를 원하면 Vanilla CSS 모듈 사용) 또는 순수 CSS. *제시된 요구사항에 맞춰 Vanilla CSS로 최대한 세밀하게 제어하거나 Tailwind의 설정 확장을 활용할 수 있습니다. Vanilla CSS 사용을 우선순위로 하겠습니다.*
- **Icons**: Lucide React 또는 FontAwesome (상태 아이콘 등)
- **Charts**: Recharts (팝업 차트용)

### 화면 구조 분할
1. **Header Component (`10vh`)**: 
   - Safety Score 표시 영역
   - 전체 인원 및 상태별(Normal/Warning/Danger) 카운터 표시. 숫자 카운팅 애니메이션 적용.
2. **Main Grid Area Component (`75vw`, `90vh`)**:
   - `display: grid; grid-template-columns: repeat(10, 1fr); grid-template-rows: repeat(10, 1fr);`를 사용하여 스크롤 없는 100개 카드 배치.
   - 갭(Gap) 및 패딩 최소화로 밀집도 높은 하이덴시티 디자인 적용.
   - 위험도에 따른 자동 정렬 로직 및 애니메이션 적용 (Framer Motion 등 활용 혹은 CSS Transition).
3. **Event Sidebar Component (`25vw`, `90vh`)**:
   - 시간 역순으로 실시간 로그가 쌓이는 타임라인 구현.
4. **Worker Card Component**:
   - 컴팩트한 디자인. ID, 이름, HR(심박수), Temp(체온) 표시.
   - 조건에 따른 배경색 및 애니메이션(Blinking) 적용.
5. **Detail Modal Component**:
   - 카드 클릭 시 렌더링되는 모달. 근로자의 지난 1시간 생체 데이터 추이 차트 표시.

## Verification Plan

### 수동 검증 (Manual Verification)
1. 해상도 1920x1080에서 100개의 카드가 스크롤 없이 정확하게 10x10 그리드로 노출되는지 확인합니다.
2. 더미 데이터 발생기(시뮬레이터)를 구동하여, 특정 근로자의 심박수/체온이 위험 범위에 도달했을 때 카드가 빨간색으로 점멸하고 자동으로 그리드의 최상단(좌측 상단)으로 이동하는지 확인합니다.
3. 알림 발생 시 사이드바에 이벤트 로그가 올바른 타임스탬프와 함께 추가되는지 확인합니다.
4. 카드를 클릭했을 때 상세 차트 모달이 정상적으로 나타나는지 테스트합니다.
