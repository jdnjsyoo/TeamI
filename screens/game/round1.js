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

    // UI state
    this.showPressEnter = true;

    // Game starting state
    this.gameStarted = false; // 게임 시작 여부
    this.awaitingStart = true; // 게임 시작을 기다리는 상태를 위한 변수
    this.showStartMessage = true; // "Press SPACE to start" 메시지 표시 여부
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

    const worldGroundY = backgr ? backgr.height - 80 : height - 50;

    updateNpcAnimations(this);
    handleNpcBehavior(this, worldGroundY, -this.x + width / 4 + 20, this.stage === 1 ? 1.2 : width / (4 * seatSpacing));

    this.y = backgr ? backgr.height - 80 : groundY;

    // Use the Environment class to draw the background
    this.environment.display(this.isStationImgActive, this.stage);

    // Handle player sitting logic
    if (this.isSitButtonPressed) {
      if (this.hoveredSitNpcIndex !== -1) {
        // Player sits at the hovered NPC's position
        this.x = this.npcPositions[this.hoveredSitNpcIndex].x;
        this.playerDir = "sit";
        this.isSitButtonPressed = false; // Reset the flag after processing

        // Check for SUCCESS/FAIL immediately after player sits
        if (this.npc2SeatChosen) {
            this.resultOverlayType = "success";   // SUCCESS 오버레이
            this.resultOverlayStartTime = millis();
            // Trigger NPC 2 to stand and walk away after successful sitting
            this.isNpc2Standing = true;
            this.npc2WalkStartTime = millis();
        } else {
            this.resultOverlayType = "fail";    // FAIL 오버레이
            this.resultOverlayStartTime = millis();
        }
      }
    }

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

    // The environment background is already drawn by this.environment.display()
    // No need to draw outside again for stage 2 here.

    image(backgr, 0, 0, backgr.width, backgr.height);

    const npcBottomY = drawNpcs(this, worldMouseX, worldMouseY);
    drawPlayer(this, npcBottomY);

    pop();

    drawUi(this);

    if (this.stage === 2 && this.stage2StartTime !== null && !this.isStationImgActive) {
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
    // 스페이스바를 눌러 게임 시작
    if (this.awaitingStart && keyCode === 32) { // 스페이스바
      this.gameStarted = true;
      this.awaitingStart = false;
      this.showStartMessage = false;
      this.start = millis(); // 게임 시작 시간 기록
      console.log("Game started!");
      return false; // 기본 스페이스바 동작 방지
    }
    
    // Call the shared input handler for stage toggling, etc.
    handleGameInputKeyPressed(this);

    return false; // 기본 키 동작 방지
  }

  // 마우스 클릭 이벤트 핸들러
  mousePressed() {
    handleGameInputMousePressed(this); // Call the shared mouse input handler
  }
}