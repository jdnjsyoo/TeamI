let x = 200;
let y = 480;          // 바닥에 있을 때 y
let groundY = 480;    // 캐릭터가 항상 유지할 y
let speed = 5;


let img;        // 플레이어
let imgFront;   // 정면
let imgBack;  // 뒷모습
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

// 창문(window) 영역 (world 좌표 기준) — setup()에서 backgr 크기에 따라 초기값을 설정합니다.
// (windowRect and debug options were removed per request)

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
}

function gameScreenSetup() {
  // 고정 캔버스 사이즈 (요청대로)
  createCanvas(1024, 869);

  // 좌석 위치 설정
  // note: seatBaseY/startX/seatSpacing are declared globally now

  for (let i = 0; i < 7; i++) {
    npcPositions[i] = {
      x: startX + i * seatSpacing,
      y: seatBaseY
    };
  }

  // (windowRect removed; no initialization needed)
}

function gameScreenDraw() {
  background(0);

  // 플레이어는 배경(world) 기준 바닥에 고정
  // (worldGroundY을 사용해 배경과 동일한 Y로 고정하여 번역/스케일에 따라 함께 이동시키기 위함)
  y = backgr ? backgr.height - 80 : groundY;

  // Stage 1: 창밖 풍경은 화면 좌표로 렌더(월드 변환 이전)
  if (stage === 1) drawOutside();
  handlePlayerMovement();
  // y는 worldGroundY(=backgr.height - 80)로 고정되어 있으므로 추가 제약은 필요하지 않습니다.

  // 전역 스케일 변수 (이미지 확대/축소 비율, 스테이지에 따라 변경)
  // Stage 2 scale computed to show approximately `visibleSeats` seats in the view
  const visibleSeats = 4; // 현재 목표: 화면에 3~4명 보이도록, 여기선 4로 설정
  let stageScale = (stage === 1) ? 1.2 : (width / (visibleSeats * seatSpacing));
  // 약간 덜 확대 (Stage2일 때 살짝 감소)
  if (stage === 2) stageScale *= 0.92; // slightly less zoom than before
  // clamp to a reasonable range so UI doesn't break
  stageScale = constrain(stageScale, 1.2, 4.0);

  const defaultOffsetX = width / 4 + 20;
  let offsetX = defaultOffsetX;
  // 우측에 보이지 않는 간격 확보 (stage 2일 때 적용)
  const rightGap = 80; // 화면 오른쪽과 캐릭터 사이의 간격(픽셀)
  if (stage === 2) {
    // player's screen x = stageScale * (offsetX - 50)
    // ensure offsetX <= (width - rightGap)/stageScale - playerScale + 50
    let maxOffsetX = (width - rightGap) / stageScale - playerScale + 50;
    if (offsetX > maxOffsetX) offsetX = maxOffsetX;
    if (offsetX < 0) offsetX = 0;
  }
  let offsetY = height / 4 + 20;

  // ===== calculate x constraint to avoid overlapping the right edge =====
  if (backgr) {
    if (stage === 2) {
      // When the camera reaches the world right edge (scrollX clamped), compute
      // a conservative maximum for the player's world X so the player's right side
      // doesn't appear past the canvas right edge when the camera can't follow any further.
      const rightGap = 80;
      // When scrollX hits rightmost bound (clamped): scrollX = -backgr.width + width/stageScale
      // Solve to ensure player's rightmost screen X <= width - rightGap
      let worldMaxX = backgr.width - width / stageScale + 50 - playerScale + (width - rightGap) / stageScale;
      // Fallback: keep inside world bounds
      worldMaxX = constrain(worldMaxX, 0, backgr.width - playerScale);
      x = constrain(x, 0, worldMaxX);
    } else {
      // In Stage 1, keep player inside background area
      x = constrain(x, 0, backgr.width - playerScale);
    }
  }

  let scrollX, scrollY;
  if (stage === 2) {
    // Stage 2: camera follows player
    scrollX = -x + offsetX;
    scrollY = -y + offsetY;
  } else {
    // Stage 1: camera fixed to leftmost position (user at leftmost)
    scrollX = -0 + offsetX;
    scrollY = -y + offsetY; // keep vertical consistent
  }

  // 카메라 스크롤 제한을 stageScale을 고려해 계산합니다 (world 좌표 기준).
  scrollX = constrain(scrollX, -backgr.width + width / stageScale, 0);
  scrollY = constrain(scrollY, -backgr.height + height / stageScale, 0);

  // ======= 화면 최상단 빈 공간 제거 (world y shift) =======
  // 배경 이미지의 화면 상단 위치(스크린 좌표)를 계산하고,
  // 그 값이 양수인 경우(빈 공간이 생긴 경우) 같은 양만큼 world를 위로 평행이동합니다.
  // translate에 적용되는 값은 scale 전에 호출되므로, 최종 스크린 Y를 계산할 때는 scale을 고려합니다.
  let topScreenY = (scrollY - 50) * stageScale; // 배경의 화면 상단 Y 좌표
  let worldShiftY = 0; // world 좌표에서 추가로 더해줄 Y 평행 이동값
  if (topScreenY > 0) {
    // topScreenY 만큼 위로 이동하면 top이 0에 맞춰집니다. translate에서 쓰는 값은 world 좌표이므로
    // worldShiftY는 topScreenY/stageScale의 음수값으로 설정해야 합니다.
    worldShiftY = -topScreenY / stageScale;
  }

  // NPC들과 플레이어의 bottom Y 좌표를 background 기준으로 설정하여
  // 백그라운드가 위로 평행이동한 만큼 모든 캐릭터도 같은 양만큼 위로 이동하게 합니다.
  const worldGroundY = backgr ? backgr.height - 80 : height - 50;
  let npcBottomWorldY = worldGroundY;

  push();
  scale(stageScale);
  // Stage 2 Y offset: push all assets (except dialog) down by this value in world coordinates
  const stage2YOffset = (stage === 2) ? 100 : 0; // slightly lower Stage 2 assets by 100px
  translate(scrollX - 50, scrollY - 50 + worldShiftY + stage2YOffset);
  // Stage 2: 창밖 풍경은 월드 변환 내에서 렌더(스크롤/스케일에 따라 움직임)
  if (stage === 2) drawOutside();

  image(backgr, 0, 0, backgr.width, backgr.height);
  // (주의) 대화창은 화면 고정 UI로 하단에 고정하여 표시하므로
  // world transform 내부에서는 렌더하지 않습니다. 대신 아래에서 화면 좌표로 렌더합니다.

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

  // (대화창을 이후에 화면 좌표로 렌더링하도록 이동)

  pop();

  // ======= 화면 하단 고정 대화창 렌더링 (world transform 바깥 => 화면 고정 UI) =======
  if (dialogImg) {
    // 대화창은 확대하지 않음 (원본 크기 유지)
    let dW = dialogImg.width;
    let dH = dialogImg.height;
    // 화면 최하단 고정: y값은 캔버스 하단에 딱 붙게 한다.
    let dX = (width - dW) / 2;          // 가로 중앙 정렬
    let dY = height - dH;               // 화면 가장 하단에 위치
    image(dialogImg, dX, dY, dW, dH);
  }

  // (no debug instructions)

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
  // inWorld: whether to render this inside the world transform
  //    - if true, use backgr.width and render relative to background coordinates
  //    - if false or undefined, render relative to the screen size (legacy behavior)
  // 전체 Y 오프셋: 바깥 풍경과 구름을 화면 아래로 옮기려면 값을 변경하세요.
  // 바깥 풍경 Y 오프셋 — 이전에 451로 내려놓았으므로, 절반 정도(올려서 226)로 조정했습니다.
  const outsideYOffset = 250; // 변경: 조금 더 위로 올리기 (300 -> 250)

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
  // Spacebar toggles stage
  if (key === ' ' || keyCode === 32) {
    stage = (stage === 1) ? 2 : 1;
    return; // avoid treating as other keys
  }

  // 'n' 키로 2번 NPC 일어나게 (기존 space 역할 변화 보완)
  if (key === 'n' || key === 'N') {
    isNpc2Standing = true;
  }
}

// 클릭 시 속도 증가
function mousePressed() {
  // 1) 즉시 속도 올리기
  speed += boostAmount;
  if (speed > maxBoost) speed = maxBoost;

  print("현재 속도:", speed);

  // 2) 이 클릭에 해당하는 효과를 1초 뒤에 제거
  setTimeout(() => {
    speed -= boostAmount;

    // 기본 속도보다 내려가지 않도록
    if (speed < baseSpeed) speed = baseSpeed;

    print("복귀 이후 속도:", speed);
  }, 1000); // 1000ms 후에 이 클릭의 +3 효과 제거
}
//