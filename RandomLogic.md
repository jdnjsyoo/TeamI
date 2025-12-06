## 지하철역 구성
지하철역은 ["강남", "강변", "서울대입구", "성수", "시청", "을지로", "잠실", "홍대"]로 구성되어 있다.
각 지하철역에 해당하는 npcCharacter들은 /assets/npcChracter에 있다.
각 npcCharacter에 대한 이미지은 sitting(2~3개), hint, standing으로 구성되어 있다.
- sitting: /assets/npcChracter/sitting 폴더에 '{station}_{spec}_{motionNumber}'의 구조로 저장되어 있다. 게임이 진행되는 동안 앉아있는 상태의 npc는 {motionNumber}을 번갈아가며 나타나게 된다. 예를 들어, 강남_직장인 npc는 강남_직장인_1과 강남_직장인_2이 번갈아가며 화면에 나타난다.
- hint: /assets/npcChracter/hint 폴더에 '{station}_{spec}_힌트'의 구조로 저장되어 있다.
- standing: /assets/npcChracter/hint 폴더에 '{station}_{spec}_스탠딩'의 구조로 저장되어 있다


## 지하철 자리 배치
지하철에는 총 7개의 자리가 있다. 각 자리에 npc character 1명이 앉아있다. 각 자리에 앉는 npc character은 랜덤으로 선택된다. 또한 npc가 앉는 자리도 랜덤으로 배치된다. 단, 다음과 같은 규칙을 따른다.
- 한 판에 랜덤으로 정해지는 7명의 npc는 각기 다른 {station}을 가지고 있다.
- 한명의 npc는 {station}이 currentStationName(/screens/game/state.js)이다. 해당 npc는 해당 판의 정답 npc가 된다. 
- 나머지 6명의 npc는 currentStationName이 아닌 다른 지하철역을 {station}으로 가진다.

## 게임이 진행되는 동안
round가 진행되는 동안 각각의 npc들은 sitting 모션을 반복한다.
- 정답 npc(1인): /assets/npcChracter/sitting 폴더의 해당 npc에 대한 이미지(2~3)와 /assets/npcChracter/hint 폴더의 해당 npc에 대한 이미지를 번갈아 나타나게 한다. 예를 들어, 강남_직장인 npc는 강남_직장인_1, 강남_직장인_2, 강남_직장인_힌트가 번갈아가며 화면에 나타난다.
- 오답 npc(6인): /assets/npcChracter/sitting 폴더의 해당 npc에 대한 이미지(2~3)를 번갈아 나타나게 한다. 예를 들어, 강남_직장인 npc는 강남_직장인_1과 강남_직장인_2이 번갈아가며 화면에 나타난다.