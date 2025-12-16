// =======================
// Round 2용 에셋 로드: 1라운드 방식 재사용 + 7번 자리 비우기
// =======================
function loadRound2Assets() {
  // 1) 1라운드 방식 그대로 사용해서
  //    역 + NPC(7명) 전부 새로 뽑기 
  preloadRound1Assets();

  // 2) Round2에서는 7번 자리가 "빈 자리"여야 하니까, 인덱스 6 비우기
  const emptyIndex = 6;  // 0~6 중 7번째 좌석

  if (npcAnimationFrames && npcAnimationFrames.length > emptyIndex) {
    npcAnimationFrames[emptyIndex] = null;
  }
  if (typeof npcStandImgs !== "undefined" && npcStandImgs.length > emptyIndex) {
    npcStandImgs[emptyIndex] = null;
  }
  if (selectedNpcs && selectedNpcs.length > emptyIndex) {
    selectedNpcs[emptyIndex] = null;
  }

  // 3) Round1에서 쓰던 정답 인덱스는 Round2에선 의미 없으니 초기화
  if (typeof correctNpcIndex !== "undefined") {
    correctNpcIndex = -1;
  }

  console.log("ROUND2 NPCS (from loadRound1Assets):");
  console.table(selectedNpcs);
}


// =======================
// Round 2 : 7번 빈자리 달리기
// =======================
class Round2 {
  constructor() {
    // 🔥 잔상 트레일
    this.trail = [];
    
    // Player state
    this.x = startX - 400;                        // 좌석 왼쪽에서 시작
    this.y = backgr ? backgr.height - 80 : groundY;
    this.playerDir = "right";
    this.isPlayerAutoMovingToSeat = false;
    this.playerTargetX = null;
    this.isRound2 = true;   // 🔥 이 라운드가 2라운드라는 표시
    this.stage = 2; 

    // 사운드 로드
    if (typeof loadSound === 'function') {
      if (typeof scriptBgSound === 'undefined') {
        scriptBgSound = loadSound('assets/sound/script_bg.wav', () => {
          scriptBgSound.setVolume(0.5);
        });
      }
      if (typeof roundPlayingSound === 'undefined') {
        roundPlayingSound = loadSound('assets/sound/round_playing.mp3', () => {
          roundPlayingSound.setVolume(0.5);
        });
      }
    }
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
    // stage2 진입 시 사운드 재생
    this.stage = 2;
    this.stage2StartTime = millis();
    
    // 인트로 중에는 script_bg 재생
    if (scriptBgSound && scriptBgSound.isLoaded() && !scriptBgSound.isPlaying()) {
      scriptBgSound.loop();
    }
    this._scoreAdded = false;

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
    //this.environment.display(false, 2);

    // 음악 재생 로직: 게임 시작 전에는 script_bg, 시작 후에는 round_playing
    if (this.gameStarted) {
      // 게임 시작 후: round_playing 재생
      if (roundPlayingSound && roundPlayingSound.isLoaded() && !roundPlayingSound.isPlaying()) {
        roundPlayingSound.loop();
      }
      // script_bg 정지
      if (scriptBgSound && scriptBgSound.isPlaying()) {
        scriptBgSound.stop();
      }
    } else {
      // 게임 시작 전: script_bg 재생
      if (scriptBgSound && scriptBgSound.isLoaded() && !scriptBgSound.isPlaying()) {
        scriptBgSound.loop();
      }
      // round_playing 정지
      if (roundPlayingSound && roundPlayingSound.isPlaying()) {
        roundPlayingSound.stop();
      }
    }

    // 플레이어 이동
    this.handleMovement();
    // =======================
    // 🔥 잔상 기록 (부스트 중에만 쌓이게)
    // =======================
    if (this.gameStarted && !this.round2Finished) {
    if (this.speed > ROUND2_BASE_SPEED) {
    this.trail.push({
      x: this.x,
      y: this.y,
      dir: this.playerDir,
      t: millis()
    });
  }
    // 오래된 잔상 제거
   const TRAIL_LIFE = 220; // ms (늘리면 더 길게 남음)
   this.trail = this.trail.filter(p => millis() - p.t < TRAIL_LIFE);
}


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

    // =======================
// ✅ 7번 자리 도착 시 자동 성공
// =======================
if (!this.round2Finished && this.gameStarted) {
  const seatX = this.npcPositions[this.targetSeatIndex].x;

  // 좌석 "영역" 기준 판정
  const seatLeft  = seatX - seatSpacing / 2;
  const seatRight = seatX + seatSpacing / 2;

  const playerCenterX = this.x + playerScale / 2;

if (playerCenterX >= seatLeft && playerCenterX <= seatRight) {
  this.round2Finished = true;
  this.round2Result = "success";

  // ✅ 점수 +1 (Round2 성공 시 1회만)
 // ✅✅✅ Round2 점수 +1을 "확실히" (전역 함수 의존 X, 이미지까지 동기화)
if (typeof this._scoreAdded === "undefined") this._scoreAdded = false;

if (!this._scoreAdded) {
  this._scoreAdded = true;

  let idx = 0;

  // 1) 현재 값 읽기
  if (typeof globalThis.currentScoreIndex === "number" && Number.isFinite(globalThis.currentScoreIndex)) {
    idx = globalThis.currentScoreIndex;
  } else if (typeof currentScoreIndex !== "undefined" && typeof currentScoreIndex === "number") {
    idx = currentScoreIndex;
  } else if (typeof scoreCount !== "undefined" && typeof scoreCount === "number") {
    idx = scoreCount;
  }

  // 2) +1 (0~3)
  idx = Math.min(3, Math.max(0, idx + 1));

  // 3) 숫자 상태 동기화
  globalThis.currentScoreIndex = idx;
  if (typeof currentScoreIndex !== "undefined") currentScoreIndex = idx;
  if (typeof scoreCount !== "undefined") scoreCount = idx;

  // 4) ✅ drawUi가 이미지로 점수 추론해서 덮어쓰는 구조라 gameScore도 같이 바꿔야 함
  const arr =
    (typeof scoreImages !== "undefined" && Array.isArray(scoreImages) ? scoreImages : null) ||
    (typeof scoreImgs !== "undefined" && Array.isArray(scoreImgs) ? scoreImgs : null) ||
    null;

  if (arr && arr[idx]) {
    if (typeof gameScore !== "undefined") gameScore = arr[idx];
    globalThis.gameScore = arr[idx];
  }

  console.log("[Round2 SCORE UP] ->", idx);
}

  // (구버전 함수명이라면 아래로 교체)
  // if (typeof registerSuccessOnce === "function") registerSuccessOnce();

  // 자리 위치로 스냅 + 앉기
  this.x = seatX;
  this.playerDir = "sit";

  this.resultOverlayType = "success";
  this.resultOverlayStartTime = millis();

  // 성공 스크립트
  if (round2Scripts && round2Scripts.round2_success && typeof ScriptPlayer === "function") {
    this.resultScriptPlayer = new ScriptPlayer(round2Scripts.round2_success);
  }

  console.log("ROUND 2 SUCCESS: auto-arrived at seat");
}

}


    const visibleSeats = 4;
    let stageScale = width / (visibleSeats * seatSpacing);
    stageScale *= 0.92;
    stageScale = constrain(stageScale, 1.2, 4.0);

    let offsetX = width / 4 + 20;
    let offsetY = height / 4 + 20;

    const camPad = 50;
const viewW = width / stageScale;
const viewH = height / stageScale;

// ✅ 플레이어 중심 기준
const playerCenterX = this.x + playerScale / 2;

let scrollX = -playerCenterX + viewW / 2;
let scrollY = -this.y + offsetY;

// ✅ 배경 밖 안 보이게
scrollX = constrain(scrollX, -backgr.width + viewW + camPad, camPad);
scrollY = constrain(scrollY, -backgr.height + viewH + camPad, camPad);



    let topScreenY = (scrollY - 50) * stageScale;
    let worldShiftY = 0;
    if (topScreenY > 0) {
      worldShiftY = -topScreenY / stageScale;
    }

    const yOffsetForMouse = 45;
    let worldMouseX = (mouseX / stageScale) - (scrollX - 50);
    let worldMouseY = (mouseY / stageScale) - (scrollY - 50 + worldShiftY + yOffsetForMouse);

    // =======================
// ✅ 창밖 배경(환경) 패럴랙스: 카메라 따라 움직이게
// =======================
const camPad2 = 50;
const camWorldX = -(scrollX - camPad2);
const parallax = 0.25;

const envScale = 1.25;   // ✅ 창밖 풍경 확대 (1.1~1.6 추천)
const envYOffset = 40;  // 필요하면 위로

push();
resetMatrix();

// ✅ 화면 중심 기준으로 확대 (안 그러면 좌상단 기준으로 커져서 위치가 이상해질 수 있음)
translate(width / 2, height / 2);
scale(envScale);
translate(-width / 2, -height / 2);

// ✅ 그 다음에 패럴랙스 + y오프셋 적용
translate(-camWorldX * parallax * stageScale, envYOffset);

this.environment.display(false, 2);
pop();

    push();
    
    scale(stageScale);
    const stageYOffset = 45;
    translate(scrollX - 50, scrollY - 50 + worldShiftY + stageYOffset);

    // 배경 다시 (카메라 기준)
    image(backgr, 0, 0, backgr.width, backgr.height);

    // NPC 그리기 (7번 자리 NPC는 drawNpcs 쪽에서 빼줄 거)
    const npcBottomY = drawNpcs(this, worldMouseX, worldMouseY);

   // 7번 자리 위 화살표 (성공 전까지만)
   if (!this.round2Finished) {
   this.drawArrow(worldMouseX, worldMouseY, npcBottomY);
}


    // =======================
// 🔥 잔상 먼저 그리기
// =======================
const savedX = this.x;
const savedDir = this.playerDir;

for (let i = 0; i < this.trail.length; i++) {
  const p = this.trail[i];
  const age = millis() - p.t;      // 0 ~ TRAIL_LIFE
  const alpha = map(age, 0, 220, 120, 0); // 처음 진하고 점점 사라짐

  this.x = p.x;
  this.playerDir = p.dir;

  push();
  tint(255, alpha);
  drawPlayer(this, npcBottomY);
  pop();
}

this.x = savedX;
this.playerDir = savedDir;


    // 플레이어
    drawPlayer(this, npcBottomY);

    pop();


     // 🔥 Round2 타이머 업데이트 (게임 시작 후, 아직 끝나지 않았을 때만)
    if (this.gameStarted && !this.round2Finished) {
      // 타이머 처음 시작
      if (this.timerStartTime === null) {
        this.timerStartTime = millis();
        if (timeBar) {
          this.timerWidth = timeBar.width;  // 처음에는 풀로 채워진 상태
        }
      } else {
        const elapsed = millis() - this.timerStartTime;
        const progress = constrain(elapsed / ROUND2_TIME_LIMIT, 0, 1);

        // timeBar 폭 줄이기
        if (timeBar) {
          this.timerWidth = timeBar.width * (1 - progress);
        }

        // 시간 초과 → FAIL 처리
        if (elapsed >= ROUND2_TIME_LIMIT && !this.round2Finished) {
          this.round2Finished = true;
          this.round2Result = "fail";
          this.resultOverlayType = "fail";
          this.resultOverlayStartTime = millis();

          // 실패 스크립트 있으면 재생
          if (round2Scripts && round2Scripts.round2_fail && typeof ScriptPlayer === "function") {
            this.resultScriptPlayer = new ScriptPlayer(round2Scripts.round2_fail);
          }

          console.log("ROUND 2 FAIL: time over!");
        }
      }
    }


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
      if (!this.gameStarted || this.round2Finished) return;
  
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

///// 화살표 그리기

  drawArrow(worldMouseX, worldMouseY , npcBottomWorldY) {
  if (!sitArrowImg) return;

  const seatX = this.npcPositions[this.targetSeatIndex].x;
  const seatY = npcBottomWorldY;

  // 기본 크기
  const desiredWidth = 350;
  const s = desiredWidth / sitArrowImg.width;
  const w = sitArrowImg.width * s;
  const h = sitArrowImg.height * s;

  // ✅ 먼저 기본값 선언
  let finalW = w;
  let finalH = h;

  // 🔥 기본 펄스 (hover 없어도 강조)
  const pulse = 1 + 0.06 * Math.sin(millis() / 120); // 1.0 ~ 1.06
  finalW *= pulse;
  finalH *= pulse;

  let finalX = seatX - finalW / 2;
  let finalY = seatY - finalH - 150;

  // Hover 감지 (final 좌표 기준으로 해야 펄스/확대에도 정확)
  const isHovered =
    worldMouseX >= finalX + 120 && worldMouseX <= finalX + finalW - 120 &&
    worldMouseY >= finalY && worldMouseY <= finalY + finalH;

  this.isTargetArrowHovered = isHovered;

 
  // 🔥 글로우 먼저
  push();
  tint(255, 140);
  image(sitArrowImg, finalX - 6, finalY - 6, finalW + 12, finalH + 12);
  pop();

  
}


  // ==============
  // 키 입력
  // ==============
  keyPressed() {

// 🔥 S키 연타 부스터 (완전 누적형)
if (key === 's' || key === 'S') {
  if (!this.round2Finished && this.gameStarted) {

    this.speed += ROUND2_BOOST_AMOUNT;

    if (this.speed > ROUND2_MAX_SPEED) {
      this.speed = ROUND2_MAX_SPEED;
    }

    setTimeout(() => {
      this.speed -= ROUND2_BOOST_AMOUNT;
      if (this.speed < ROUND2_BASE_SPEED) {
        this.speed = ROUND2_BASE_SPEED;
      }
    }, 400); // ← 예전 클릭 부스터랑 동일 타이밍
  }
  return false;
}

    // ✅ 바로 3라운드 넘어가는 L 치트키 (디버그용)
    if (key === 'l' || key === 'L') {
        // Round2 음악 정지
        if (roundPlayingSound && roundPlayingSound.isPlaying()) {
          roundPlayingSound.stop();
        }
        if (scriptBgSound && scriptBgSound.isPlaying()) {
          scriptBgSound.stop();
        }
        
        if (typeof switchToRound3 === "function") {
          switchToRound3();
        }
        console.log("DEBUG: Force switch to Round 3 by L key");
        return false;   // 다른 키 처리 안 하도록 바로 종료
    }

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
      this.round2EndTime = millis() + ROUND2_TIME_LIMIT;

      // 음악 전환: script_bg 정지, round_playing 시작
      if (scriptBgSound && scriptBgSound.isPlaying()) {
        scriptBgSound.stop();
      }
      if (roundPlayingSound && roundPlayingSound.isLoaded()) {
        roundPlayingSound.loop();
      }

      return false;
    }

    // 3) 결과 스크립트(success/fail) 재생 중이면 → 다음 줄
    if (this.resultScriptPlayer && !this.resultScriptPlayer.isFinished()) {
      this.resultScriptPlayer.next();
      return false;
    }
  }

  if ((key === 'n' || key === 'N')) {
    if (this.resultScriptPlayer && this.resultScriptPlayer.isFinished()) {
        // Round2 음악 정지
        if (roundPlayingSound && roundPlayingSound.isPlaying()) {
          roundPlayingSound.stop();
        }
        if (scriptBgSound && scriptBgSound.isPlaying()) {
          scriptBgSound.stop();
        }
        
        if (typeof switchToRound3 === "function") {
            switchToRound3();
        }
        console.log("Switching to Round 3!");
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

   
  }

}

// Round2용 속도 상수 (전역에 한 번만 선언)
const ROUND2_BASE_SPEED   = 0.1;
const ROUND2_BOOST_AMOUNT = 1 ;
const ROUND2_MAX_SPEED    = 10;

const ROUND2_TIME_LIMIT   = 8000;

