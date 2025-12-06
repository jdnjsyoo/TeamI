// 좌석 위치 관련 상수 가져오기
const { startX, seatSpacing } = window;

class Round1 {
  constructor() {
    // Player state
    this.x = 200;
    this.y = 480;
    this.playerDir = "right";
    this.isPlayerAutoMovingToSeat = false;
    this.playerTargetX = null;
    
    // NPC state - will be populated in setup() from gameNpcs
    this.npcs = [];
    this.correctNpcIndex = -1; // Index of the correct NPC

    // Game flow state
    this.stage = 1;
    this.currentStationName = ""; // This will be set by initializeStationAssets in assets.js
    this.environment = new Environment(cityImg, cloudImg, stationImg);
    
    // Interaction state
    this.highlightedNpcIndex = -1;
    this.selectedNpcIndex = -1;
    this.isSitButtonHovered = false;
    this.hoveredSitNpcIndex = -1;
    this.isSitButtonPressed = false;
    this.sitButtonPressTime = 0;

    // Time-based state
    this.stage2StartTime = null;
    this.isStationImgActive = false;
    this.timerStartTime = null;
    this.timerWidth = 0;

    // Result state
    this.resultOverlayType = null;
    this.resultOverlayStartTime = null;
    this.resultScriptPlayer = null;

    // --- New Intro Flow State ---
    this.showPressEnter = false; // 시작할 때 숨김
    this.gameStarted = false; 
    this.awaitingStart = false; // 스크립트 끝나고 스페이스바 기다릴 때 true
    this.introState = "playing"; // 시작하자마자 재생

    // 스크립트 플레이어 생성 및 인트로 시작
    this.introScriptPlayer = new ScriptPlayer(
      round1Scripts.round1_intro,
      () => {
        // 스크립트 완료 콜백
        this.introState = "finished";
        this.showPressEnter = true;   // "PRESS SPACE" 메시지 표시
        this.awaitingStart = true;    // 최종 스페이스바 입력 대기
      }
    );
  }

  // This setup method will be called after gameScreenPreload has finished
  setup() {
    // Populate this.npcs from the global gameNpcs
    this.npcs = gameNpcs.map((npcData, index) => {
      if (npcData.isCorrect) {
        this.correctNpcIndex = index;
      }
      return {
        ...npcData, // Spread all properties from gameNpcs object
        isStanding: false,
        standTriggerTime: null,
        walkStartTime: null,
        hasLeftScreen: false,
        originalSeatX: startX + index * seatSpacing, // Use global startX and seatSpacing
        isChosen: false
      };
    });

    // Ensure currentStationName is set from the global one in assets.js
    this.currentStationName = currentStationName;
  }

  draw() {
    background(0);

    // 게임 로직은 gameStarted 플래그로 제어
    if (this.gameStarted) {
      const worldGroundY = backgr ? backgr.height - 80 : height - 50;

      updateNpcAnimations(this); // Pass 'this' so the function can access this.npcs
      handleNpcBehavior(
        this,
        worldGroundY,
        -this.x + width / 4 + 20,
        this.stage === 1 ? 1.2 : width / (4 * seatSpacing)
      );

      this.y = backgr ? backgr.height - 80 : groundY;

      // Use the Environment class to draw the background
      this.environment.display(this.isStationImgActive, this.stage);

      handlePlayerMovement(this);

      if (this.stage === 2) {
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
      } else {
        this.highlightedNpcIndex = -1;
      }

      const playerRightBoundary = backgr.width - 350;
      this.x = constrain(this.x, 0, playerRightBoundary);

      const visibleSeats = 4;
      let stageScale =
        this.stage === 1 ? 1.2 : width / (visibleSeats * seatSpacing);
      if (this.stage === 2) stageScale *= 0.92;
      stageScale = constrain(stageScale, 1.2, 4.0);

      const offsetX = width / 4 + 20;
      const offsetY = height / 4 + 20;

      let scrollX = this.stage === 2 ? -this.x + offsetX : 0 + offsetX;
      let scrollY = -this.y + offsetY;

      scrollX = constrain(scrollX, -backgr.width + width / stageScale, 0);
      scrollY = constrain(scrollY, -backgr.height + height / stageScale, 0);

      const topScreenY = (scrollY - 50) * stageScale;
      let worldShiftY = 0;
      if (topScreenY > 0) {
        worldShiftY = -topScreenY / stageScale;
      }

      const stage2YOffsetForMouse = this.stage === 2 ? 100 : 0;
      const worldMouseX = mouseX / stageScale - (scrollX - 50);
      const worldMouseY =
        mouseY / stageScale -
        (scrollY - 50 + worldShiftY + stage2YOffsetForMouse);

      push();
      scale(stageScale);
      const stage2YOffset = this.stage === 2 ? 100 : 0;
      translate(scrollX - 50, scrollY - 50 + worldShiftY + stage2YOffset);

      image(backgr, 0, 0, backgr.width, backgr.height);

      const npcBottomY = drawNpcs(this, worldMouseX, worldMouseY);
      drawPlayer(this, npcBottomY);

      pop();
    } else {
      // 인트로 중에는 그냥 까만 화면 + 배경
      background(0);
      this.environment.display(false, 1); // 역 아니고, stage 1
      image(backgr, 0, 0, backgr.width, backgr.height);
    }
    
    // UI는 항상 그림 (인트로 포함)
    drawUi(this);

    if (
      this.gameStarted &&
      this.stage === 2 &&
      this.stage2StartTime !== null &&
      !this.isStationImgActive
    ) {
      if (millis() - this.stage2StartTime >= stage2Duration) {
        this.isStationImgActive = true;
        this.stage = 1;
        this.selectedNpcIndex = this.highlightedNpcIndex;
        this.stage2StartTime = null;
      }
    }
  }

  // 키 눌림 이벤트 핸들러
  keyPressed() {
    // 결과 스크립트 재생 중일 때 우선 처리
    if (this.resultScriptPlayer) {
      if (keyCode === 32) { // 스페이스바
        if (!this.resultScriptPlayer.isFinished()) {
          this.resultScriptPlayer.next();
        }
      } else if (
        (key === "n" || key === "N") &&
        this.resultScriptPlayer.isFinished()
      ) {
        // TODO: Round 2로 넘어가는 로직
        if (typeof switchToRound2 === "function") {
        switchToRound2();}
        console.log("Switching to Round 2!");
      }
      return false;
    }

    // 인트로 & 게임 진행 중 스페이스바 처리
    if (keyCode === 32) { // 스페이스바
      if (this.introState === "playing") {
        // 1. 인트로 스크립트 진행
        this.introScriptPlayer.next();
      } else if (this.introState === "finished" && this.awaitingStart) {
        // 2. 인트로 스크립트 끝난 후 → 게임 시작 & 2단계 진입
        this.gameStarted = true;
        this.awaitingStart = false;
        this.showPressEnter = false;
        this.start = millis(); // 게임 실제 시작 시간
        this.enterStage2();    // 플레이어 이동 및 게임플레이를 위해 즉시 2단계로 전환
      } else if (this.gameStarted) {
        // 3. 게임 시작 후 스페이스바 → 스테이지 토글
        if (this.stage === 1) {
          this.enterStage2();
        } else if (this.stage === 2) {
          this.isStationImgActive = true;
          this.stage = 1;
          this.selectedNpcIndex = this.highlightedNpcIndex;
          this.stage2StartTime = null;
        }
      }
      return false; // 기본 키 동작 방지
    }

    // 다른 키 입력에 대해서는 기본 동작 허용
    return true;
  }

  // Stage 2로 전환하는 함수
  enterStage2() {
    this.stage = 2;
    this.stage2StartTime = millis();
    this.isStationImgActive = false;
    this.selectedNpcIndex = -1;
    this.showPressEnter = false;
    this.timerStartTime = millis();
    if (typeof timeBar !== "undefined" && timeBar) {
      this.timerWidth = timeBar.width;
    }
  }
}
