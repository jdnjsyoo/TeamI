let x = 200;
let y = 480;          // 바닥에 있을 때 y
let groundY = 480;    // 캐릭터가 항상 유지할 y
let speed = 5;

let img;        // 플레이어
let imgFront;   // 정면
let imgBack;    // 뒷모습
let playerDir = "right";

let playerScale = 300; // ⭐ 유저 NPC 크기

let backgr;     // 지하철 내부(창문 투명)
let dialogImg;  // 대화창 이미지

// 창밖
let cityImg;    // 도시 배경
let cloudImg;   // 구름

let facingLeft = false;

// 창밖 패럴럭스용 변수
let cityX = 0;
let cloudX = 0;
let citySpeed = 8;   // 도시 속도
let cloudSpeed = 1;  // 구름은 훨씬 느리게

// NPC 7명
let npcAnimationFrames = [];    // NPC 애니메이션 프레임 (2D 배열)
let npcCurrentFrameIndex = [0, 0, 0, 0, 0, 0, 0]; // 각 NPC의 현재 프레임 인덱스
let lastAnimationTime = 0;      // 마지막 애니메이션 시간
let npcStandImgs = [];        // 서 있는 버전 이미지 (2번째 NPC용)
let npcPositions = [];
// 좌석 배치용 전역 값
let seatBaseY = 520;
let startX = 230;
let seatSpacing = 95;
let npcTargetHeight = 280;   // 잠실/군인 정도 키로 통일

let isNpc2Standing = false;  // 두 번째 NPC가 일어났는지 여부
let stage = 1; // 1 or 2

// 버튼 이미지
let stopButton, quitButton, settingButton;
// 버튼 히트박스(스크린 좌표 기준)
let stopBtnX, stopBtnY, stopBtnW, stopBtnH;
let quitBtnX, quitBtnY, quitBtnW, quitBtnH;
let settingBtnX, settingBtnY, settingBtnW, settingBtnH;

// ⭐ 추가: 발을 더 아래로 내리기 위한 Y 오프셋
const playerYShift = 25;        // 유저 캐릭터를 화면에서 더 아래로
const standingNpcYShift = 25;   // 서 있는 2번 NPC도 같은 만큼 아래로

let stage2StartTime = null;   // stage2에 진입한 시각 (millis 단위)
let stationImg;
let isStationImgActive = false;

let highlightedNpcIndex = -1; // 스테이지 2에서 하이라이트될 NPC 인덱스
let selectedNpcIndex = -1;    // 스테이지 1에서 선택된 NPC 인덱스
let sitHereImg;               // '여기 앉으세요' 이미지
let sitHereHoverImg;          // '여기 앉으세요' 호버 이미지

// 'sit here' 버튼 상호작용 상태 변수
let isSitButtonHovered = false;
let isSitButtonPressed = false;
let sitButtonPressTime = 0;

function gameScreenPreload() {
  // 지하철 내부
  backgr = loadImage('assets/subwayBackground/낮(임산부석O) 창문 투명 - 대화창X.png');
  // 대화창 이미지
  dialogImg = loadImage('assets/subwayBackground/대화창.png');

  // 창밖 풍경
  cityImg  = loadImage('assets/scenery/시청1.png');
  cloudImg = loadImage('assets/scenery/구름.png');

  // 플레이어
  img = loadImage('assets/userCharacter/유저-1 걷는 옆모습 모션 (1).png');
  imgFront = loadImage('assets/userCharacter/유저-1 정면 스탠딩.png');
  imgBack  = loadImage('assets/userCharacter/유저-1 뒷모습.png')

  // NPC 애니메이션 프레임 로드
  npcAnimationFrames[0] = [
    loadImage('assets/npcChracter/홍대-1 기본 착석.png'),
    loadImage('assets/npcChracter/홍대-1 모션 (1).png'),
    loadImage('assets/npcChracter/홍대-1 모션 (2).png')
  ];
  npcAnimationFrames[1] = [
    loadImage('assets/npcChracter/시청-2 모션.png'),
    loadImage('assets/npcChracter/시청-2 힌트 전광판.png')
  ];
  npcAnimationFrames[2] = [
    loadImage('assets/npcChracter/강남-1 모션 (1).png'),
    loadImage('assets/npcChracter/강남-1 모션 (2).png')
  ];
  npcAnimationFrames[3] = [
    loadImage('assets/npcChracter/강변 군인1.png'),
    loadImage('assets/npcChracter/강변 군인2.png')
  ];
  npcAnimationFrames[4] = [
    loadImage('assets/npcChracter/서울대입구-1 모션 (1).png'),
    loadImage('assets/npcChracter/서울대입구-1 모션 (2).png')
  ];
  npcAnimationFrames[5] = [
    loadImage('assets/npcChracter/성수-1 기본 착석.png'),
    loadImage('assets/npcChracter/성수-1 모션 (1).png'),
    loadImage('assets/npcChracter/성수-1 모션 (2).png')
  ];
  npcAnimationFrames[6] = [
    loadImage('assets/npcChracter/잠실 쇼핑1.png'),
    loadImage('assets/npcChracter/잠실 쇼핑2.png'),
    loadImage('assets/npcChracter/잠실 쇼핑3.png')
  ];

  // 두 번째 NPC의 "서 있는" 이미지
  npcStandImgs[1] = loadImage('assets/npcChracter/시청-2 정면 스탠딩.png');

  // 버튼 이미지 로드
  stopButton = loadImage('assets/buttons/stop_투명.png');
  quitButton = loadImage('assets/buttons/quit_투명.png');
  settingButton = loadImage('assets/buttons/setting_투명.png');
  sitHereImg = loadImage('assets/buttons/sit_here.png');
  sitHereHoverImg = loadImage('assets/buttons/sit_here_hover.png');

  // 역 이미지 로드
  stationImg = loadImage('assets/scenery/역_시청.png');
}

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
}

// Stage 2로 전환하는 헬퍼 함수
function enterStage2() {
  stage = 2;
  stage2StartTime = millis();
  isStationImgActive = false;
  selectedNpcIndex = -1;
}

function gameScreenDraw() {
  background(0);

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
  x = constrain(x, 0, backgr.width - 350);

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
  
  // NPC 애니메이션 프레임 업데이트
  if (millis() - lastAnimationTime > 500) {
    for (let i = 0; i < 7; i++) {
      if (npcAnimationFrames[i] && npcAnimationFrames[i].length > 0) {
        npcCurrentFrameIndex[i] = (npcCurrentFrameIndex[i] + 1) % npcAnimationFrames[i].length;
      }
    }
    lastAnimationTime = millis();
  }

  const worldGroundY = backgr ? backgr.height - 80 : height - 50;
  let npcBottomWorldY = worldGroundY;
  
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

  // NPC 그리기
  isSitButtonHovered = false; // 매 프레임 호버 상태 초기화
  for (let i = 0; i < npcAnimationFrames.length; i++) {
    const currentFrameIndex = npcCurrentFrameIndex[i];
    let imgToDraw = npcAnimationFrames[i][currentFrameIndex];

    if (i === 1 && isNpc2Standing && npcStandImgs[1]) {
      imgToDraw = npcStandImgs[1];
    }

    const isHighlighted = (i === highlightedNpcIndex) || (i === selectedNpcIndex);
    drawNPC(imgToDraw, npcPositions[i].x, npcBottomWorldY, i, isHighlighted, worldMouseX, worldMouseY);
  }

  // ⭐ 플레이어 그리기 (Y축 아래로 평행이동만 추가)
  let playerBottomY = npcBottomWorldY;
  let playerTopY    = playerBottomY - playerScale;

  push();
  if (playerDir === "left") {
    // 왼쪽: 옆모습 뒤집기
    translate(x + playerScale, playerTopY + playerYShift);
    scale(-1, 1);
    image(img, 0, 0, playerScale, playerScale);
  } else if (playerDir === "right") {
    // 오른쪽: 옆모습 그대로
    image(img, x, playerTopY + playerYShift, playerScale, playerScale);
  } else if (playerDir === "front") {
    // 정면
    image(imgBack, x, playerTopY + playerYShift, playerScale, playerScale);
  } else if (playerDir === "back") {
    // 뒷모습
    image(imgFront, x, playerTopY + playerYShift, playerScale, playerScale);
  }
  pop();

  pop(); // world transform 끝

  // ======= 화면 하단 고정 대화창 =======
  if (dialogImg) {
    let dW = dialogImg.width;
    let dH = dialogImg.height;
    let dX = (width - dW) / 2;
    let dY = height - dH;
    image(dialogImg, dX, dY, dW, dH);
  }

  // ======= 우측 상단 버튼 (스크린 좌표, 스케일/스크롤 영향 X) =======
  push();
  const buttonWidth = 100;
  const buttonHeight = 73;
  const buttonGap = 20;
  let buttonX = width - buttonWidth - 10; // 오른쪽 여백 10px
  const buttonY = 20; // 위쪽 여백 20px

  if (stopButton) {
    image(stopButton, buttonX, buttonY, buttonWidth, buttonHeight);
    // stop 버튼 히트박스 저장
    stopBtnX = buttonX;
    stopBtnY = buttonY;
    stopBtnW = buttonWidth;
    stopBtnH = buttonHeight;

    buttonX -= buttonWidth / 2 + buttonGap;
  }

  if (quitButton) {
    image(quitButton, buttonX, buttonY, buttonWidth, buttonHeight);
    // quit 버튼 히트박스 저장
    quitBtnX = buttonX;
    quitBtnY = buttonY;
    quitBtnW = buttonWidth;
    quitBtnH = buttonHeight;

    buttonX -= buttonWidth / 2 + buttonGap;
  }

  if (settingButton) {
    image(settingButton, buttonX, buttonY, buttonWidth, buttonHeight);
    // setting 버튼 히트박스 저장
    settingBtnX = buttonX;
    settingBtnY = buttonY;
    settingBtnW = buttonWidth;
    settingBtnH = buttonHeight;
  }
  pop();

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

function handlePlayerMovement() {
  if (stage !== 1) { // Stage 1이 아닐 때만 좌우 이동 허용
    if (keyIsDown(LEFT_ARROW)) {
      x -= speed;
      playerDir = "left";
    }
    // → 오른쪽
    else if (keyIsDown(RIGHT_ARROW)) {
      x += speed;
      playerDir = "right";
    }
  }
  // ↑ 정면
  if (keyIsDown(UP_ARROW)) {
    playerDir = "front";
  }
  // ↓ 뒷모습
  else if (keyIsDown(DOWN_ARROW)) {
    playerDir = "back";
  }
}

function drawOutside() {
  const outsideYOffset = 250;

  if (cityImg && !isStationImgActive) {
    let sScale = 0.55;
    let sw = cityImg.width * sScale;
    let sh = cityImg.height * sScale;

    cityX -= citySpeed;
    if (cityX <= -sw) cityX += sw;

    const maxX = (stage === 2 && backgr) ? backgr.width : width;
    for (let xx = cityX; xx < maxX; xx += sw) {
      image(cityImg, xx, outsideYOffset, sw, sh);
    }
  }

  if (cloudImg && !isStationImgActive) {
    let cScale = 0.6;
    let cw = cloudImg.width * cScale;
    let ch = cloudImg.height * cScale;

    cloudX -= cloudSpeed;
    if (cloudX <= -cw) cloudX += cw;

    const maxX = (stage === 2 && backgr) ? backgr.width : width;
    for (let xx = cloudX; xx < maxX; xx += cw) {
      image(cloudImg, xx, -40 + outsideYOffset, cw, ch);
    }
  }

  if (isStationImgActive) {
    let sw = 1024; // 고정된 가로 사이즈
    let sScale = sw / stationImg.width; // 비율 유지
    let sh = stationImg.height * sScale; // 세로 사이즈 계산
    let fixedX = (width - sw) / 2; // 고정된 x좌표 계산
    let fixedY = height - sh - 115; // 바닥에서 115px 띄우기
    image(stationImg, fixedX, fixedY, sw, sh);
  }
}



// =======================
// NPC 렌더 (비율 통일)
// =======================
function drawNPC(npcImg, baseX, baseY, index, isHighlighted, worldMouseX, worldMouseY) {
  if (!npcImg) return;

  let targetHeight = npcTargetHeight;
  let lift = 12; // 좌석 위에 살짝 띄우기

  let isStandingNpc2 = (index === 1 && isNpc2Standing && npcStandImgs[1] && npcImg === npcStandImgs[1]);
  if (isStandingNpc2) {
    targetHeight = playerScale; // 유저와 같은 키
    lift = 0;                   // 바닥선까지
  }

  let scaleFactor = targetHeight / npcImg.height;
  let w = npcImg.width * scaleFactor;
  let h = targetHeight;

  let drawX = baseX - w / 2;
  let drawY = baseY - h;

  if (isStandingNpc2) {
    drawY += standingNpcYShift;
  }

  // 하이라이트 효과 (캐릭터 외곽선)
  if (isHighlighted) {
    // 가장 안정적인 방법: drawingContext를 사용하여 흰색 실루엣 생성
    let buffer = createGraphics(w, h);
    buffer.image(npcImg, 0, 0, w, h);
    
    // 'source-in' composite operation을 사용하여 기존 픽셀 위에만 색칠
    buffer.drawingContext.globalCompositeOperation = 'source-in';
    
    // 흰색으로 채우기
    buffer.fill(255);
    buffer.noStroke();
    buffer.rect(0, 0, w, h);
    
    // composite operation 리셋 (p5.js의 다른 그리기에 영향 없도록)
    buffer.drawingContext.globalCompositeOperation = 'source-over';

    const borderPx = 3;

    // 흰색 실루엣을 상하좌우로 그려 테두리 효과를 냄
    image(buffer, drawX - borderPx, drawY, w, h);
    image(buffer, drawX + borderPx, drawY, w, h);
    image(buffer, drawX, drawY - borderPx, w, h);
    image(buffer, drawX, drawY + borderPx, w, h);
    
    buffer.remove(); // 메모리 누수 방지를 위해 버퍼 제거
  }

  // 원본 이미지를 위에 다시 그립니다.
  image(npcImg, drawX, drawY, w, h);

  // 'sit here' 버튼 로직
  if (isHighlighted && stage === 1 && sitHereImg) {
    const desiredSitHereWidth = 200;
    const sitHereScale = desiredSitHereWidth / sitHereImg.width;
    const sitW = sitHereImg.width * sitHereScale;
    const sitH = sitHereImg.height * sitHereScale;
    const sitX = drawX + (w - sitW) / 2;
    const sitY = drawY - sitH * 0.8;

    const isCurrentlyHovered = (worldMouseX > sitX && worldMouseX < sitX + sitW && worldMouseY > sitY && worldMouseY < sitY + sitH);
    if (isCurrentlyHovered) {
      isSitButtonHovered = true;
    }

    let imgToDraw = isCurrentlyHovered ? sitHereHoverImg : sitHereImg;
    
    let scaleMod = 1.0;
    // 클릭 애니메이션 처리
    if (isSitButtonPressed && isCurrentlyHovered) {
      if (millis() - sitButtonPressTime < 200) { // 200ms 애니메이션
        scaleMod = 0.9; // 클릭 효과로 크기 줄이기
      } else {
        // 애니메이션 종료 후 stage 1로 전환 (NPC 선택 해제)
        isSitButtonPressed = false;
        stage = 1; // stage 1으로 돌아옴
        selectedNpcIndex = -1; // NPC 선택 해제
        return; // 상태가 바뀌므로 더 이상 그리지 않음
      }
    }
    
    const finalW = sitW * scaleMod;
    const finalH = sitH * scaleMod;
    const finalX = sitX + (sitW - finalW) / 2;
    const finalY = sitY + (sitH - finalH) / 2;

    image(imgToDraw, finalX, finalY, finalW, finalH);
  }
}

// =======================
// 키 입력
// =======================
function keyPressed() {
  // Spacebar: stage 토글
  if (key === ' ' || keyCode === 32) {
    if (stage === 1) {
      // 1 → 2로 진입
      enterStage2();
    } else {
      // 2 → 1로 수동 복귀
      stage = 1;
      selectedNpcIndex = highlightedNpcIndex; // 현재 하이라이트된 NPC를 선택
      stage2StartTime = null;
      isStationImgActive = false;
    }
    return;
  }

  // 'n' 키: 2번 NPC 일어나기
  if (key === 'n' || key === 'N') {
    isNpc2Standing = true;
  }
}

// =======================
// 마우스 클릭
// 1) 버튼 클릭 여부 먼저 체크해서 화면 전환
// 2) 그 외 영역 클릭이면 기존 속도 증가 로직
// =======================
function mousePressed() {
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
  if (isSitButtonHovered) {
    isSitButtonPressed = true;
    sitButtonPressTime = millis();
    return; // 다른 클릭 로직 방지
  }

  // --- 버튼이 아닌 곳 클릭 → 기존 속도 증가 로직 ---
  speed += boostAmount;
  if (speed > maxBoost) speed = maxBoost;

  print("현재 속도:", speed);

  setTimeout(() => {
    speed -= boostAmount;

    if (speed < baseSpeed) speed = baseSpeed;

    print("복귀 이후 속도:", speed);
  }, 1000);
}
