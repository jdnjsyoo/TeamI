# 🎮 NPC & 지하철 자리 시스템 문서

본 문서는 지하철 게임 내 NPC 구성 및 자리 배치 규칙을 정리한 문서입니다.

---

## 🏙️ 지하철역 구성

NPC는 아래 지하철역 중 하나를 `station`으로 가진다:

`["강남", "강변", "서울대입구", "성수", "서울대입구", "시청", "을지로", "잠실", "홍대"]`

각 NPC Character 이미지 파일은 아래 경로에 저장되어 있다:

`/assets/npcChracter`

NPC는 다음 세 가지 타입의 이미지를 가진다:

| 이미지 타입 | 설명 | 경로 |
|------------|------|------|
| **sitting** | 앉아있는 모션 (2~3 프레임) | `/assets/npcChracter/sitting/{station}_{spec}_{motionNumber}` |
| **hint** | 힌트 제공 모션 | `/assets/npcChracter/hint/{station}_{spec}_힌트` |
| **standing** | 서 있는 모션 | `/assets/npcChracter/standing/{station}_{spec}_스탠딩` |

### 예시 📌
강남_직장인 NPC:

| 상태 | 사용 파일명 |
|------|------------|
| sitting | `강남_직장인_1`, `강남_직장인_2` |
| hint | `강남_직장인_힌트` |
| standing | `강남_직장인_스탠딩` |

---

## 💺 지하철 자리 배치 규칙

- 지하철에는 총 **7개의 자리**가 존재한다.
- 각 자리에 NPC **1명씩 랜덤 배치**
- NPC의 등장 순서 및 자리 배치도 모두 랜덤

하지만 아래 규칙을 지킨다:

1. 한 판에 등장하는 7명의 NPC는 **모두 다른 `{station}`**을 가진다.
2. NPC 중 **1명은**
   - `npc.station === currentStationName`
   - 이 NPC가 **정답 NPC**
3. 나머지 6명은 모두 다른 역을 가진 **오답 NPC**

---

## 🔁 Round 진행 중 NPC 모션 규칙

| NPC 유형 | 표시 모션 |
|--------|----------|
| **정답 NPC** | sitting(2~3) ↔ hint 반복 |
| **오답 NPC** | sitting(2~3)만 반복 |

### 예시 📌
정답 NPC:
`강남_직장인_1 → 강남_직장인_2 → 강남_직장인_힌트 → 반복`

오답 NPC:
`강남_직장인_1 ↔ 강남_직장인_2 반복`

---

## 🪑 NPC 선택 후 동작

사용자가 `sit_here` 버튼을 클릭 시:

1. NPC는 **standing 이미지**로 변경*(현재 로직은 구현되어 있음. npc만 맞춰주면 됨)* 
   → `/assets/npcChracter/standing/{station}_{spec}_스탠딩`
2. 자리에서 일어나 **화면 밖으로 이동**
3. 좌석 비움 처리 및 후속 작업 진행  
   *(관련 코드 구현 완료)*

---

## ✔ 요약

| 항목 | 내용 |
|------|------|
| NPC 수 | 매 판 7명 |
| station 중복 | 없음 |
| 정답 NPC | currentStationName과 동일한 station |
| 오답 NPC | 다른 station 6개 |
| 모션 차이 | 정답: hint 포함 / 오답: sitting만 |


