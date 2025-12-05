function gameScreenSetup() {
  // 고정 캔버스 사이즈 (요청대로)
  createCanvas(1024, 869);

  // 좌석 위치 설정
  for (let i = 0; i < 7; i++) {
    npcPositions[i] = {
      x: startX + i * seatSpacing,
      y: seatBaseY
    };
  }

  // ⭐ 2번 좌석 원래 위치 저장 (왼쪽에서 두 번째, 좌석 중심 X)
  npc2OriginalSeatX = npcPositions[1].x;
}

// Stage 2로 전환하는 헬퍼 함수
function enterStage2() {
  stage = 2;
  stage2StartTime = millis();
  isStationImgActive = false;
  selectedNpcIndex = -1;
  showPressEnter = false;

  // Initialize timer
  timerStartTime = millis();
  if (timeBar) {
    timerWidth = timeBar.width;
  }
}

function gameScreenDraw() {
  background(0);

  const worldGroundY = backgr ? backgr.height - 80 : height - 50;

  // 1. 상태 업데이트
  updateNpcAnimations();
  handleNpcBehavior(worldGroundY,-x + (width / 4 + 20), (stage === 1) ? 1.2 : (width / (4 * seatSpacing)));


  // 플레이어는 배경(world) 기준 바닥에 고정
  y = backgr ? backgr.height - 80 : groundY;

  // Stage 1: 창밖 풍경은 화면 좌표로 렌더(월드 변환 이전)
  if (stage === 1) drawOutside();
  
  handlePlayerMovement();

  // stage 2에서 플레이어 위치에 따라 NPC 하이라이트
  if (stage === 2) {
    const firstNpcX = startX; // npcPositions[0].x와 동일
    const sectionWidth = seatSpacing;
    const rangeStart = firstNpcX - sectionWidth / 2 - 115;

    // 플레이어의 x 좌표가 전체 NPC 구간 내에 있는지 확인
    const numNpcs = 7;
    const rangeEnd = rangeStart + sectionWidth * numNpcs;

    highlightedNpcIndex = -1; // 매 프레임 초기화
    if (x >= rangeStart && x < rangeEnd) {
      const relativeX = x - rangeStart;
      const index = Math.floor(relativeX / sectionWidth);
      highlightedNpcIndex = constrain(index, 0, numNpcs - 1);
    }
  } else {
    highlightedNpcIndex = -1; // stage 1에서는 실시간 하이라이트 없음
  }

  // 플레이어 x축 이동 범위 제한
  let playerRightBoundary;
  if (stage === 2) {
    playerRightBoundary = backgr.width - 350;
  } else {
    playerRightBoundary = backgr.width - 350; // Stage 1 또는 다른 스테이지: 기존 경계
  }
  x = constrain(x, 0, playerRightBoundary);

  // 전역 스케일 변수
  const visibleSeats = 4; // 화면에 보이게 할 좌석 수
  let stageScale = (stage === 1) ? 1.2 : (width / (visibleSeats * seatSpacing));
  if (stage === 2) stageScale *= 0.92;
  stageScale = constrain(stageScale, 1.2, 4.0);

  let offsetX = width / 4 + 20;
  let offsetY = height / 4 + 20;

  let scrollX, scrollY;
  if (stage === 2) {
    // Stage 2: camera follows player
    scrollX = -x + offsetX;
    scrollY = -y + offsetY;
  } else {
    // Stage 1: camera fixed to leftmost position
    scrollX = -0 + offsetX;
    scrollY = -y + offsetY;
  }

  // 카메라 스크롤 제한 (stageScale 고려)
  scrollX = constrain(scrollX, -backgr.width + width / stageScale, 0);
  scrollY = constrain(scrollY, -backgr.height + height / stageScale, 0);

  // ======= 화면 최상단 빈 공간 제거 (world y shift) =======
  let topScreenY = (scrollY - 50) * stageScale; // 배경의 화면 상단 Y 좌표
  let worldShiftY = 0;
  if (topScreenY > 0) {
    worldShiftY = -topScreenY / stageScale;
  }
  
  // 마우스 좌표를 월드 좌표로 변환
  const stage2YOffsetForMouse = (stage === 2) ? 100 : 0;
  let worldMouseX = (mouseX / stageScale) - (scrollX - 50);
  let worldMouseY = (mouseY / stageScale) - (scrollY - 50 + worldShiftY + stage2YOffsetForMouse);

  push();
  scale(stageScale);
  const stage2YOffset = (stage === 2) ? 100 : 0; // Stage 2일 때 전체를 약간 아래로
  translate(scrollX - 50, scrollY - 50 + worldShiftY + stage2YOffset);
  
  if (stage === 2) drawOutside();

  image(backgr, 0, 0, backgr.width, backgr.height);

  // 2. 월드 그리기
  const npcBottomY = drawNpcs(worldMouseX, worldMouseY);
  drawPlayer(npcBottomY);
  
  pop(); // world transform 끝

  // 3. UI 그리기
  drawUi();

  // 4. 스테이지 전환 로직
  // ======= stage2 진입 후 10초가 지나면 역 도착 + stage1으로 전환 =======
  if (stage === 2 && stage2StartTime !== null && !isStationImgActive) {
    if (millis() - stage2StartTime >= 10000) {
      isStationImgActive = true;  // drawOutside가 역 이미지만 그리게 됨
      stage = 1;                  // 카메라 모드도 stage1으로 복귀
      selectedNpcIndex = highlightedNpcIndex; // ⭐ 하이라이트된 NPC를 선택
      stage2StartTime = null;     // 한 번만 실행되도록 리셋
    }
  }
}

// 랜덤으로 역을 선택하고 관련 에셋을 로드하는 함수
function initializeStationAssets() {
  const randomIndex = floor(random(stations.length));
  currentStationName = stations[randomIndex];

  // 도시 배경 로드 (예: '강남.png')
  cityImg = loadImage(`assets/scenery/${currentStationName}.png`);
  // 역 이미지 로드 (예: '역_강남.PNG')
  stationImg = loadImage(`assets/scenery/역_${currentStationName}.PNG`);
}
