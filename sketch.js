// 공통으로 쓰는: prefix를 받아서 해당 화면의 preload/setup/draw를 p5 전역에 연결
let currentScreenPrefix = null;

function applyScreen(prefix) {
  currentScreenPrefix = prefix;
  preload = window[`${prefix}Preload`] || function () {};
  setup   = window[`${prefix}Setup`]   || function () {};
  draw    = window[`${prefix}Draw`]    || function () {};
}

// =========================
// 각 화면으로 전환하는 함수들
// =========================

function switchToGameScreen() {
  applyScreen("gameScreen");
  // 화면 전환 시, 새 화면의 setup을 직접 한 번 실행
  if (typeof setup === "function") {
    setup();
  }
}

function switchToQuitScreen() {
  applyScreen("quitScreen");
  if (typeof setup === "function") {
    setup();
  }
}

function switchToSettingsScreen() {
  applyScreen("settingsScreen");
  if (typeof setup === "function") {
    setup();
  }
}

function switchToStopScreen() {
  applyScreen("stopScreen");
  if (typeof setup === "function") {
    setup();
  }
}




// =========================
// 처음엔 gameScreen으로 시작
// (여기서는 setup()을 직접 호출 안 함 → p5가 처음 한 번 호출해줌)
// =========================
applyScreen("startScreen");
//////////////////////////

function mousePressed() {
  const fn = window[`${currentScreenPrefix}MousePressed`];
  if (typeof fn === "function") fn();
}

function keyPressed() {
  const fn = window[`${currentScreenPrefix}KeyPressed`];
  if (typeof fn === "function") fn();
}