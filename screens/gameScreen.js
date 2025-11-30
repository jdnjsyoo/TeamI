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
let npcTargetHeight = 280;   // 잠실/군인 정도 키로 통일

let isNpc2Standing = false;  // 두 번째 NPC가 일어났는지 여부

// ⭐ 추가: 발을 더 아래로 내리기 위한 Y 오프셋
const playerYShift = 25;        // 유저 캐릭터를 화면에서 더 아래로
const standingNpcYShift = 25;   // 서 있는 2번 NPC도 같은 만큼 아래로

// ⭐ 버튼 히트박스(화면 좌표 기준) 저장용 전역 변수
let stopBtnX, stopBtnY, stopBtnW, stopBtnH;
let quitBtnX, quitBtnY, quitBtnW, quitBtnH;
let settingBtnX, settingBtnY, settingBtnW, settingBtnH;

// 버튼 이미지 전역 (이미 쓰고 있던 애들)
let stopButton, quitButton, settingButton;

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
  createCanvas(1024, 869);

  // 좌석 위치 설정
  let seatBaseY = 520;
  let startX = 230;
  let seatSpacing = 95;

  for (let i = 0; i < 7; i++) {
    npcPositions[i] = {
      x: startX + i * seatSpacing,
      y: seatBaseY
    };
  }
}

function gameScreenDraw() {
  background(0);

  // 플레이어는 항상 groundY
  y = groundY;

  drawOutside();
  handlePlayerMovement();

  x = constrain(x, 0, backgr.width - 350);
  y = constrain(y, 0, backgr.height - 350);

  let offsetX = width / 4 + 20;
  let offsetY = height / 4 + 20;

  let scrollX = -x + offsetX;
  let scrollY = -y + offsetY;

  scrollX = constrain(scrollX, -backgr.width + width, 0);
  scrollY = constrain(scrollY, -backgr.height + height, 0);

  let npcBottomWorldY = height - scrollY;

  push();
  const worldScale = 1.2;
  scale(worldScale);
  const transX = scrollX - 50;
  const transY = scrollY - 50;
  translate(transX, transY);

  image(backgr, 0, 0, backgr.width, backgr.height);
  // backgr 바로 아래에 대화창 이미지 배치
  if (dialogImg) {
    let dialogWidth = dialogImg.width;
    let dialogHeight = dialogImg.height;
    let dialogX = (backgr.width - dialogWidth) / 2;
    let dialogY = backgr.height - dialogHeight - 30; // 하단에서 30px 위
    image(dialogImg, dialogX, dialogY);
  }

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

  // 우측 상단에 버튼 배치 (월드 좌표 기준)
  const buttonWidth = 82.2;
  const buttonHeight = 60;
  let buttonX = width - (buttonWidth * 4); // 버튼 3개와 간격 포함한 시작점
  const buttonY = 20; // 위쪽 여백 20px

  // 월드→스크린 좌표 변환용 (scale + translate 적용 반영)
  const toScreenX = (wx) => (wx + transX) * worldScale;
  const toScreenY = (wy) => (wy + transY) * worldScale;
  const toScreenW = (w)  => w * worldScale;
  const toScreenH = (h)  => h * worldScale;

  if (stopButton) {
    image(stopButton, buttonX, buttonY, buttonWidth, buttonHeight);

    // 화면 좌표계 기준 히트박스 저장
    stopBtnX = toScreenX(buttonX);
    stopBtnY = toScreenY(buttonY);
    stopBtnW = toScreenW(buttonWidth);
    stopBtnH = toScreenH(buttonHeight);

    buttonX += buttonWidth / 2 + 20; // 버튼 간격
  }

  if (quitButton) {
    image(quitButton, buttonX, buttonY, buttonWidth, buttonHeight);

    quitBtnX = toScreenX(buttonX);
    quitBtnY = toScreenY(buttonY);
    quitBtnW = toScreenW(buttonWidth);
    quitBtnH = toScreenH(buttonHeight);

    buttonX += buttonWidth / 2 + 20;
  }

  if (settingButton) {
    image(settingButton, buttonX, buttonY, buttonWidth, buttonHeight);

    settingBtnX = toScreenX(buttonX);
    settingBtnY = toScreenY(buttonY);
    settingBtnW = toScreenW(buttonWidth);
    settingBtnH = toScreenH(buttonHeight);
  }

  pop(); // push() 종료
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
  if (cityImg) {
    let sScale = 0.55;
    let sw = cityImg.width * sScale;
    let sh = cityImg.height * sScale;

    cityX -= citySpeed;
    if (cityX <= -sw) cityX += sw;

    for (let xx = cityX; xx < width; xx += sw) {
      image(cityImg, xx, 0, sw, sh);
    }
  }

  if (cloudImg) {
    let cScale = 0.6;
    let cw = cloudImg.width * cScale;
    let ch = cloudImg.height * cScale;

    cloudX -= cloudSpeed;
    if (cloudX <= -cw) cloudX += cw;

    for (let xx = cloudX; xx < width; xx += cw) {
      image(cloudImg, xx, -40, cw, ch);
    }
  }
}

// =======================
// NPC 렌더 (비율 통일)
//  - 기본: 앉아 있는 NPC (npcTargetHeight, lift 12)
//  - 2번 NPC가 서 있을 때: playerScale 크기로 키우고 바닥에 거의 붙게
// =======================
function drawNPC(npcImg, baseX, baseY, index) {
  if (!npcImg) return;

  // 기본 값: 앉아 있는 상태
  let targetHeight = npcTargetHeight;
  let lift = 12; // 좌석 위에 살짝 띄우기

  // 2번째 NPC가 "서 있는 이미지"로 그려질 때만 키우기 + 바닥까지
  let isStandingNpc2 = (index === 1 && isNpc2Standing && npcStandImgs[1] && npcImg === npcStandImgs[1]);
  if (isStandingNpc2) {
    targetHeight = playerScale; // 유저와 같은 키
    lift = 0;                   // 바닥선까지
  }

  let scaleFactor = targetHeight / npcImg.height;
  let w = npcImg.width * scaleFactor;
  let h = targetHeight;

  let drawX = baseX - w / 2;
  let drawY = baseY - h ;

  // ⭐ 서 있는 2번 NPC만 더 아래로 평행이동
  if (isStandingNpc2) {
    drawY += standingNpcYShift;
  }

  image(npcImg, drawX, drawY, w, h);
}

// =======================
// 스페이스바 누르면 2번 NPC 서기
// =======================
function keyPressed() {
  if (key === ' ' || keyCode === 32) {
    isNpc2Standing = true;
  }
}

// =======================
// 클릭 시 버튼 체크 + 속도 증가
//  - stopButton 클릭 → switchToStopScreen()
//  - quitButton 클릭 → switchToQuitScreen()
//  - settingButton 클릭 → switchToSettingsScreen()
//  - 그 외 → 기존 속도 boost 로직
// =======================
function mousePressed() {
  // 1) 버튼 우선 체크 (히트박스는 화면 좌표 기준)
  if (
    stopBtnX !== undefined &&
    mouseX >= stopBtnX && mouseX <= stopBtnX + stopBtnW &&
    mouseY >= stopBtnY && mouseY <= stopBtnY + stopBtnH
  ) {
    // stop 화면으로 전환
    if (typeof switchToStopScreen === "function") {
      switchToStopScreen();
    }
    return;
  }

  if (
    quitBtnX !== undefined &&
    mouseX >= quitBtnX && mouseX <= quitBtnX + quitBtnW &&
    mouseY >= quitBtnY && mouseY <= quitBtnY + quitBtnH
  ) {
    // quit 화면으로 전환
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
    // settings 화면으로 전환
    if (typeof switchToSettingsScreen === "function") {
      switchToSettingsScreen();
    }
    return;
  }

  // 2) 버튼이 아닌 곳 클릭 → 기존 속도 증가 로직
  // (baseSpeed, boostAmount, maxBoost는 전역으로 이미 있다고 가정)
  speed += boostAmount;
  if (speed > maxBoost) speed = maxBoost;

  print("현재 속도:", speed);

  setTimeout(() => {
    speed -= boostAmount;

    if (speed < baseSpeed) speed = baseSpeed;

    print("복귀 이후 속도:", speed);
  }, 1000);
}
