// 공통으로 쓰는: prefix를 받아서 해당 화면의 preload/setup/draw를 p5 전역에 연결
let currentScreenPrefix = null;
let screenBeforeStop = null;   // ⭐ stopScreen 들어가기 전 화면 기억용
let clickSound;
let typingSound;

function preload() {
  // 전역 사운드 로드
  clickSound = loadSound('assets/sound/click.mp3', () => {
    clickSound.setVolume(1.0);
  });
  typingSound = loadSound('assets/sound/typing-on-keyboard.mp3', () => {
    typingSound.setVolume(0.5);
  });

  // 현재 화면의 preload 함수가 있다면 호출
  const fn = window[`${currentScreenPrefix}Preload`];
  if (typeof fn === "function") {
    fn();
  }
}

function applyScreen(prefix) {
  currentScreenPrefix = prefix;

  // preload는 전역에서 처리
  setup = window[`${prefix}Setup`] || function () {};
  draw  = window[`${prefix}Draw`]  || function () {};
}

// =========================
// 각 화면으로 전환하는 함수들
// =========================

function switchToGameScreen() {
  applyScreen("gameScreen");
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
  // ⭐⭐⭐ 핵심: stopScreen으로 가기 직전 화면 저장
  screenBeforeStop = currentScreenPrefix;

  applyScreen("stopScreen");
  if (typeof setup === "function") {
    setup();
  }
}

// =========================
// ✅ 계속하기용: setup 없이 이전 화면으로 복귀
// =========================
function resumeToPreviousScreen() {
  if (!screenBeforeStop) return;

  applyScreen(screenBeforeStop);
  // ❗ setup 호출 안 함 → 상태/좌표/진행 그대로 유지
}

// (선택) 종료 시 이전 화면 정보 초기화
function clearResumeTarget() {
  screenBeforeStop = null;
}

// =========================
// 처음엔 startScreen으로 시작
// =========================
applyScreen("startScreen");

// =========================
// 전역 입력 처리
// =========================
function mousePressed() {
  // 전역 클릭 사운드
  if (clickSound && clickSound.isLoaded()) {
    clickSound.play();
  }

  // 현재 화면의 mousePressed 실행
  const fn = window[`${currentScreenPrefix}MousePressed`];
  if (typeof fn === "function") fn();
}

function keyPressed() {
  if (window.event) window.event.preventDefault();
  const fn = window[`${currentScreenPrefix}KeyPressed`];
  if (typeof fn === "function") fn();
}
