let x = 200;
let y = 480;          // 바닥에 있을 때 y
let groundY = 480;    // 캐릭터가 항상 유지할 y
let speed = 5;

let img;        // 플레이어
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
let npcTargetHeight = 220;   // 잠실/군인 정도 키로 통일

let isNpc2Standing = false;  // 두 번째 NPC가 일어났는지 여부

// ⭐ 추가: 발을 더 아래로 내리기 위한 Y 오프셋
const playerYShift = 25;        // 유저 캐릭터를 화면에서 더 아래로
const standingNpcYShift = 25;   // 서 있는 2번 NPC도 같은 만큼 아래로

function preload() {
  // 지하철 내부
  backgr = loadImage('assets/subwayBackground/낮(임산부석O) 창문 투명 - 대화창X.png');
  // 대화창 이미지
  dialogImg = loadImage('assets/subwayBackground/대화창.png');

    // 창밖 풍경
    cityImg  = loadImage('assets/scenery/시청1.png');
    cloudImg = loadImage('assets/scenery/구름.png');

  // 플레이어
  img = loadImage('assets/userCharacter/유저-1 걷는 옆모습 모션 (1).png');

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
}

function setup() {
  createCanvas(600, 400);

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

function draw() {
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
  translate(scrollX, scrollY);


  image(backgr, 0, 0, backgr.width, backgr.height);
  // backgr 바로 아래에 대화창 이미지 배치
  if (dialogImg) {
    // 대화창을 캔버스 하단 중앙에 배치 (예시)
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
  if (facingLeft) {
    translate(x + playerScale, playerTopY + playerYShift);
    scale(-1, 1);
    image(img, 0, 0, playerScale, playerScale);
  } else {
    image(img, x, playerTopY + playerYShift, playerScale, playerScale);
  }
  pop();

  pop();
}

function handlePlayerMovement() {
  if (keyIsDown(LEFT_ARROW)) {
    x -= speed;
    facingLeft = true;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    x += speed;
    facingLeft = false;
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
  let drawY = baseY - h - lift;

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
