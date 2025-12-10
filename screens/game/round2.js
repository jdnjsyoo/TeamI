// Round2용 : 빈자리 1개 + 앉아 있는 NPC 6명
function loadRound2NpcAssets() {
  // 1) npcData를 평탄화해서 모든 NPC 후보 풀 만들기
  let allNpcPool = [];
  for (const station in npcData) {
    const npcs = npcData[station];
    npcs.forEach(info => {
      allNpcPool.push({
        station: station,
        spec: info.spec,
        frameCount: info.frames
      });
    });
  }

  // 2) 섞어서 앞에서 6명만 사용
  shuffle(allNpcPool);
  const chosen = allNpcPool.slice(0, 6);  // 👈 6명

  // 3) 전역 애니메이션 배열 초기화
  npcAnimationFrames = [];
  npcStandImgs = [];  // Round2에서는 안 쓰지만 초기화

  // 4) 선택된 6명의 sitting 이미지 로드
  chosen.forEach((npc, index) => {
    let frames = [];
    for (let i = 1; i <= npc.frameCount; i++) {
      frames.push(
        loadImage(`assets/npcChracter/sitting/${npc.station}_${npc.spec}_${i}.png`)
      );
    }
    npcAnimationFrames[index] = frames;
    npcStandImgs[index] = null;   // Round2에서는 안 씀
  });

  // 7번째 자리(인덱스 6)는 비어있게 두기
  npcAnimationFrames[6] = null;
  npcStandImgs[6] = null;
}

function switchToRound2() {
  // 1) Round2용 NPC 에셋 로드
  loadRound2NpcAssets();

  // 2) 라운드2 씬 생성
  currentScene = new Round2();
  currentScene.setup();
}



// =======================
// Round 2 : 7번 빈자리 달리기
// =======================
class Round2 {
  constructor() {
    // Player state
    this.x = startX - 400;                        // 좌석 왼쪽에서 시작
    this.y = backgr ? backgr.height - 80 : groundY;
    this.playerDir = "right";
    this.isPlayerAutoMovingToSeat = false;
    this.playerTargetX = null;
    this.isRound2 = true;   // 🔥 이 라운드가 2라운드라는 표시
    this.stage = 2; 

    // 속도 관련 (라운드2 전용)
    this.speed = ROUND2_BASE_SPEED;

    // NPC state
    this.npcCurrentFrameIndex = [0, 0, 0, 0, 0, 0, 0];
    this.lastAnimationTime = 0;
    this.npcPositions = [];
    this.isNpc2Standing = false;        // 라운드2에서는 안 쓰지만 drawNpcs 호환용
    this.npc2StandTriggerTime = null;
    this.npc2WalkStartTime = null;
    this.npc2HasLeftScreen = false;
    this.npc2OriginalSeatX = null;
    this.npc2SeatChosen = false;

    // Game flow
    this.stage = 2; // 카메라/좌석씬 로직 재사용을 위해 그냥 2로 둠
    this.currentStationName = currentStationName || "";
    this.environment = new Environment(cityImg, cloudImg, stationImg);

    // Interaction
    this.highlightedNpcIndex = -1;
    this.selectedNpcIndex = -1;
    this.isSitButtonHovered = false;
    this.hoveredSitNpcIndex = -1;
    this.isSitButtonPressed = false;
    this.sitButtonPressTime = 0;

    // Time-based
    this.stage2StartTime = null;
    this.isStationImgActive = false;
    this.timerStartTime = null;
    this.timerWidth = 0;

 // Result / UI
this.resultOverlayType = null;
this.resultOverlayStartTime = null;

// ----- 스크립트 관련 상태 -----
this.resultScriptPlayer = null;
this.introScriptPlayer = null;

// 기본값: 인트로 없이 바로 게임 시작하는 상태
this.showPressEnter = false;
this.gameStarted = true;
this.awaitingStart = false;
this.introState = "finished";

// 🔥 round2Scripts / ScriptPlayer가 준비된 경우에만 인트로 사용
if (round2Scripts &&
    round2Scripts.round2_intro &&
    typeof ScriptPlayer === "function") {

  this.gameStarted = false;        // 인트로 끝나기 전까지 게임 시작 X
  this.introState = "playing";

  this.introScriptPlayer = new ScriptPlayer(
    round2Scripts.round2_intro,
    () => {
      // 스크립트 완료 콜백
      this.introState = "finished";
      this.showPressEnter = true;
      this.awaitingStart = true;
    }
  );
}

    ;

   
    // Round2 고유 상태
    this.isRound2 = true;
    this.targetSeatIndex = 6;       // 7번 자리
    this.round2Finished = false;
    this.round2Result = null;
    this.isTargetArrowHovered = false;
    this.targetArrowRect = { x: 0, y: 0, w: 0, h: 0 };
  }

  setup() {
    // 좌석 위치 세팅 (Round1과 동일)
    for (let i = 0; i < 7; i++) {
      this.npcPositions[i] = {
        x: startX + i * seatSpacing,
        y: seatBaseY,
      };
    }
    this.npc2OriginalSeatX = this.npcPositions[1].x;
  }

  // ==============
  // 메인 draw
  // ==============
  draw() {
    background(0);

     // 🔽 이제 여기서는 return 안 함
  if (!this.gameStarted && this.introState === "finished") {
    if (this.introScriptPlayer) {
      this.introScriptPlayer.draw(); // 나중에 위에 오버레이로 다시 옮겨도 됨
    }
  }

    const worldGroundY = backgr ? backgr.height - 80 : height - 50;

    // NPC 애니메이션만 (Round1용 자리양보 행동은 안 씀)
    updateNpcAnimations(this);
    // handleNpcBehavior(this, ...)  // 라운드2에서는 자리양보 연출 없음

    this.y = backgr ? backgr.height - 80 : groundY;
    this.environment.display(false, 2);


    // 플레이어 이동
    this.handleMovement();

    // 카메라/하이라이트/스케일 계산은 Round1 로직 재활용
    const firstNpcX = startX;
    const sectionWidth = seatSpacing;
    const rangeStart = firstNpcX - sectionWidth / 2 - 115;
    const numNpcs = 7;
    const rangeEnd = rangeStart + sectionWidth * numNpcs;

    this.highlightedNpcIndex = -1;
    if (this.x >= rangeStart && this.x < rangeEnd) {
      const relativeX = this.x - rangeStart;
      const index = Math.floor(relativeX / sectionWidth);
      this.highlightedNpcIndex = constrain(index, 0, numNpcs - 1);
    }

    let playerRightBoundary = backgr.width - 350;
    this.x = constrain(this.x, 0, playerRightBoundary);

    const visibleSeats = 4;
    let stageScale = width / (visibleSeats * seatSpacing);
    stageScale *= 0.92;
    stageScale = constrain(stageScale, 1.2, 4.0);

    let offsetX = width / 4 + 20;
    let offsetY = height / 4 + 20;

    let scrollX = -this.x + offsetX;
    let scrollY = -this.y + offsetY;

    scrollX = constrain(scrollX, -backgr.width + width / stageScale, 0);
    scrollY = constrain(scrollY, -backgr.height + height / stageScale, 0);

    let topScreenY = (scrollY - 50) * stageScale;
    let worldShiftY = 0;
    if (topScreenY > 0) {
      worldShiftY = -topScreenY / stageScale;
    }

    const yOffsetForMouse = 100;
    let worldMouseX = (mouseX / stageScale) - (scrollX - 50);
    let worldMouseY = (mouseY / stageScale) - (scrollY - 50 + worldShiftY + yOffsetForMouse);

    push();
    scale(stageScale);
    const stageYOffset = 100;
    translate(scrollX - 50, scrollY - 50 + worldShiftY + stageYOffset);

    // 배경 다시 (카메라 기준)
    image(backgr, 0, 0, backgr.width, backgr.height);

    // NPC 그리기 (7번 자리 NPC는 drawNpcs 쪽에서 빼줄 거)
    const npcBottomY = drawNpcs(this, worldMouseX, worldMouseY);

    // 7번 자리 위 화살표
    this.drawArrow(worldMouseX, worldMouseY, npcBottomY);

    // 플레이어
    drawPlayer(this, npcBottomY);

    pop();

    // Round1과 같은 UI (상단 바, 오버레이 등)
    drawUi(this);

     if (this.introScriptPlayer) {
    if (this.introState === "playing") {
      this.introScriptPlayer.draw();  // 인트로 진행 중
    } else if (!this.gameStarted && this.introState === "finished") {
      this.introScriptPlayer.draw();  // 마지막 문장 유지

  
      
    }
  }
  }

  // ==============
  // 이동 로직
  // ==============
  handleMovement() {
    
  
    // 좌우 이동: Round1과 같은 방식 (speed는 Round2 전용)
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= this.speed;
      this.playerDir = "left";
    } else if (keyIsDown(RIGHT_ARROW)) {
      this.x += this.speed;
      this.playerDir = "right";
    }

    // 방향 전환용 (필요 없으면 빼도 됨)
    if (keyIsDown(UP_ARROW)) {
      this.playerDir = "front";
    } else if (keyIsDown(DOWN_ARROW)) {
      this.playerDir = "back";
    }
  }

  // ==============
  // 화살표 그리기
  // ==============
  drawArrow(worldMouseX, worldMouseY, npcBottomWorldY) {
    if (!sitArrowImg) return;

    const seatX = this.npcPositions[this.targetSeatIndex].x;
    const seatY = npcBottomWorldY;

    const desiredWidth = 350;
    const scale = desiredWidth / sitArrowImg.width;
    const w = sitArrowImg.width * scale;
    const h = sitArrowImg.height * scale;

    const drawX = seatX - w / 2;
    const drawY = seatY - h - 150; // 위로 띄우기

    // Hover 감지
  const isHovered =
    worldMouseX >= drawX && worldMouseX <= drawX + w &&
    worldMouseY >= drawY && worldMouseY <= drawY + h;

  this.isTargetArrowHovered = isHovered;

  // 🔥 Hover 효과: 1.1배 확대
  let finalW = w;
  let finalH = h;
  let finalX = drawX;
  let finalY = drawY;

  if (isHovered) {
    finalW = w * 1.1;
    finalH = h * 1.1;
    finalX = seatX - finalW / 2;
    finalY = seatY - finalH - 150;
  }

  // 🔥 Hover 효과: 밝기 강조 (tint)
  if (isHovered) {
    push();
    tint(255, 230); // 약간 밝아짐
    image(sitArrowImg, finalX, finalY, finalW, finalH);
    pop();
  } else {
    image(sitArrowImg, finalX, finalY, finalW, finalH);
  }

  // 클릭 판정을 위해 rect 저장
  this.targetArrowRect = {
    x: finalX,
    y: finalY,
    w: finalW,
    h: finalH,
  };
  }

  // ==============
  // 키 입력
  // ==============
  keyPressed() {
    // 스페이스바
  if (keyCode === 32) {
    // 1) 인트로 스크립트 진행 중이면 다음 줄
    if (this.introScriptPlayer && this.introState === "playing") {
      this.introScriptPlayer.next();
      return false;
    }

    // 2) 인트로 끝나고 스페이스 대기 중이면 → 게임 시작
    if (!this.gameStarted &&
        this.introState === "finished" &&
        this.awaitingStart) {

      this.gameStarted = true;
      this.awaitingStart = false;
      this.showPressEnter = false;
      this.stage2StartTime = millis(); // 필요하면 타이머 시작

      return false;
    }

    // 3) 결과 스크립트(success/fail) 재생 중이면 → 다음 줄
    if (this.resultScriptPlayer && !this.resultScriptPlayer.isFinished()) {
      this.resultScriptPlayer.next();
      return false;
    }
  }

  return false;
  }

  // ==============
  // 마우스 입력
  // ==============
  mousePressed() {
    // --- stop 버튼 ---
    if (
      stopBtnX !== undefined &&
      mouseX >= stopBtnX && mouseX <= stopBtnX + stopBtnW &&
      mouseY >= stopBtnY && mouseY <= stopBtnY + stopBtnH
    ) {
      if (typeof switchToStopScreen === "function") {
        switchToStopScreen();
      }
      return;
    }

    // --- quit 버튼 ---
    if (
      quitBtnX !== undefined &&
      mouseX >= quitBtnX && mouseX <= quitBtnX + quitBtnW &&
      mouseY >= quitBtnY && mouseY <= quitBtnY + quitBtnH
    ) {
      if (typeof switchToQuitScreen === "function") {
        switchToQuitScreen();
      }
      return;
    }

    // --- setting 버튼 ---
    if (
      settingBtnX !== undefined &&
      mouseX >= settingBtnX && mouseX <= settingBtnX + settingBtnW &&
      mouseY >= settingBtnY && mouseY <= settingBtnY + settingBtnH
    ) {
      if (typeof switchToSettingsScreen === "function") {
        switchToSettingsScreen();
      }
      return;
    }

    // --- 7번자리 화살표 클릭 → 성공 ---
    if (this.isTargetArrowHovered && !this.round2Finished) {
      const seatX = this.npcPositions[this.targetSeatIndex].x;

      this.round2Finished = true;
      this.round2Result = "success";

      const millgi = 20; // 살짝 왼쪽으로
      this.x = seatX - millgi;

      this.isPlayerAutoMovingToSeat = false;
      this.playerTargetX = null;
      this.playerDir = "sit";

      this.resultOverlayType = "success";
      this.resultOverlayStartTime = millis();

      // 🔥 성공 스크립트 시작
  if (round2Scripts && round2Scripts.round2_success && typeof ScriptPlayer === "function") {
    this.resultScriptPlayer = new ScriptPlayer(round2Scripts.round2_success);
  }

  console.log("ROUND 2 SUCCESS: clicked arrow!");
  return;



      console.log("ROUND 2 SUCCESS: clicked arrow!");
      return;
    }

    // --- 화살표가 아닌 곳 클릭 → 속도 증가 ---
    this.boostSpeed();
  }

  // ==============
  // 속도 부스트
  // ==============
  boostSpeed() {
    if (this.round2Finished) return;

    this.speed += ROUND2_BOOST_AMOUNT;
    if (this.speed > ROUND2_MAX_SPEED) this.speed = ROUND2_MAX_SPEED;

    setTimeout(() => {
      this.speed -= ROUND2_BOOST_AMOUNT;
      if (this.speed < ROUND2_BASE_SPEED) this.speed = ROUND2_BASE_SPEED;
    }, 400);
  }
}

// Round2용 속도 상수 (전역에 한 번만 선언)
const ROUND2_BASE_SPEED   = 0.1;
const ROUND2_BOOST_AMOUNT = 1 ;
const ROUND2_MAX_SPEED    = 8;



/*
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
  */