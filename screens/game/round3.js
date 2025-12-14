// ✅ Round3에서 "Round1의 scenery↔정답NPC 연결 로직"을 그대로 재사용하기 위한 안전 래퍼
function preloadRound3Assets_SAFE() {
  function swapIdx(a, b) {
    if (a === b) return;

    try {
      if (typeof selectedNpcs !== "undefined" && Array.isArray(selectedNpcs)) {
        const t = selectedNpcs[a]; selectedNpcs[a] = selectedNpcs[b]; selectedNpcs[b] = t;
      }
    } catch (e) {}

    try {
      if (typeof npcAnimationFrames !== "undefined" && Array.isArray(npcAnimationFrames)) {
        const t2 = npcAnimationFrames[a]; npcAnimationFrames[a] = npcAnimationFrames[b]; npcAnimationFrames[b] = t2;
      }
    } catch (e) {}

    try {
      if (typeof npcStandImgs !== "undefined" && Array.isArray(npcStandImgs)) {
        const t3 = npcStandImgs[a]; npcStandImgs[a] = npcStandImgs[b]; npcStandImgs[b] = t3;
      }
    } catch (e) {}
  }

  function forceCorrectToSeat3or4() {
    try {
      if (typeof selectedNpcs === "undefined" || !Array.isArray(selectedNpcs) || selectedNpcs.length < 4) return;

      const cur = selectedNpcs.findIndex(n => n && n.isCorrect);
      if (cur < 0) return;

      const target = random([2, 3]); // ✅ 3번 또는 4번 좌석
      swapIdx(cur, target);

      for (let i = 0; i < selectedNpcs.length; i++) {
        if (!selectedNpcs[i]) continue;
        selectedNpcs[i].isCorrect = (i === target);
      }

      globalThis.correctNpcIndex = target;
    } catch (e) {}
  }

  // 1) Round1 프리로드 재사용
  if (typeof preloadRound1Assets === "function") {
    preloadRound1Assets();

    try {
      if (typeof selectedNpcs !== "undefined" && Array.isArray(selectedNpcs)) {
        const idx = selectedNpcs.findIndex(n => n && n.isCorrect);
        globalThis.correctNpcIndex = idx;
      }
    } catch (e) {}

    forceCorrectToSeat3or4();
    console.log("--- Round3 uses preloadRound1Assets() + forceCorrectToSeat(3/4) ---");
    return;
  }

  // 2) fallback 로더
  if (typeof npcData === "undefined" || typeof shuffle !== "function") {
    console.error("[Round3] npcData/shuffle/preloadRound1Assets not found. Cannot preload round3 assets.");
    return;
  }

  const allStations = Object.keys(npcData);
  shuffle(allStations);
  const roundStations = allStations.slice(0, 7);

  globalThis.currentStationName = random(roundStations);

  globalThis.stationImg = loadImage(`assets/scenery/역_${globalThis.currentStationName}.PNG`);
  globalThis.cityImg = loadImage(`assets/scenery/${globalThis.currentStationName}.png`);
  globalThis.cloudImg = loadImage("assets/scenery/구름.png");

  globalThis.selectedNpcs = [];
  roundStations.forEach(station => {
    const isCorrect = (station === globalThis.currentStationName);
    const npcPool = npcData[station];
    const npcInfo = random(npcPool);

    globalThis.selectedNpcs.push({
      station,
      spec: npcInfo.spec,
      isCorrect,
      frameCount: npcInfo.frames
    });
  });

  shuffle(globalThis.selectedNpcs);

  globalThis.correctNpcIndex = globalThis.selectedNpcs.findIndex(n => n && n.isCorrect);

  globalThis.npcAnimationFrames = [];
  globalThis.npcStandImgs = [];

  globalThis.selectedNpcs.forEach((npc, index) => {
    const frames = [];
    for (let i = 1; i <= npc.frameCount; i++) {
      frames.push(loadImage(`assets/npcChracter/sitting/${npc.station}_${npc.spec}_${i}.png`));
    }
    if (npc.isCorrect) {
      frames.push(loadImage(`assets/npcChracter/hint/${npc.station}_${npc.spec}_힌트.png`));
      globalThis.npcStandImgs[index] = loadImage(`assets/npcChracter/standing/${npc.station}_${npc.spec}_스탠딩.png`);
    }
    globalThis.npcAnimationFrames[index] = frames;
  });

  // fallback에서도 정답을 3/4로 강제(프레임/스탠딩 스왑)
  (function forceCorrectToSeat3or4_fallback() {
    try {
      const cur = globalThis.selectedNpcs.findIndex(n => n && n.isCorrect);
      if (cur < 0) return;

      const target = random([2, 3]);
      if (cur !== target) {
        const t = globalThis.selectedNpcs[cur];
        globalThis.selectedNpcs[cur] = globalThis.selectedNpcs[target];
        globalThis.selectedNpcs[target] = t;

        const t2 = globalThis.npcAnimationFrames[cur];
        globalThis.npcAnimationFrames[cur] = globalThis.npcAnimationFrames[target];
        globalThis.npcAnimationFrames[target] = t2;

        const t3 = globalThis.npcStandImgs[cur];
        globalThis.npcStandImgs[cur] = globalThis.npcStandImgs[target];
        globalThis.npcStandImgs[target] = t3;
      }

      for (let i = 0; i < globalThis.selectedNpcs.length; i++) {
        if (!globalThis.selectedNpcs[i]) continue;
        globalThis.selectedNpcs[i].isCorrect = (i === target);
      }

      globalThis.correctNpcIndex = target;
    } catch (e) {}
  })();

  console.log("--- preloadRound3Assets_SAFE fallback executed + forceCorrectToSeat(3/4) ---");
}


// =========================
// ✅ Round 3
// =========================
class Round3 {
  constructor() {
    this.x = 200;
    this.y = 480;
    this.playerDir = "right";
    this.isPlayerAutoMovingToSeat = false;
    this.playerTargetX = null;

    this.isRound2 = false;

    this.npcCurrentFrameIndex = [0,0,0,0,0,0,0];
    this.lastAnimationTime = 0;
    this.npcPositions = [];
    this.isNpc2Standing = false;
    this.npc2StandTriggerTime = null;
    this.npc2WalkStartTime = null;
    this.npc2HasLeftScreen = false;
    this.npc2OriginalSeatX = null;
    this.npc2SeatChosen = false;

    this.stage = 1;
    this.currentStationName = "";
    this.environment = new Environment(cityImg, cloudImg, stationImg);

    this.highlightedNpcIndex = -1;
    this.selectedNpcIndex = -1;
    this.isSitButtonHovered = false;
    this.hoveredSitNpcIndex = -1;
    this.isSitButtonPressed = false;
    this.sitButtonPressTime = 0;

    this.stage2StartTime = null;
    this.isStationImgActive = false;
    this.timerStartTime = null;
    this.timerWidth = 0;

    this.resultOverlayType = null;
    this.resultOverlayStartTime = null;

    this.showPressEnter = false;

    this.gameStarted = false;
    this.awaitingStart = false;

    this.introState = "playing";
    this.introScriptPlayer = null;
    this.resultScriptPlayer = null;
    this.hasPlayedIntro = false;

    this.persistentHintText = "이번 문제의 정답은 정면에 보이는 둘 중 한 사람이다.";

    this.jamsilStandingImg = null;
    this.gangnamStandingImg = null;

    this.standingOffsetX = 0;
    this.canMoveRightInStage2 = false;
    this.rightLockX = null;

    this.stage2CameraLocked = false;
    this.stage2ScrollX = 0;
    this.stage2ScrollY = 0;
    this.stage2Scale = 1;
    this.stage2YOffset = 0;

    this.eyeLightningImg = null;
    this.lightningEffectImg = null;

    this.eyeLightningStartTime = 0;
    this.lightningEffectStartTime = 0;

    this.isEyeLightningActive = false;
    this.isLightningEffectActive = false;

    this.isPreUnlockLockActive = false;
    this.preUnlockLockedX = null;
    this.preUnlockLockedY = null;

    this.stage2LockedAfterFinish = false;

    // ✅ sit here 클릭 후 결과 처리 단 1회만 보장
    this.hasResolvedChoice = false;

    // ✅✅✅ success 연출: 정답 NPC "1개만" 서서 왼쪽으로 퇴장
    this.correctNpcStandStartTime = null;
    this.correctNpcHasLeft = false;

    this.correctNpcWalkSpeed = 3;     // ✅ 느리게
    this.correctNpcStandDelay = 250;
    this.correctNpcWalkDelay = 450;

    // ✅ (중요) 중복 방지: drawNpcs가 정답 NPC를 그리지 못하게 막는 플래그
    this.correctNpcHideInDrawNpcs = false;

    // ✅ stage1 복귀했는데 sit here가 안 뜨는 케이스 자동 FAIL
    this.stage1ReturnTime = null;
    this.autoFailIfNoSitMs = 4000;

    // ✅✅✅ [추가] success일 때 빌런(잠실 서있는 캐릭터) 움직임 완전 동결
    this.freezeVillainOnSuccess = false;
    this.frozenVillainOffsetX = 0;
  }

  preloadAssets() {
    preloadRound3Assets_SAFE();

    this.jamsilStandingImg = loadImage("assets/userCharacter/유저-3 뒷모습.png");
    this.eyeLightningImg = loadImage("assets/buttons/번개 눈빛.png");
    this.lightningEffectImg = loadImage("assets/buttons/번개 효과.png");
    this.gangnamStandingImg = loadImage("assets/npcChracter/standing/강남_직장인_스탠딩.png");
  }

  setup() {
    createCanvas(1024, 869);

    for (let i = 0; i < 7; i++) {
      this.npcPositions[i] = { x: startX + i * seatSpacing, y: seatBaseY };
    }

    this.npc2OriginalSeatX = this.npcPositions[2].x;

    this.preloadAssets();
    this.environment = new Environment(cityImg, cloudImg, stationImg);

    this.forceSeat7Occupied();
    this.startIntro();
  }

  forceSeat7Occupied() {
    const idx = 6;

    if (typeof npcAnimationFrames !== "undefined" && npcAnimationFrames && npcAnimationFrames.length > idx) {
      if (npcAnimationFrames[idx] == null) {
        let donor = null;
        for (let i = 0; i < npcAnimationFrames.length; i++) {
          if (i === idx) continue;
          if (npcAnimationFrames[i] && Array.isArray(npcAnimationFrames[i]) && npcAnimationFrames[i].length > 0) {
            donor = npcAnimationFrames[i];
            break;
          }
        }
        if (donor) {
          npcAnimationFrames[idx] = donor;
          this.npcCurrentFrameIndex[idx] = 0;
        }
      }
    }

    if (typeof npcStandImgs !== "undefined" && npcStandImgs && npcStandImgs.length > idx) {
      if (npcStandImgs[idx] == null) {
        let donor = null;
        for (let i = 0; i < npcStandImgs.length; i++) {
          if (i === idx) continue;
          if (npcStandImgs[i]) {
            donor = npcStandImgs[i];
            break;
          }
        }
        if (donor) npcStandImgs[idx] = donor;
      }
    }

    if (typeof selectedNpcs !== "undefined" && selectedNpcs && selectedNpcs.length > idx) {
      if (selectedNpcs[idx] == null) {
        selectedNpcs[idx] = selectedNpcs[0] ?? { station: "강남", spec: "직장인", isCorrect: false, frameCount: 2 };
      }
    }
  }

  startPreUnlockLock() {
    this.isPreUnlockLockActive = true;
    this.preUnlockLockedX = this.x;
    this.preUnlockLockedY = this.y;
  }

  isPreUnlockMovementLocked() {
    return (this.gameStarted && this.stage === 2 && !this.canMoveRightInStage2);
  }

  updatePreUnlockLock() {
    if (!this.isPreUnlockLockActive) return;

    if (this.isPreUnlockMovementLocked()) {
      if (this.preUnlockLockedX != null) this.x = this.preUnlockLockedX;
      if (this.preUnlockLockedY != null) this.y = this.preUnlockLockedY;
    } else {
      this.isPreUnlockLockActive = false;
      this.preUnlockLockedX = null;
      this.preUnlockLockedY = null;
    }
  }

  startIntro() {
    this.stage = 1;
    this.gameStarted = false;
    this.showPressEnter = false;
    this.awaitingStart = false;

    this.introState = "playing";
    this.hasPlayedIntro = false;

    this.timerStartTime = null;
    this.stage2StartTime = null;
    if (timeBar) this.timerWidth = timeBar.width;

    this.stage2CameraLocked = false;
    this.standingOffsetX = 0;
    this.canMoveRightInStage2 = false;
    this.rightLockX = this.x;

    this.isStationImgActive = false;
    this.selectedNpcIndex = -1;
    this.isSitButtonHovered = false;
    this.hoveredSitNpcIndex = -1;

    this.isPreUnlockLockActive = false;
    this.preUnlockLockedX = null;
    this.preUnlockLockedY = null;

    this.stage2LockedAfterFinish = false;

    this.resultOverlayType = null;
    this.resultOverlayStartTime = null;
    this.resultScriptPlayer = null;
    this.hasResolvedChoice = false;

    // ✅ success 연출 상태 리셋
    this.correctNpcStandStartTime = null;
    this.correctNpcHasLeft = false;
    this.correctNpcHideInDrawNpcs = false;

    this.stage1ReturnTime = null;

    // ✅✅✅ 빌런 동결 상태도 리셋
    this.freezeVillainOnSuccess = false;
    this.frozenVillainOffsetX = 0;

    this.introScriptPlayer = new ScriptPlayer(
      round3Scripts.round3_intro,
      () => {
        this.introState = "finished";
        this.showPressEnter = true;
        this.awaitingStart = true;
        this.gameStarted = false;
      }
    );
  }

  startGameAfterOverlay() {
    this.showPressEnter = false;
    this.awaitingStart = false;

    this.gameStarted = true;
    this.timerStartTime = millis();
    this.stage2StartTime = millis();

    this.enterStage2();
  }

  enterStage2() {
    if (this.stage2LockedAfterFinish) return;

    this.stage = 2;
    if (timeBar) this.timerWidth = timeBar.width;

    this.isStationImgActive = false;
    this.selectedNpcIndex = -1;

    this.standingOffsetX = 0;
    this.canMoveRightInStage2 = false;
    this.rightLockX = this.x;

    this.stage2CameraLocked = false;

    this.isSitButtonHovered = false;
    this.hoveredSitNpcIndex = -1;

    this.forceSeat7Occupied();
    this.startPreUnlockLock();

    this.stage1ReturnTime = null;
  }

  // ✅ stage1 복귀 후 진행이 막히면 자동 FAIL
  autoFailIfSitHereNeverAppears() {
    if (this.hasResolvedChoice) return;
    if (!this.gameStarted) return;

    if (this.stage === 1 && this.isStationImgActive && this.stage1ReturnTime != null) {
      if (millis() - this.stage1ReturnTime > this.autoFailIfNoSitMs) {
        this.resolveSitChoice(false);
      }
    }
  }

  // ✅ success 시퀀스 시작: drawNpcs에서 정답 NPC를 숨기고, 우리만 "1개"를 그리게 함
  startCorrectNpcExitSequence() {
    const idx =
      (typeof globalThis.correctNpcIndex === "number" && globalThis.correctNpcIndex >= 0)
        ? globalThis.correctNpcIndex
        : 2;

    if (this.correctNpcHasLeft) return;
    if (!this.npcPositions || !this.npcPositions[idx]) return;
    if (typeof npcStandImgs === "undefined" || !npcStandImgs || !npcStandImgs[idx]) return;

    this.correctNpcStandStartTime = millis();
    this.correctNpcHideInDrawNpcs = false; // standDelay 지나면 true로 전환
  }

  updateCorrectNpcExitSequence() {
    if (this.resultOverlayType !== "success") return;
    if (this.correctNpcHasLeft) return;
    if (this.correctNpcStandStartTime == null) return;

    const idx =
      (typeof globalThis.correctNpcIndex === "number" && globalThis.correctNpcIndex >= 0)
        ? globalThis.correctNpcIndex
        : 2;

    if (!this.npcPositions || !this.npcPositions[idx]) return;

    const now = millis();

    if (now - this.correctNpcStandStartTime >= this.correctNpcStandDelay) {
      if (!this.correctNpcHideInDrawNpcs) {
        this.correctNpcHideInDrawNpcs = true;

        try {
          if (typeof npcAnimationFrames !== "undefined" && Array.isArray(npcAnimationFrames)) {
            npcAnimationFrames[idx] = [];
            this.npcCurrentFrameIndex[idx] = 0;
          }
        } catch (e) {}
      }
    }

    if (now - this.correctNpcStandStartTime >= this.correctNpcWalkDelay) {
      this.npcPositions[idx].x -= this.correctNpcWalkSpeed;
    }

    const outLeftX = -400;
    if (this.npcPositions[idx].x < outLeftX) {
      this.correctNpcHasLeft = true;
    }
  }

  drawCorrectNpcOnlyOnce_OnFrontLayer() {
    if (this.resultOverlayType !== "success") return;
    if (this.correctNpcHasLeft) return;
    if (this.correctNpcStandStartTime == null) return;

    const idx =
      (typeof globalThis.correctNpcIndex === "number" && globalThis.correctNpcIndex >= 0)
        ? globalThis.correctNpcIndex
        : 2;

    if (!this.npcPositions || !this.npcPositions[idx]) return;
    if (typeof npcStandImgs === "undefined" || !npcStandImgs || !npcStandImgs[idx]) return;

    const now = millis();
    if (now - this.correctNpcStandStartTime < this.correctNpcStandDelay) return;

    const img = npcStandImgs[idx];

    const targetH = 260;
    const s = targetH / img.height;
    const w = img.width * s;
    const h = img.height * s;

    const midX = this.npcPositions[idx].x;
    const drawX = midX - w / 2;
    const drawY = this.y - h + 30;

    image(img, drawX, drawY, w, h);
  }

  resolveSitChoice(isCorrect) {
    if (this.hasResolvedChoice) return;
    this.hasResolvedChoice = true;

    this.resultOverlayType = isCorrect ? "success" : "fail";
    this.resultOverlayStartTime = millis();

    // ✅✅✅ [핵심] success가 뜨는 순간부터 빌런(잠실 서있는 캐릭터) 완전 동결
    if (isCorrect) {
       if (typeof addSuccessScoreOnce === "function") {
    addSuccessScoreOnce(this);
  }
      this.freezeVillainOnSuccess = true;
      this.frozenVillainOffsetX = this.standingOffsetX; // 그 시점 위치로 고정
      this.isEyeLightningActive = false;
      this.isLightningEffectActive = false;

      this.startCorrectNpcExitSequence();
    }

    try {
      const key = isCorrect ? "round3_success" : "round3_fail";
      if (typeof round3Scripts !== "undefined" && round3Scripts && round3Scripts[key]) {
        this.resultScriptPlayer = new ScriptPlayer(round3Scripts[key], () => {});
      }
    } catch (e) {}
  }

  drawPersistentHintInScriptStyle() {
    if (!(this.gameStarted && this.stage === 2 && !this.isStationImgActive)) return;

    const introPlaying = (this.introState === "playing" && this.introScriptPlayer);
    const resultPlaying = (this.resultScriptPlayer && !this.resultScriptPlayer.isFinished());
    if (introPlaying || resultPlaying) return;

    const lineHeight = 40;

    push();
    if (dialogImg) {
      let dW = dialogImg.width;
      let dH = dialogImg.height;
      let dX = (width - dW) / 2;
      let dY = height - dH;

      if (dungGeunMoFont) textFont(dungGeunMoFont);
      fill(255);
      textSize(30);
      textAlign(LEFT, TOP);

      const lines = this.persistentHintText.split("\n");
      for (let i = 0; i < lines.length; i++) {
        text(lines[i], dX + 50, dY + 35 + i * lineHeight, dW - 100, lineHeight);
      }
    } else {
      fill(255);
      textSize(30);
      textAlign(LEFT, TOP);

      const lines = this.persistentHintText.split("\n");
      for (let i = 0; i < lines.length; i++) {
        text(lines[i], 30, height - 250 + i * lineHeight, width - 100, lineHeight);
      }
    }
    pop();
  }

  draw() {
    background(0);

    const worldGroundY = backgr ? backgr.height - 80 : height - 50;
    this.y = backgr ? backgr.height - 80 : worldGroundY;

    this.environment.display(this.isStationImgActive, this.stage);

    updateNpcAnimations(this);

    this.updateCorrectNpcExitSequence();
    this.autoFailIfSitHereNeverAppears();

    if (this.gameStarted) {
      handleNpcBehavior(
        this,
        worldGroundY,
        -this.x + width / 4 + 20,
        this.stage === 1 ? 1.2 : width / (4 * seatSpacing)
      );

      this.updatePreUnlockLock();

      if (!this.isPreUnlockMovementLocked()) {
        handlePlayerMovement(this);
      }

      if (this.stage === 2 && !this.canMoveRightInStage2) {
        if (this.x > this.rightLockX) this.x = this.rightLockX;
      }

      if (this.stage === 2) {
        const firstNpcX = startX;
        const sectionWidth = seatSpacing;
        const rangeStart = firstNpcX - sectionWidth / 2 - 115;
        const rangeEnd = rangeStart + sectionWidth * 7;

        this.highlightedNpcIndex = -1;
        if (this.x >= rangeStart && this.x < rangeEnd) {
          let idx = Math.floor((this.x - rangeStart) / sectionWidth);
          if (idx === 2 || idx === 3) this.highlightedNpcIndex = idx;
        }
      } else {
        this.highlightedNpcIndex = -1;
      }
    } else {
      this.highlightedNpcIndex = -1;
      this.selectedNpcIndex = -1;
      this.isSitButtonHovered = false;
      this.hoveredSitNpcIndex = -1;
    }

    let playerRightBoundary = backgr ? backgr.width - 350 : width - 350;
    this.x = constrain(this.x, 0, playerRightBoundary);

    // ===== 잠실 역 서있는 캐릭터 위치 계산 =====
    let standExists = false, standW, standH, standX, standY, standMidX, standMidY;

    if (this.jamsilStandingImg && this.npcPositions.length >= 4) {
      const seat3 = this.npcPositions[2];
      const seat4 = this.npcPositions[3];

      const baseMidX = (seat3.x + seat4.x) / 2;
      const scaleFactor = playerScale / this.jamsilStandingImg.height;

      standW = this.jamsilStandingImg.width * scaleFactor;
      standH = this.jamsilStandingImg.height * scaleFactor;

      // ✅✅✅ success면 frozenVillainOffsetX로 고정, 아니면 기존 standingOffsetX 사용
      const offsetX = (this.freezeVillainOnSuccess ? this.frozenVillainOffsetX : this.standingOffsetX);

      standMidX = baseMidX + offsetX;
      standX = standMidX - standW / 2;

      standY = this.y - standH + 30;
      standMidY = standY + standH / 2;

      standExists = true;

      if (this.gameStarted && this.stage === 2) {
        const unlockX = seat4.x + seatSpacing;
        if (!this.canMoveRightInStage2 && standMidX >= unlockX) {
          this.canMoveRightInStage2 = true;
          this.isEyeLightningActive = false;
          this.isLightningEffectActive = false;

          this.isPreUnlockLockActive = false;
          this.preUnlockLockedX = null;
          this.preUnlockLockedY = null;
        }
      }
    }

    // ===== 카메라 / 스케일 계산 =====
    const visibleSeats = 4;
    let stageScale, scrollX, scrollY, worldShiftY = 0, stage2YOffset = 0;

    if (this.stage === 1) {
      stageScale = 1.2;

      let offsetX = width / 4 + 20;
      let offsetY = height / 4 + 20;

      scrollX = offsetX;
      scrollY = -this.y + offsetY;

      if (backgr) {
        scrollX = constrain(scrollX, -backgr.width + width / stageScale, 0);
        scrollY = constrain(scrollY, -backgr.height + height / stageScale, 0);
      }

      let topScreenY = (scrollY - 50) * stageScale;
      if (topScreenY > 0) worldShiftY = -topScreenY / stageScale;
    } else {
      if (!this.stage2CameraLocked) {
        stageScale = width / (visibleSeats * seatSpacing);
        stageScale *= 0.92;
        stage2YOffset = 100;

        if (standExists) {
          const Tx = width / (2 * stageScale) - standMidX;
          const Ty = height / (2 * stageScale) - standMidY;

          scrollX = Tx + 50;
          scrollY = Ty + 50 - stage2YOffset;
        } else {
          scrollX = -this.x + 200;
          scrollY = -this.y + 200;
        }

        this.stage2Scale = stageScale;
        this.stage2ScrollX = scrollX;
        this.stage2ScrollY = scrollY;
        this.stage2YOffset = stage2YOffset;
        this.stage2CameraLocked = true;
      }

      stageScale = this.stage2Scale;
      scrollX = this.stage2ScrollX;
      scrollY = this.stage2ScrollY;
      stage2YOffset = this.stage2YOffset;
    }

    stageScale = constrain(stageScale, 1.2, 4.0);

    // ===== 월드 좌표계 마우스 =====
    const stage2YOffsetForMouse = stage2YOffset;
    let worldMouseX = mouseX / stageScale - (scrollX - 50);
    let worldMouseY = mouseY / stageScale - (scrollY - 50 + worldShiftY + stage2YOffsetForMouse);

    // ===== 실제 그리기 =====
    push();
    scale(stageScale);
    translate(scrollX - 50, scrollY - 50 + worldShiftY + stage2YOffset);

    if (backgr) image(backgr, 0, 0, backgr.width, backgr.height);

    const npcBottomY = drawNpcs(this, worldMouseX, worldMouseY);
    drawPlayer(this, npcBottomY);

    // ✅ 기존 서있는 캐릭터(잠실) 렌더
    if (standExists) {
      image(this.jamsilStandingImg, standX, standY, standW, standH);
    }

    // ✅ success 정답 NPC: "오직 1개만" + "앞 레이어" + "왼쪽 퇴장"
    this.drawCorrectNpcOnlyOnce_OnFrontLayer();

    if (this.gameStarted && this.isEyeLightningActive && !this.canMoveRightInStage2) {
      if (millis() - this.eyeLightningStartTime < 500) {
        let eyeX = this.x + 150;
        let eyeY = this.y - 280;
        image(this.eyeLightningImg, eyeX, eyeY, 160, 160);
      } else {
        this.isEyeLightningActive = false;
      }
    }

    if (this.gameStarted && this.isLightningEffectActive && standExists && !this.canMoveRightInStage2) {
      if (millis() - this.lightningEffectStartTime < 500) {
        let fxX = standMidX - 50;
        let fxY = standY - 60;
        image(this.lightningEffectImg, fxX, fxY, 160, 160);
      } else {
        this.isLightningEffectActive = false;
      }
    }

    pop();

    drawUi(this);
    this.drawPersistentHintInScriptStyle();

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

        this.stage2LockedAfterFinish = true;

        this.stage1ReturnTime = millis();

        if (this.selectedNpcIndex === -1) {
          this.resolveSitChoice(false);
        }
      }
    }
  }

  keyPressed() {
    if (this.introState === "playing" && this.introScriptPlayer) {
      if (keyCode === 32) this.introScriptPlayer.next();
      return false;
    }

    if (this.awaitingStart && this.showPressEnter) {
      if (keyCode === 32) this.startGameAfterOverlay();
      return false;
    }

    if (!this.gameStarted) return false;

    if (this.resultScriptPlayer && !this.resultScriptPlayer.isFinished()) {
      if (keyCode === 32) this.resultScriptPlayer.next();
      return false;
    }

    // ✅✅✅ success 확정 후에는 빌런 포함 “키 입력으로 움직임” 전부 차단
    // (특히 ENTER로 standingOffsetX 밀기 방지)
    if (this.resultOverlayType === "success") {
      return false;
    }

    if (this.isPreUnlockMovementLocked()) {
      if (keyCode !== ENTER) return false;
    }

    if (keyCode === 32) {
      if (this.stage === 1) {
        if (!this.stage2LockedAfterFinish) this.enterStage2();
      } else if (this.stage === 2) {
        this.isStationImgActive = true;
        this.stage = 1;
        this.selectedNpcIndex = this.highlightedNpcIndex;
        this.stage2StartTime = null;

        this.stage2LockedAfterFinish = true;

        this.stage1ReturnTime = millis();

        if (this.selectedNpcIndex === -1) {
          this.resolveSitChoice(false);
        }
      }
    }

    if (keyCode === ENTER && this.stage === 2) {
      if (!this.canMoveRightInStage2) {
        // ✅ (success는 위에서 return false로 이미 차단됨)
        this.standingOffsetX += 5;

        this.isEyeLightningActive = true;
        this.eyeLightningStartTime = millis();

        this.isLightningEffectActive = true;
        this.lightningEffectStartTime = millis();

        if (this.isPreUnlockLockActive) {
          this.preUnlockLockedX = this.x;
          this.preUnlockLockedY = this.y;
        }
      }
    }

    return false;
  }

  mousePressed() {
    if (!this.gameStarted) return;

    if (
      stopBtnX !== undefined &&
      mouseX >= stopBtnX && mouseX <= stopBtnX + stopBtnW &&
      mouseY >= stopBtnY && mouseY <= stopBtnY + stopBtnH
    ) {
      if (typeof switchToStopScreen === "function") switchToStopScreen();
      return;
    }

    if (
      quitBtnX !== undefined &&
      mouseX >= quitBtnX && mouseX <= quitBtnX + quitBtnW &&
      mouseY >= quitBtnY && mouseY <= quitBtnY + quitBtnH
    ) {
      if (typeof switchToQuitScreen === "function") switchToQuitScreen();
      return;
    }

    if (
      settingBtnX !== undefined &&
      mouseX >= settingBtnX && mouseX <= settingBtnX + settingBtnW
      && mouseY >= settingBtnY && mouseY <= settingBtnY + settingBtnH
    ) {
      if (typeof switchToSettingsScreen === "function") switchToSettingsScreen();
      return;
    }

    // ✅ sit here hover → 클릭 시 정답/오답 확정
    if (this.isSitButtonHovered) {
      this.isSitButtonPressed = true;
      this.sitButtonPressTime = millis();
      this.isStationImgActive = true;
      this.npc2StandTriggerTime = millis();

      let chosenIndex =
        this.hoveredSitNpcIndex !== -1 ? this.hoveredSitNpcIndex : this.selectedNpcIndex;

      const correctSeatIndex =
        (typeof globalThis.correctNpcIndex === "number" && globalThis.correctNpcIndex >= 0)
          ? globalThis.correctNpcIndex
          : 2;

      this.npc2SeatChosen = (chosenIndex === correctSeatIndex);

      this.resolveSitChoice(this.npc2SeatChosen);

      this.isSitButtonHovered = false;
      this.hoveredSitNpcIndex = -1;

      return;
    }
  }
}
