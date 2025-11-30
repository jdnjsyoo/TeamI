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
let npcImgs = [];
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

  // NPC 7명 로드 — 첫 번째 NPC 교체됨!
  npcImgs[0] = loadImage('assets/npcChracter/홍대-1 기본 착석.png');        // ⭐ 교체된 1번 NPC
  npcImgs[1] = loadImage('assets/npcChracter/시청-2 모션.png');
  npcImgs[2] = loadImage('assets/npcChracter/강남-1 모션 (1).png');
  npcImgs[3] = loadImage('assets/npcChracter/강변 군인1.png');
  npcImgs[4] = loadImage('assets/npcChracter/서울대입구-1 모션 (1).png');
  npcImgs[5] = loadImage('assets/npcChracter/성수-1 기본 착석.png');
  npcImgs[6] = loadImage('assets/npcChracter/잠실 쇼핑1.png');

  // 두 번째 NPC의 "서 있는" 이미지
  npcStandImgs[1] = loadImage('assets/npcChracter/시청-2 정면 스탠딩.png');

  // 버튼 이미지 로드
  stopButton = loadImage('assets/buttons/stop_투명.png');
  quitButton = loadImage('assets/buttons/quit_투명.png');
  settingButton = loadImage('assets/buttons/setting_투명.png');
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

function gameScreenDraw() {
  background(0);

  // 플레이어는 배경(world) 기준 바닥에 고정
  y = backgr ? backgr.height - 80 : groundY;

  // Stage 1: 창밖 풍경은 화면 좌표로 렌더(월드 변환 이전)
  if (stage === 1) drawOutside();
  handlePlayerMovement();

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

  const worldGroundY = backgr ? backgr.height - 80 : height - 50;
  let npcBottomWorldY = worldGroundY;

  push();
  scale(stageScale);
  const stage2YOffset = (stage === 2) ? 100 : 0; // Stage 2일 때 전체를 약간 아래로
  translate(scrollX - 50, scrollY - 50 + worldShiftY + stage2YOffset);
  if (stage === 2) drawOutside();

  image(backgr, 0, 0, backgr.width, backgr.height);

  // NPC 그리기
  for (let i = 0; i < npcImgs.length; i++) {
    let imgToDraw = npcImgs[i];

    if (i === 1 && isNpc2Standing && npcStandImgs[1]) {
      imgToDraw = npcStandImgs[1];
    }

    drawNPC(imgToDraw, npcPositions[i].x, npcBottomWorldY, i);
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
}

function handlePlayerMovement() {
  if (keyIsDown(LEFT_ARROW)) {
    x -= speed;
    playerDir = "left";
  }
  // → 오른쪽
  else if (keyIsDown(RIGHT_ARROW)) {
    x += speed;
    playerDir = "right";
  }
  // ↑ 정면
  else if (keyIsDown(UP_ARROW)) {
    playerDir = "front";
  }
  // ↓ 뒷모습
  else if (keyIsDown(DOWN_ARROW)) {
    playerDir = "back";
  }
}

function drawOutside() {
  const outsideYOffset = 250;

  if (cityImg) {
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

  if (cloudImg) {
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
}

// =======================
// NPC 렌더 (비율 통일)
// =======================
function drawNPC(npcImg, baseX, baseY, index) {
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

  image(npcImg, drawX, drawY, w, h);
}

// =======================
// 키 입력
// =======================
function keyPressed() {
  // Spacebar: stage 토글
  if (key === ' ' || keyCode === 32) {
    stage = (stage === 1) ? 2 : 1;
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
