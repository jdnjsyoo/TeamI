let scriptBgSound;
let roundPlayingSound;

// 모든 역의 NPC 정보를 담는 객체
const npcData = {
    "강남": [{ spec: "명품", frames: 2 }, { spec: "직장인", frames: 2 }, { spec: "화장", frames: 2 }],
    "강변": [{ spec: "군인", frames: 2 }, { spec: "백팩", frames: 2 }, { spec: "캐리어", frames: 3 }],
    "서울대입구": [{ spec: "잠", frames: 2 }, { spec: "책", frames: 2 }],
    "성수": [{ spec: "쇼핑백", frames: 2 }, { spec: "폰", frames: 2 }],
    "시청": [{ spec: "서류", frames: 3 }, { spec: "집회", frames: 2 }],
    "을지로": [{ spec: "외국인", frames: 2 }, { spec: "힙합", frames: 3 }],
    "잠실": [{ spec: "코트", frames: 2 }, { spec: "학생", frames: 2 }],
    "홍대": [{ spec: "보드", frames: 2 }, { spec: "애니", frames: 3 }, { spec: "탈색", frames: 3 }]
};

const stage2DurationRound1 = 30000; // 라운드 1의 stage 2 지속 시간: 30초

// Fisher-Yates shuffle to randomize array in place
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

let correctNpcIndex = -1; // 정답 NPC의 인덱스를 저장할 전역 변수
let selectedNpcs = []; // 선택된 NPC 정보를 저장할 전역 변수

function preloadRound1Assets() {
    // 1. 역 선택 로직 (RandomLogic.md 기반으로 수정)
    const allStations = Object.keys(npcData);
    shuffle(allStations);
    const roundStations = allStations.slice(0, 7); // 이번 라운드에 사용할 7개의 역

    // 2. 정답 역(currentStationName) 설정
    currentStationName = random(roundStations); 

    // 3. 역 관련 에셋 로드
    stationImg = loadImage(`assets/scenery/역_${currentStationName}.PNG`);
    cityImg = loadImage(`assets/scenery/${currentStationName}.png`);
    cloudImg = loadImage('assets/scenery/구름.png');

    // 4. 7명의 NPC 정보 생성
    selectedNpcs = [];
    roundStations.forEach(station => {
        const isCorrect = (station === currentStationName);
        const npcPool = npcData[station];
        const npcInfo = random(npcPool);
        
        selectedNpcs.push({
            station: station,
            spec: npcInfo.spec,
            isCorrect: isCorrect,
            frameCount: npcInfo.frames
        });
    });

    // 5. 최종 NPC 리스트 랜덤화 (자리 배치)
    shuffle(selectedNpcs);

    // 6. 선택된 NPC 에셋 로드 (이미지 로딩)
    npcAnimationFrames = [];
    npcStandImgs = []; 

    selectedNpcs.forEach((npc, index) => {
        let frames = [];
        // sitting 이미지 로드
        for (let i = 1; i <= npc.frameCount; i++) {
            frames.push(loadImage(`assets/npcChracter/sitting/${npc.station}_${npc.spec}_${i}.png`));
        }

        // 정답 NPC인 경우 hint 이미지 추가
        if (npc.isCorrect) {
            frames.push(loadImage(`assets/npcChracter/hint/${npc.station}_${npc.spec}_힌트.png`));
            // 정답 NPC의 standing 이미지 로드
            npcStandImgs[index] = loadImage(`assets/npcChracter/standing/${npc.station}_${npc.spec}_스탠딩.png`);
        }
        npcAnimationFrames[index] = frames;
    });

    // 사운드 로드
    if (typeof loadSound === 'function') {
        scriptBgSound = loadSound('assets/sound/script_bg.wav', () => {
            scriptBgSound.setVolume(0.5); // 기본 볼륨 50%
        });
        roundPlayingSound = loadSound('assets/sound/round_playing.mp3', () => {
            roundPlayingSound.setVolume(0.5); // 기본 볼륨 50%
        });
    }

    console.log("--- preloadRound1Assets executed ---");
}


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
    
    // --- Refactored NPC state ---
    this.npcStandingIndex = -1; // 일어설 NPC의 인덱스
    this.npcStandTriggerTime = null;
    this.npcWalkStartTime = null;
    this.npcHasLeftScreen = false;
    this.playerShouldSit = false; // 플레이어가 앉아야 하는지 여부
    this.targetSeatX = null; // 플레이어가 앉을 좌석의 X 좌표
    this.playerMoveStartTime = null;
    this.npcIsActuallyWalking = false;

    // Game flow state
    this.stage = 1;
    this.currentStationName = ''; // setup에서 할당
    this.correctNpcIndex = -1; // setup에서 할당
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

    // 인트로 시작 시 배경 음악 재생
      if (scriptBgSound && scriptBgSound.isLoaded() && !scriptBgSound.isPlaying()) {
        scriptBgSound.loop();
    }

    // 스크립트 플레이어 생성 및 인트로 시작
    this.introScriptPlayer = new ScriptPlayer(round1Scripts.round1_intro, () => {
      // 스크립트 완료 콜백
      this.introState = 'finished';
      this.showPressEnter = true;   // "PRESS SPACE" 메시지 표시
      this.awaitingStart = true;    // 최종 스페이스바 입력 대기
      // 인트로 완료 시 배경 음악 중지
      if (scriptBgSound && scriptBgSound.isPlaying()) {
          scriptBgSound.stop();
      }
    });
  }

  setDebugColor(c) {
    this.debugColor = c;
  }

  setup() {
    // preload에서 로드된 정보를 기반으로 인스턴스 변수 설정
    this.correctNpcIndex = selectedNpcs.findIndex(npc => npc.isCorrect);
    this.currentStationName = currentStationName; // 전역 변수에서 가져오기

    createCanvas(1024, 869);

    for (let i = 0; i < 7; i++) {
      this.npcPositions[i] = {
        x: startX + i * seatSpacing,
        y: seatBaseY,
      };
    }
    
    console.log("--- Round1.setup() Debug Info ---");
    console.log("Correct NPC Index (instance):", this.correctNpcIndex);
    console.log("Selected NPCs:", selectedNpcs);
    console.log("---------------------------------");
  }
  
  // ... (enterStage2, draw, keyPressed는 일단 유지)

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
    // 인트로 음악이 재생 중이었다면 중지
      if (scriptBgSound && scriptBgSound.isLoaded() && scriptBgSound.isPlaying()) {
        scriptBgSound.stop();
    }
    // 게임 플레이 음악 시작
      if (roundPlayingSound && roundPlayingSound.isLoaded() && !roundPlayingSound.isPlaying()) {
        roundPlayingSound.loop();
    }
  }

  draw() {
    // (3초 대기 없이) 인트로 마지막 줄과 동시에 showPressEnter 표시
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
        const playerCenterX = this.x + playerScale / 2; // 플레이어 중심 X좌표
        const firstNpcX = startX;
        const sectionWidth = seatSpacing;
        const rangeStart = firstNpcX - sectionWidth / 2; // 첫 NPC의 하이라이트 시작 범위
        const numNpcs = 7;
        const rangeEnd = rangeStart + sectionWidth * numNpcs;

        this.highlightedNpcIndex = -1;
        if (playerCenterX >= rangeStart && playerCenterX < rangeEnd) {
          const relativeX = playerCenterX - rangeStart;
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

      const camPad = 50;
      const viewW = width / stageScale;

      let scrollX;
      if (this.stage === 2) {
      const playerCenterX = this.x + playerScale / 2;

     // ✅ 플레이어 중심을 화면 "중앙"에 두도록 카메라 즉시 추적
     scrollX = -playerCenterX + viewW / 2;

     // ✅ camPad 반영!
     scrollX = constrain(scrollX, -backgr.width + viewW + camPad, camPad);

      } else {
     scrollX = offsetX; // (=0+offsetX)
     scrollX = constrain(scrollX, -backgr.width + viewW + camPad, camPad);
     }


      
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
    
    // 플레이어 이동 타이머 체크
    if (this.playerMoveStartTime !== null && millis() >= this.playerMoveStartTime) {
      if (this.playerShouldSit) {
          this.isPlayerAutoMovingToSeat = true;
      }
      this.playerMoveStartTime = null; // 한 번만 실행되도록 초기화
    }

    // Check if the player has just sat down to show success overlay
    if (this.playerDir === 'sit' && this.resultOverlayType === 'success' && this.resultOverlayStartTime === null) {
        this.resultOverlayStartTime = millis();
    }
    drawUi(this);

    if (this.gameStarted && this.stage === 2 && this.stage2StartTime !== null && !this.isStationImgActive) {
      if (millis() - this.stage2StartTime >= stage2DurationRound1) {
        this.isStationImgActive = true;
        this.stage = 1;
        this.selectedNpcIndex = this.highlightedNpcIndex;
        this.stage2StartTime = null;
        // Stage 2 타이머가 끝나서 Stage 1으로 돌아올 때 음악 변경
          if (roundPlayingSound && roundPlayingSound.isLoaded() && roundPlayingSound.isPlaying()) {
            roundPlayingSound.stop();
        }
        if (scriptBgSound && !scriptBgSound.isPlaying()) {
            if (scriptBgSound.isLoaded()) {
              scriptBgSound.loop();
            }
        }
      }
    }
  }

  // 키 눌림 이벤트 핸들러
  keyPressed() {
    // 디버깅: 'p' 키로 인트로 마지막 줄로 이동
    if (key === 'p' || key === 'P') {
      if (this.introScriptPlayer && this.introState === 'playing') {
        this.introScriptPlayer.currentLineIndex = this.introScriptPlayer.lines.length - 1;
        this.introScriptPlayer.typingIndex = this.introScriptPlayer.lines[this.introScriptPlayer.currentLineIndex].length;
        this.introScriptPlayer.displayedText = this.introScriptPlayer.lines[this.introScriptPlayer.currentLineIndex];
        this.introScriptPlayer.state = 'waiting';
        this.introScriptPlayer.lineWaitStartTime = millis();
      }
      return false;
    }

     // ✅ 바로 2라운드 넘어가는 L 치트키 (디버그용)
  if (key === 'l' || key === 'L') {
    if (typeof switchToRound2 === "function") {
      switchToRound2();
      
    }
    console.log("DEBUG: Force switch to Round 2 by L key");
    return false;   // 다른 키 처리 안 하도록 바로 종료
  }

    if (this.resultScriptPlayer) {
      if (keyCode === 32) { // 스페이스바
        if (!this.resultScriptPlayer.isFinished()) {
          this.resultScriptPlayer.next();
        }
      }
      if ((key === 'n' || key === 'N') && this.resultScriptPlayer.isFinished()) {
        // resultScriptPlayer가 끝난 후에만 round2로 넘어감
        if (typeof switchToRound2 === "function") {
          switchToRound2();
        }
        console.log("Switching to Round 2!");
        return true; // round2로 넘어갔으니 true 반환
      }
      // n키가 아니면 false 반환
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
          // Stage 2에서 Stage 1으로 돌아올 때 음악 변경
          if (roundPlayingSound && roundPlayingSound.isPlaying()) {
              roundPlayingSound.stop();
          }
          if (scriptBgSound && !scriptBgSound.isPlaying()) {
              scriptBgSound.loop();
          }
        }
      }
    }
    // 게임 중에는 n키로 round2로 넘어가지 않음 (위에서만 처리)
    return false; // 기본 키 동작 방지
  }


  // 마우스 클릭 이벤트 핸들러
  mousePressed() {
    if (!this.gameStarted || this.resultOverlayType) return; // 게임 시작 전 또는 결과 화면이 표시된 후에는 클릭 무시

    // --- UI 버튼들 (stop, quit, setting) ---
    if (
      stopBtnX !== undefined &&
      mouseX >= stopBtnX && mouseX <= stopBtnX + stopBtnW &&
      mouseY >= stopBtnY && mouseY <= stopBtnY + stopBtnH
    ) {
      if (typeof switchToStopScreen === "function") switchToStopScreen();
      return;
    }
    // ... (quit, setting 버튼 로직은 동일) ...
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
      this.isSitButtonPressed = true; // 버튼 눌림 상태 활성화
      this.sitButtonPressTime = millis();
      
      // 정답 확인 로직
      console.log("--- mousePressed Debug Info (Sit Here Button) ---");
      console.log("Hovered NPC Index:", this.hoveredSitNpcIndex);
      console.log("Correct NPC Index (instance):", this.correctNpcIndex);
      console.log("Comparison result (hovered === correct):", this.hoveredSitNpcIndex === this.correctNpcIndex);

      if (this.hoveredSitNpcIndex === this.correctNpcIndex) {
        // --- 정답 ---
        this.resultOverlayType = 'success';
        this.npcStandingIndex = this.correctNpcIndex;
        this.npcStandTriggerTime = millis();
        this.playerShouldSit = false; // 일단 false, 2초 뒤 true로
        this.targetSeatX = this.npcPositions[this.correctNpcIndex].x;
        this.playerDir = "right"; // 일단 방향 유지
        // 성공 스크립트 실행
        this.resultScriptPlayer = new ScriptPlayer(round1Scripts.round1_success, () => {
          console.log("Success script finished.");
        });
        // 2초 뒤에 플레이어 착석 처리 (추가 이동 없이)
        setTimeout(() => {
          this.playerDir = "sit";
          this.playerShouldSit = true;
        }, 4000);
        console.log("Decision: SUCCESS");
      } else {
        // --- 오답 ---
        this.resultOverlayType = 'fail';
        this.resultOverlayStartTime = millis(); // 실패 오버레이는 즉시 표시
        // 실패 시에도 정답 NPC가 일어나 나가도록 처리
        this.npcStandingIndex = this.correctNpcIndex;
        this.npcStandTriggerTime = millis();
        this.playerShouldSit = false; // 플레이어는 움직이지 않음
        this.targetSeatX = null; 
        
         // 실패 스크립트 실행
        this.resultScriptPlayer = new ScriptPlayer(round1Scripts.round1_fail, () => {
        });
      }
      return;
    }
  }
}