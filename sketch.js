// 공통으로 쓰는: prefix를 받아서 해당 화면의 preload/setup/draw를 p5 전역에 연결
let currentScreenPrefix = null;
let screenBeforeStop = null;   // ⭐ stopScreen 들어가기 전 화면 기억용
let clickSound;
let typingSound;

let stopScreenBackdrop = null; // ⭐ stopScreen 반투명 배경용 스냅샷


// setting 화면 용
let volBarEmptyImg;
let volBarFullImg;


function preload() {
  volBarEmptyImg = loadImage("assets/buttons/음량바 0.png");
  volBarFullImg  = loadImage("assets/buttons/음량바 100.png");


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
  // 이미 설정창이면 무시
  if (currentScreenPrefix === "settingsScreen") return;

  // 설정 들어가기 전 화면 기억
  screenBeforeSettings = currentScreenPrefix;

  // 현재 화면 캡처 (반투명 배경용)
  try {
    settingsScreenBackdrop = get();
  } catch (e) {
    settingsScreenBackdrop = null;
  }

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

function mouseDragged() {
  const fn = window[`${currentScreenPrefix}MouseDragged`];
  if (typeof fn === "function") fn();
}

function mouseReleased() {
  const fn = window[`${currentScreenPrefix}MouseReleased`];
  if (typeof fn === "function") fn();
}


function keyPressed() {
  const fn = window[`${currentScreenPrefix}KeyPressed`];
  if (typeof fn === "function") fn();
}

function resetGameState() {
  // Resume 관련
  screenBeforeStop = null;
  stopScreenBackdrop = null;

  // Round 상태 초기화
  currentRound = 1;

  round1_instance = null;
  round2_instance = null;
  round3_instance = null;

  // (선택) 사운드 정리
  if (scriptBgSound && scriptBgSound.isPlaying()) scriptBgSound.stop();
  if (roundPlayingSound && roundPlayingSound.isPlaying()) roundPlayingSound.stop();

  console.log("Game state fully reset");
}

function closeSettingsScreen() {
  if (!screenBeforeSettings) return;

  // setup 호출 ❌ → 상태 그대로 복귀
  applyScreen(screenBeforeSettings);
}

function mouseDragged() {
  const fn = window[`${currentScreenPrefix}MouseDragged`];
  if (typeof fn === "function") fn();
}

function mouseReleased() {
  const fn = window[`${currentScreenPrefix}MouseReleased`];
  if (typeof fn === "function") fn();
}

