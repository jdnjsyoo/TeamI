// 공통으로 쓰는: prefix를 받아서 해당 화면의 preload/setup/draw를 p5 전역에 연결
let currentScreenPrefix = null;
let clickSound;
let typingSound;

function preload() {
    // 전역 사운드 로드
    clickSound = loadSound('assets/sound/click.mp3', () => {
        clickSound.setVolume(1.0); // 예시: 볼륨 50%로 설정
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
  // preload는 전역 함수로 분리했으므로 여기서는 제외
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
// 처음엔 startScreen으로 시작
// (여기서는 setup()을 직접 호출 안 함 → p5가 처음 한 번 호출해줌)
// =========================
applyScreen("startScreen");
//////////////////////////

function mousePressed() {
  // 전역 클릭 사운드 재생
  if (clickSound && clickSound.isLoaded()) {
    clickSound.play();
  }

  // 현재 화면의 mousePressed 함수 실행
  const fn = window[`${currentScreenPrefix}MousePressed`];
  if (typeof fn === "function") fn();
}

function keyPressed() {
  const fn = window[`${currentScreenPrefix}KeyPressed`];
  if (typeof fn === "function") fn();
}