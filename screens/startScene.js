// =====================
// 지하철 자리전쟁 시작 화면 (startScreen)
// =====================

// 이 시작 화면 내부에서만 쓰는 상태
// "menu"  : 메인 시작 화면
// "howto" : 플레이 방법
// "hint"  : 힌트 화면
let startState = "menu";

// 이미지
let imgStart;   // 시작 화면
let imgHowto;   // 플레이 방법
let imgHint;    // 힌트 화면

// 메뉴 화면의 동그라미 버튼 정보 (대략 위치값)
let btnStart  = { x: 190, y: 630, r: 140 };  // "게임 시작"
let btnHowto  = { x: 507, y: 630, r: 140 };  // "플레이 방법"
let btnHint   = { x: 810, y: 630, r: 140 };  // "힌트"

// 플레이 방법 / 힌트 화면의 X버튼 영역 (사각형)
let closeBtn = { x: 900, y: 110, w: 45, h: 46 };

// =====================
// 1) startScreenPreload
// =====================

function startScreenPreload() {
  imgStart = loadImage("assets/start/시작화면.png");
  imgHowto = loadImage("assets/start/플레이방법.png");
  imgHint  = loadImage("assets/start/힌트화면.png");
}

// =====================
// 2) startScreenSetup
// =====================

function startScreenSetup() {
  createCanvas(1024, 869)
  // 시작 화면 들어올 때 기본 상태는 메인 메뉴
  startState = "menu";
}

// =====================
// 3) startScreenDraw
// =====================

function startScreenDraw() {
  if (startState === "menu") {
    drawStartMenu();
  } else if (startState === "howto") {
    drawHowto();
  } else if (startState === "hint") {
    drawHint();
  }
}

// ------------- 각 화면 -------------

// 시작 메뉴 화면
function drawStartMenu() {
  image(imgStart, 0, 0, width, height);
}

// 플레이 방법 화면 (이미지 그대로)
function drawHowto() {
  image(imgHowto, 0, 0, width, height);
}

// 힌트 화면 (이미지 그대로)
function drawHint() {
  image(imgHint, 0, 0, width, height);
}

// =====================
// 4) 입력 처리
// =====================

function startScreenMousePressed() {
  // 메뉴 메인 화면에서 동그라미 버튼 클릭
  if (startState === "menu") {
    if (insideCircle(mouseX, mouseY, btnStart)) {
      // 👉 여기서 실제 게임 화면으로 전환
      if (typeof switchToGameScreen === "function") {
        switchToGameScreen();
      }
      return;
    } else if (insideCircle(mouseX, mouseY, btnHowto)) {
      startState = "howto";
      return;
    } else if (insideCircle(mouseX, mouseY, btnHint)) {
      startState = "hint";
      return;
    }
  }

  // 플레이 방법 또는 힌트 화면에서 X 버튼 클릭 → 다시 메인 시작 화면으로
  if (startState === "howto" || startState === "hint") {
    if (insideRect(mouseX, mouseY, closeBtn)) {
      startState = "menu";
    }
  }
}

// ESC 키로 언제든지 시작 화면 메인으로 돌아가기
function startScreenKeyPressed() {
  if (keyCode === ESCAPE) {
    startState = "menu";
  }
}

// =====================
// 5) 유틸 함수
// =====================

// 원 안에 있는지 체크
function insideCircle(mx, my, btn) {
  let d = dist(mx, my, btn.x, btn.y);
  return d <= btn.r;
}

// 사각형 안에 있는지 체크
function insideRect(mx, my, rectObj) {
  return (
    mx >= rectObj.x &&
    mx <= rectObj.x + rectObj.w &&
    my >= rectObj.y &&
    my <= rectObj.y + rectObj.h
  );
}
