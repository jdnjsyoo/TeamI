class Round1 {
  constructor() {
    // Player state
    this.x = 200;
    this.y = 480;
    this.playerDir = "right";
    this.isPlayerAutoMovingToSeat = false;
    this.playerTargetX = null;
    
    // NPC state
    this.npcCurrentFrameIndex = [0, 0, 0, 0, 0, 0, 0];
    this.lastAnimationTime = 0;
    this.npcPositions = [];
    this.isNpc2Standing = false;
    this.npc2StandTriggerTime = null;
    this.npc2WalkStartTime = null;
    this.npc2HasLeftScreen = false;
    this.npc2OriginalSeatX = null;
    this.npc2SeatChosen = false;

    // Game flow state
    this.stage = 1;
    this.currentStationName = '';
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
    this.introState = 'playing'; // 시작하자마자 재생

    // 스크립트 플레이어 생성 및 인트로 시작
    this.introScriptPlayer = new ScriptPlayer(round1Scripts.round1_intro, () => {
      // 스크립트 완료 콜백
      this.introState = 'finished';
      this.showPressEnter = true;   // "PRESS SPACE" 메시지 표시
      this.awaitingStart = true;    // 최종 스페이스바 입력 대기
    });
  }

  setDebugColor(c) {
    this.debugColor = c;
  }

  setup() {
    createCanvas(1024, 869);

    for (let i = 0; i < 7; i++) {
      this.npcPositions[i] = {
        x: startX + i * seatSpacing,
        y: seatBaseY,
      };
    }
    this.npc2OriginalSeatX = this.npcPositions[1].x;
    
  }

  enterStage2() {
    this.stage = 2;
    this.stage2StartTime = millis();
    this.isStationImgActive = false;
    this.selectedNpcIndex = -1;
    this.showPressEnter = false;
    this.timerStartTime = millis();
    if (timeBar) {
      this.timerWidth = timeBar.width;
    }
  }

  draw() {
    background(0);

    // 게임 로직은 gameStarted 플래그로 제어
    if (this.gameStarted) {
      const worldGroundY = backgr ? backgr.height - 80 : height - 50;

      updateNpcAnimations(this);
      handleNpcBehavior(this, worldGroundY, -this.x + width / 4 + 20, this.stage === 1 ? 1.2 : width / (4 * seatSpacing));

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

      let playerRightBoundary = backgr.width - 350;
      this.x = constrain(this.x, 0, playerRightBoundary);

      const visibleSeats = 4;
      let stageScale = this.stage === 1 ? 1.2 : width / (visibleSeats * seatSpacing);
      if (this.stage === 2) stageScale *= 0.92;
      stageScale = constrain(stageScale, 1.2, 4.0);

      let offsetX = width / 4 + 20;
      let offsetY = height / 4 + 20;

      let scrollX = (this.stage === 2) ? -this.x + offsetX : -0 + offsetX;
      let scrollY = -this.y + offsetY;

      scrollX = constrain(scrollX, -backgr.width + width / stageScale, 0);
      scrollY = constrain(scrollY, -backgr.height + height / stageScale, 0);

      let topScreenY = (scrollY - 50) * stageScale;
      let worldShiftY = 0;
      if (topScreenY > 0) {
        worldShiftY = -topScreenY / stageScale;
      }

      const stage2YOffsetForMouse = this.stage === 2 ? 100 : 0;
      let worldMouseX = mouseX / stageScale - (scrollX - 50);
      let worldMouseY = mouseY / stageScale - (scrollY - 50 + worldShiftY + stage2YOffsetForMouse);

      push();
      scale(stageScale);
      const stage2YOffset = this.stage === 2 ? 100 : 0;
      translate(scrollX - 50, scrollY - 50 + worldShiftY + stage2YOffset);
      
      image(backgr, 0, 0, backgr.width, backgr.height);

      const npcBottomY = drawNpcs(this, worldMouseX, worldMouseY);
      drawPlayer(this, npcBottomY);

      pop();
    } else {
      // 인트로 중에는 그냥 까만 화면
      background(0);
      // 지하철 배경은 보여주기
      this.environment.display(false, 1); // 역 아니고, stage 1
      image(backgr, 0, 0, backgr.width, backgr.height);
    }
    
    // UI는 항상 그림 (인트로 포함)
    drawUi(this);

    if (this.gameStarted && this.stage === 2 && this.stage2StartTime !== null && !this.isStationImgActive) {
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
    if (this.resultScriptPlayer) {
      if (keyCode === 32) { // 스페이스바
        if (!this.resultScriptPlayer.isFinished()) {
          this.resultScriptPlayer.next();
        }
      } else if ((key === 'n' || key === 'N') && this.resultScriptPlayer.isFinished()) {
        // TODO: Round 2로 넘어가는 로직
        console.log("Switching to Round 2!");
      }
      return false;
    }

    if (keyCode === 32) { // 스페이스바
      if (this.introState === 'playing') {
        // 1. 인트로 스크립트 진행
        this.introScriptPlayer.next();
      } else if (this.introState === 'finished' && this.awaitingStart) {
        // 2. 스크립트 끝나고, 스페이스바 대기 중일 때 -> 게임 시작 및 즉시 2단계 진입
        this.gameStarted = true;
        this.awaitingStart = false;
        this.showPressEnter = false;
        this.start = millis(); // 게임 실제 시작 시간
        this.enterStage2(); // <--- 플레이어 이동 및 게임플레이를 위해 즉시 2단계로 전환
      } else if (this.gameStarted) {
        // 3. 게임 시작 후 스페이스바 -> 스테이지 토글
        if (this.stage === 1) {
          this.enterStage2();
        } else if (this.stage === 2) {
          this.isStationImgActive = true;
          this.stage = 1;
          this.selectedNpcIndex = this.highlightedNpcIndex;
          this.stage2StartTime = null;
        }
      }
    } else if (key === 'n' || key === 'N') {
      // 'n' 키: 2번 NPC 일어나기 (수동 디버그용)
      if (this.gameStarted) {
        this.isNpc2Standing = true;
      }
    }
    return false; // 기본 키 동작 방지
  }

  // 마우스 클릭 이벤트 핸들러
  mousePressed() {
    if (!this.gameStarted) return; // 게임 시작 전에는 마우스 클릭 무시

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

    // --- sit here 버튼 ---
    if (this.isSitButtonHovered) {
      this.isSitButtonPressed = true;
      this.sitButtonPressTime = millis();
      this.isStationImgActive = true;
      this.npc2StandTriggerTime = millis();

      if (this.hoveredSitNpcIndex === 1) {
        this.npc2SeatChosen = true;
      } else {
        this.npc2SeatChosen = false;
      }
      return;
    }
    
    // --- 버튼이 아닌 곳 클릭 (속도 부스트) ---
    speed += boostAmount;
    if (speed > maxBoost) speed = maxBoost;
    setTimeout(() => {
      speed -= boostAmount;
      if (speed < baseSpeed) speed = baseSpeed;
    }, 1000);
  }
}