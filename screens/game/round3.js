// Round 3
class Round3 {
  constructor() {
    this.x = 200;
    this.y = 480;
    this.playerDir = "right";
    this.isPlayerAutoMovingToSeat = false;
    this.playerTargetX = null;

    this.npcCurrentFrameIndex = [0,0,0,0,0,0,0];
    this.lastAnimationTime = 0;
    this.npcPositions = [];
    this.isNpc2Standing = false;
    this.npc2StandTriggerTime = null;
    this.npc2WalkStartTime = null;
    this.npc2HasLeftScreen = false;
    this.npc2OriginalSeatX = null;   // ⭐ 어떤 좌석의 애가 일어날지 기준 X
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
    this.gameStarted = true;
    this.awaitingStart = false;

    // ⭐ 인트로 / 결과 스크립트 관련 상태
    this.introState = "idle";          // 'idle' | 'playing' | 'finished'
    this.introScriptPlayer = null;
    this.resultScriptPlayer = null;
    this.hasPlayedIntro = false;       // 인트로 한 번만 재생하기 위한 플래그

    this.jamsilStandingImg = null;
    this.gangnamStandingImg = null; // 추가된 부분

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
  }

  preloadAssets() {
    // 유저 캐릭터 잠실 역에서 서 있는 이미지
    this.jamsilStandingImg = loadImage(
      "assets/userCharacter/유저-3 뒷모습.png"
    );
    // 번개 효과
    this.eyeLightningImg = loadImage("assets/buttons/번개 눈빛.png");
    this.lightningEffectImg = loadImage("assets/buttons/번개 효과.png");

    // 🔹 3번 캐릭터가 서 있을 때 쓸 강남 직장인 스탠딩 이미지는
    this.gangnamStandingImg = loadImage("assets/npcChracter/standing/강남_직장인_스탠딩.png");

    // npc 쪽 로딩/드로잉 코드(drawNpcs)에서
    // "assets/npcCharacter/standing/강남_직장인_스탠딩.png"
    // 으로 이미 세팅해 둔 걸로 가정하고 사용하게 될 거야.
  }

  setup() {
    createCanvas(1024, 869);

    for (let i = 0; i < 7; i++) {
      this.npcPositions[i] = {
        x: startX + i * seatSpacing,
        y: seatBaseY,
      };
    }

    // 🔥 여기에서 “일어나는 NPC” 기준 좌석을 2번 → 3번으로 변경
    //    index 2 = 세 번째 좌석
    this.npc2OriginalSeatX = this.npcPositions[2].x;

    this.preloadAssets();
    this.enterStage2();
  }

  enterStage2() {
    this.stage = 2;

    // 인트로/타이머 초기화
    this.stage2StartTime = null;
    this.timerStartTime = null;
    if (timeBar) this.timerWidth = timeBar.width;

    this.isStationImgActive = false;
    this.selectedNpcIndex = -1;
    this.showPressEnter = false;

    this.standingOffsetX = 0;
    this.canMoveRightInStage2 = false;
    this.rightLockX = this.x;

    this.stage2CameraLocked = false;

    this.isSitButtonHovered = false;
    this.hoveredSitNpcIndex = -1;

    // ⭐ 아직 인트로를 안 본 경우 → 여기서 처음 한 번만 재생
    if (!this.hasPlayedIntro && typeof round3Scripts !== "undefined" && round3Scripts.round3_intro) {
      this.introScriptPlayer = new ScriptPlayer(
        round3Scripts.round3_intro,
        () => {
          // 인트로 끝난 시점에서부터 타이머/제한시간 시작
          this.introState = "finished";
          this.hasPlayedIntro = true;
          this.timerStartTime = millis();
          this.stage2StartTime = millis();
        }
      );
      this.introState = "playing";
    } else {
      // 이미 인트로 본 적 있으면 바로 게임 시작
      this.introState = "finished";
      this.timerStartTime = millis();
      this.stage2StartTime = millis();
    }
  }

  draw() {
    background(0);

    if (this.gameStarted) {
      const worldGroundY = backgr ? backgr.height - 80 : height - 50;

      // NPC 애니메이션 / 행동
      updateNpcAnimations(this);
      handleNpcBehavior(
        this,
        worldGroundY,
        -this.x + width / 4 + 20,
        this.stage === 1 ? 1.2 : width / (4 * seatSpacing)
      );

      // 플레이어 y는 항상 바닥 라인 유지
      this.y = backgr ? backgr.height - 80 : worldGroundY;

      // 배경 그리기
      this.environment.display(this.isStationImgActive, this.stage);

      // 플레이어 이동
      handlePlayerMovement(this);

      // Stage2 초기 우측 이동 락
      if (this.stage === 2 && !this.canMoveRightInStage2) {
        if (this.x > this.rightLockX) this.x = this.rightLockX;
      }

      // Hover 가능한 좌석: 3번, 4번만
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

      // 플레이어 x 범위 제한 (우측 끝에서 벽 충돌 방지)
      let playerRightBoundary = backgr.width - 350;
      this.x = constrain(this.x, 0, playerRightBoundary);

      // 잠실 역 서있는 캐릭터 위치 계산
      let standExists = false,
          standW,
          standH,
          standX,
          standY,
          standMidX,
          standMidY;

      if (this.jamsilStandingImg && this.npcPositions.length >= 4) {
        const seat3 = this.npcPositions[2];
        const seat4 = this.npcPositions[3];

        const baseMidX = (seat3.x + seat4.x) / 2;
        const scaleFactor = playerScale / this.jamsilStandingImg.height;

        standW = this.jamsilStandingImg.width * scaleFactor;
        standH = this.jamsilStandingImg.height * scaleFactor;

        standMidX = baseMidX + this.standingOffsetX;
        standX = standMidX - standW / 2;
        // 유저 NPC와 같은 선상에 맞추기
        standY = this.y - standH + 30;
        standMidY = standY + standH / 2;

        standExists = true;

        const unlockX = seat4.x + seatSpacing;
        if (!this.canMoveRightInStage2 && standMidX >= unlockX) {
          this.canMoveRightInStage2 = true;
          this.isEyeLightningActive = false;
          this.isLightningEffectActive = false;
        }
      }

      // ===== 카메라 / 스케일 계산 =====
      const visibleSeats = 4;
      let stageScale,
          scrollX,
          scrollY,
          worldShiftY = 0,
          stage2YOffset = 0;

      if (this.stage === 1) {
        stageScale = 1.2;

        let offsetX = width / 4 + 20;
        let offsetY = height / 4 + 20;

        scrollX = offsetX;
        scrollY = -this.y + offsetY;

        scrollX = constrain(scrollX, -backgr.width + width / stageScale, 0);
        scrollY = constrain(scrollY, -backgr.height + height / stageScale, 0);

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

      // ===== 월드 좌표계로 변환된 마우스 위치 계산 (⭐ sit here hover용 핵심) =====
      const stage2YOffsetForMouse = stage2YOffset; // stage1일 땐 0, stage2일 땐 100
      let worldMouseX = mouseX / stageScale - (scrollX - 50);
      let worldMouseY = mouseY / stageScale - (scrollY - 50 + worldShiftY + stage2YOffsetForMouse);

      // ===== 실제 그리기 =====
      push();
      scale(stageScale);
      translate(scrollX - 50, scrollY - 50 + worldShiftY + stage2YOffset);

      image(backgr, 0, 0, backgr.width, backgr.height);

      // drawNpcs에 월드 기준 마우스 좌표 넘겨줌
      const npcBottomY = drawNpcs(this, worldMouseX, worldMouseY);
      drawPlayer(this, npcBottomY);

      if (standExists) {
        image(this.jamsilStandingImg, standX, standY, standW, standH);
      }

      // 눈 번개
      if (this.isEyeLightningActive && !this.canMoveRightInStage2) {
        if (millis() - this.eyeLightningStartTime < 500) {
          let eyeX = this.x + 150;
          let eyeY = this.y - 280;
          image(this.eyeLightningImg, eyeX, eyeY, 160, 160);
        } else {
          this.isEyeLightningActive = false;
        }
      }

      // 머리 번개
      if (this.isLightningEffectActive && standExists && !this.canMoveRightInStage2) {
        if (millis() - this.lightningEffectStartTime < 500) {
          let fxX = standMidX - 50;
          let fxY = standY - 60;
          image(this.lightningEffectImg, fxX, fxY, 160, 160);
        } else {
          this.isLightningEffectActive = false;
        }
      }

      pop();
    }

    // UI는 항상
    drawUi(this);

    // Stage 2 타임아웃 → Stage 1 복귀
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

  keyPressed() {
    // ⭐ 인트로 스크립트 재생 중이면 스페이스로만 넘기기
    if (this.introState === "playing" && this.introScriptPlayer) {
      if (keyCode === 32) { // SPACE
        this.introScriptPlayer.next();
        return false;
      }
    }

    // ⭐ 결과 스크립트 재생 중이면 스페이스로만 넘기기
    if (this.resultScriptPlayer && !this.resultScriptPlayer.isFinished()) {
      if (keyCode === 32) { // SPACE
        this.resultScriptPlayer.next();
        return false;
      }
    }

    // 원래 있던 로직
    if (keyCode === 32) {
      if (this.stage === 1) {
        this.enterStage2();
      } else if (this.stage === 2) {
        this.isStationImgActive = true;
        this.stage = 1;
        this.selectedNpcIndex = this.highlightedNpcIndex;
        this.stage2StartTime = null;
      }
    }

    if (keyCode === ENTER && this.stage === 2) {
      if (!this.canMoveRightInStage2) {
        this.standingOffsetX += 5;

        this.isEyeLightningActive = true;
        this.eyeLightningStartTime = millis();

        this.isLightningEffectActive = true;
        this.lightningEffectStartTime = millis();
      }
    }

    return false;
  }

  mousePressed() {
    if (!this.gameStarted) return;

    // stop 버튼
    if (stopBtnX !== undefined &&
        mouseX >= stopBtnX && mouseX <= stopBtnX + stopBtnW &&
        mouseY >= stopBtnY && mouseY <= stopBtnY + stopBtnH) {
      if (typeof switchToStopScreen === "function") switchToStopScreen();
      return;
    }

    // quit 버튼
    if (quitBtnX !== undefined &&
        mouseX >= quitBtnX && mouseX <= quitBtnX + quitBtnW &&
        mouseY >= quitBtnY && mouseY <= quitBtnY + quitBtnH) {
      if (typeof switchToQuitScreen === "function") switchToQuitScreen();
      return;
    }

    // setting 버튼
    if (settingBtnX !== undefined &&
        mouseX >= settingBtnX && mouseX <= settingBtnX + settingBtnW &&
        mouseY >= settingBtnY && mouseY <= settingBtnY + settingBtnH) {
      if (typeof switchToSettingsScreen === "function") switchToSettingsScreen();
      return;
    }

    // --- sit here 버튼 클릭 ---
    if (this.isSitButtonHovered) {
      this.isSitButtonPressed = true;
      this.sitButtonPressTime = millis();
      this.isStationImgActive = true;
      this.npc2StandTriggerTime = millis();

      // hover 인덱스가 잡혀 있으면 그걸 쓰고, 아니면 Stage2에서 선택된 좌석 인덱스 사용
      let chosenIndex =
        this.hoveredSitNpcIndex !== -1 ? this.hoveredSitNpcIndex : this.selectedNpcIndex;

      // ✅ 정답: 3번 좌석 (index 2)
      const correctSeatIndex = 2;
      this.npc2SeatChosen = (chosenIndex === correctSeatIndex);

      this.isSitButtonHovered = false;
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
