// 공통으로 쓰는: prefix를 받아서 해당 화면의 preload/setup/draw를 p5 전역에 연결
let currentScreenPrefix = null;
let screenBeforeStop = null;   // ⭐ stopScreen 들어가기 전 화면 기억용
let clickSound;
let typingSound;

let stopScreenBackdrop = null; // ⭐ stopScreen 반투명 배경용 스냅샷

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

function switchToSelectPlayerScreen() {
  applyScreen("selectPlayer");
  if (typeof setup === "function") {
    setup();
  }
}

function switchToGameScreen() {
  resetScoreboard();
  applyScreen("gameScreen");
  if (typeof setup === "function") setup();
}

function switchToQuitScreen() {
  resetScoreboard();   
  applyScreen("quitScreen");
  if (typeof setup === "function") setup();
}

function resetScoreboard() {
  scoreCount = 0;

  if (Array.isArray(scoreImages) && scoreImages.length > 0) {
    gameScore = scoreImages[0]; // ✅ score.png 로
  }
  globalThis.currentScoreIndex = 0; // ✅ 리워드도 0부터
}


function switchToSettingsScreen() {
  applyScreen("settingsScreen");
  if (typeof setup === "function") setup();
}

function switchToStopScreen() {
  // ✅ 중복 진입 방지 (stopScreen에서 또 stopScreen으로 들어가면 클릭 씹힘/스냅샷 꼬임)
  if (currentScreenPrefix === "stopScreen") return;

  // ✅ stopScreen 들어가기 전 화면 기억 (계속하기가 이걸로 복귀함)
  screenBeforeStop = currentScreenPrefix;

  // ✅ 게임 화면이 아직 살아 있을 때 캡처 (반투명 배경용)
  try {
    stopScreenBackdrop = get();
  } catch (e) {
    stopScreenBackdrop = null;
  }

  applyScreen("stopScreen");
  if (typeof setup === "function") setup();
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

  // ✅✅ 핵심: stopScreen에서는 전역 pause 판정 같은 거 하지 말고,
  //           무조건 stopScreenMousePressed로 전달되게 한다.
  //           (계속하기 버튼이 여기서 씹히는 문제 방지)
  if (currentScreenPrefix === "stopScreen") {
    const fnStop = window["stopScreenMousePressed"];
    if (typeof fnStop === "function") fnStop();
    return;
  }

  // ✅ (선택) 게임 화면에서만 pause 전역 우선 처리
  // - 네가 이미 gameScreenMousePressed 최상단에 pause 처리해뒀으면 이 블록은 없어도 됨
  if (currentScreenPrefix === "gameScreen") {
    if (typeof isPauseButtonClicked === "function" && isPauseButtonClicked()) {
      switchToStopScreen();
      return;
    }
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

