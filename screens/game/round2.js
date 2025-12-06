// Round 2

// 2라운드: 7번(맨 오른쪽) 좌석 인덱스
const targetSeatIndex = 6;

// 2라운드 결과 상태
let round2Finished = false;
let round2Result = null; // "success" 등


function startRound2() {
  // 2라운드는 좌석씬을 쓰는 새로운 단계
  stage = 3;                // 🔥 stage 3 = 2라운드 좌석씬
  isStationImgActive = false;

  // 1라운드에서 쓰던 상태들 초기화
  highlightedNpcIndex = -1;
  selectedNpcIndex = -1;

  isPlayerAutoMovingToSeat = false;
  playerTargetX = null;

  // 플레이어를 좌석보다 왼쪽에서 출발
  x = startX - 200;
  y = backgr ? backgr.height - 80 : groundY;
  playerDir = "right";  

  // 속도 초기화
  speed = round2BaseSpeed

  // 결과 초기화
  isNpc2Standing = false;
  npc2StandTriggerTime = null;
  npc2WalkStartTime = null;
  npc2HasLeftScreen = false;
  npc2SeatChosen = false;

 resultOverlayType = null;
  resultOverlayStartTime = null;


  round2Finished = false;
  round2Result = null;

  console.log("=== ROUND 2 (stage 3) START ===");
}

// 속도 버프
// 🔥 Round2 전용 속도 설정 
const round2BaseSpeed   = 0.3;    // 0에서 시작해서 클릭 안 하면 멈춰있는 느낌
const round2BoostAmount = 0.8;  // 클릭 한 번당 얼마나 빨라질지
const round2MaxSpeed    = 5;

function boostSpeed() {
  // 2라운드 좌석씬(stage 3)에서만 동작
  if (stage !== 3 || round2Finished) return;

 // 🔹 클릭할 때마다 속도 증가
  speed += round2BoostAmount;
  if (speed > round2MaxSpeed) speed = round2MaxSpeed;

  print("현재 속도:", speed);

  // 🔹 일정 시간 뒤에 속도 조금씩 다시 줄어들기
  setTimeout(() => {
    speed -= round2BoostAmount;

    if (speed < round2BaseSpeed) speed = round2BaseSpeed;

    print("복귀 이후 속도:", speed);
  }, 400);
}


function drawRound2Arrow(worldMouseX, worldMouseY, npcBottomWorldY) {
  if (stage !== 3 || !sitArrowImg) return;

  const seatX = npcPositions[targetSeatIndex].x;
  const seatY = npcBottomWorldY;

  // 화살표 크기 조절
  const desiredWidth = 350;   // 대충 보기 좋은 사이즈, 필요하면 바꿔
  const scale = desiredWidth / sitArrowImg.width;
  const w = sitArrowImg.width * scale;
  const h = sitArrowImg.height * scale;

  // 좌표: 7번 자리 위쪽
  const drawX = seatX - w / 2;
  const drawY = seatY - h - 150;   // 좌석에서 40px 위 (조절 가능)

  // hover 체크
  isTargetArrowHovered =
    worldMouseX >= drawX && worldMouseX <= drawX + w &&
    worldMouseY >= drawY && worldMouseY <= drawY + h;

  // 나중에 필요하면 쓰려고 좌표 저장도 해두자
  targetArrowRect = { x: drawX, y: drawY, w, h };

  image(sitArrowImg, drawX, drawY, w, h);
}