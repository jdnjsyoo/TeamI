// screens/stopScreen.js
// STOP SCREEN: semi-transparent overlay + 2 centered buttons
// Click:
//  - Continue: resumeToPreviousScreen()
//  - Quit: startScreen

const STOP_W = 1024;
const STOP_H = 869;

const BASE_PATHS = [
  "assets/buttons/",
  "screens/game/assets/buttons/",
  "screens/assets/buttons/",
];

const FILES = {
  continue: "계속하기.png",
  continueHover: "계속하기 호버.png",
  quit: "종료하기.png",
  quitHover: "종료하기 호버.png",
};

let imgContinue = null;
let imgContinueHover = null;
let imgQuit = null;
let imgQuitHover = null;

let stopLoad = {
  started: false,
  done: false,
  failed: false,
  logs: [],
};

let btnContinue = { x: 0, y: 0, w: 0, h: 0 };
let btnQuit     = { x: 0, y: 0, w: 0, h: 0 };

const GAP = 18;
const MAX_TOTAL_W_RATIO = 0.985;
const MAX_BTN_H_RATIO   = 0.36;

// ✅ 반투명 어둠 정도 (0~255)
const DIM_ALPHA = 160;

const CONTINUE_HOVER_SCALE = 1.0;
const CONTINUE_HOVER_VISUAL_ZOOM = 1.24;
const QUIT_HOVER_ZOOM = 1.0;

function stopScreenPreload() {}

function stopScreenSetup() {
  createCanvas(STOP_W, STOP_H);
  // ❗ 여기서는 get() 하지 않음 (이미 router에서 캡처됨)
}

function stopScreenDraw() {
  // =========================
  // 1) 캡처된 게임 화면 먼저 그리기
  // =========================
  if (typeof stopScreenBackdrop !== "undefined" && stopScreenBackdrop) {
    image(stopScreenBackdrop, 0, 0, width, height);
  } else {
    background(0);
  }

  // =========================
  // 2) 반투명 오버레이
  // =========================
  noStroke();
  fill(0, DIM_ALPHA);
  rect(0, 0, width, height);

  ensureStopButtonsLoaded();

  if (!stopLoad.done) {
    drawStopLoading();
    return;
  }
  if (stopLoad.failed) {
    drawStopError();
    return;
  }

  layoutStopButtons();

  const hoverContinue = isHover(btnContinue);
  const hoverQuit = isHover(btnQuit);

  // =========================
  // 3) 버튼 렌더
  // =========================

  // 계속하기
  if (hoverContinue && imgContinueHover) {
    const dw = btnContinue.w * CONTINUE_HOVER_SCALE;
    const dh = btnContinue.h * CONTINUE_HOVER_SCALE;
    const dx = btnContinue.x + (btnContinue.w - dw) / 2;
    const dy = btnContinue.y + (btnContinue.h - dh) / 2;

    drawImageContainClipped(
      imgContinueHover,
      dx, dy, dw, dh,
      CONTINUE_HOVER_VISUAL_ZOOM
    );
  } else {
    image(imgContinue, btnContinue.x, btnContinue.y, btnContinue.w, btnContinue.h);
  }

  // 종료하기
  if (hoverQuit && imgQuitHover) {
    drawImageCoverCropToAspectWithZoom(
      imgQuitHover,
      btnQuit.x, btnQuit.y, btnQuit.w, btnQuit.h,
      imgQuit.width / imgQuit.height,
      QUIT_HOVER_ZOOM
    );
  } else {
    image(imgQuit, btnQuit.x, btnQuit.y, btnQuit.w, btnQuit.h);
  }

  cursor(hoverContinue || hoverQuit ? HAND : ARROW);
}

// =========================
// Mouse
// =========================
function stopScreenMousePressed() {
  if (!stopLoad.done || stopLoad.failed) return;
  if (btnContinue.w === 0 || btnQuit.w === 0) layoutStopButtons();

  // 계속하기 → 원래 화면 복귀
  if (isHover(btnContinue)) {
    if (typeof resumeToPreviousScreen === "function") {
      resumeToPreviousScreen();
    } else if (typeof switchToGameScreen === "function") {
      switchToGameScreen();
    }
    return;
  }

  // 종료하기 → startScreen
 if (isHover(btnQuit)) {
  // ✅ 게임 상태 완전 초기화
  if (typeof resetGameState === "function") {
    resetGameState();
  }

  applyScreen("startScreen");
  if (typeof setup === "function") setup();
  return;
}
}

// =========================
// Loading helpers
// =========================
function ensureStopButtonsLoaded() {
  if (stopLoad.started) return;
  stopLoad.started = true;
  stopLoad.logs = [];

  const total = 4;
  let finished = 0;
  function doneOne() {
    finished++;
    if (finished >= total) {
      stopLoad.done = true;
      if (!imgContinue || !imgQuit) stopLoad.failed = true;
    }
  }

  loadWithBases(FILES.continue, (img, log) => {
    imgContinue = img;
    stopLoad.logs.push(`continue: ${log}`);
    doneOne();
  });
  loadWithBases(FILES.continueHover, (img, log) => {
    imgContinueHover = img;
    stopLoad.logs.push(`continueHover: ${log}`);
    doneOne();
  });
  loadWithBases(FILES.quit, (img, log) => {
    imgQuit = img;
    stopLoad.logs.push(`quit: ${log}`);
    doneOne();
  });
  loadWithBases(FILES.quitHover, (img, log) => {
    imgQuitHover = img;
    stopLoad.logs.push(`quitHover: ${log}`);
    doneOne();
  });
}

function loadWithBases(filename, onDone) {
  let idx = 0;
  function tryNext() {
    if (idx >= BASE_PATHS.length) {
      onDone(null, `FAILED (all bases) -> ${filename}`);
      return;
    }
    const path = BASE_PATHS[idx++] + filename;
    loadImage(
      path,
      img => onDone(img, `OK -> ${path}`),
      () => tryNext()
    );
  }
  tryNext();
}

// =========================
// Layout
// =========================
function layoutStopButtons() {
  if (!imgContinue || !imgQuit) return;

  const cW0 = imgContinue.width, cH0 = imgContinue.height;
  const qW0 = imgQuit.width,     qH0 = imgQuit.height;

  const maxTotalW = width * MAX_TOTAL_W_RATIO;
  const sByW = (maxTotalW - GAP) / (cW0 + qW0);

  const maxBtnH = height * MAX_BTN_H_RATIO;
  const sByH = min(maxBtnH / cH0, maxBtnH / qH0);

  const s = min(sByW, sByH, 1);

  btnContinue.w = cW0 * s;
  btnContinue.h = cH0 * s;
  btnQuit.w     = qW0 * s;
  btnQuit.h     = qH0 * s;

  const totalW = btnContinue.w + GAP + btnQuit.w;
  const startX = (width - totalW) / 2;
  const centerY = height / 2;

  btnContinue.x = startX;
  btnContinue.y = centerY - btnContinue.h / 2;
  btnQuit.x = startX + btnContinue.w + GAP;
  btnQuit.y = centerY - btnQuit.h / 2;
}

// =========================
// Draw utils
// =========================
function drawImageContainClipped(img, dx, dy, dw, dh, zoom = 1.0) {
  const imgAspect = img.width / img.height;
  const boxAspect = dw / dh;

  let w, h;
  if (imgAspect > boxAspect) {
    w = dw; h = dw / imgAspect;
  } else {
    h = dh; w = dh * imgAspect;
  }

  w *= zoom; h *= zoom;
  const x = dx + (dw - w) / 2;
  const y = dy + (dh - h) / 2;

  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(dx, dy, dw, dh);
  drawingContext.clip();
  image(img, x, y, w, h);
  drawingContext.restore();
  pop();
}

function drawImageCoverCropToAspectWithZoom(
  img, dx, dy, dw, dh, targetAspect, zoom = 1.0
) {
  const srcW = img.width, srcH = img.height;
  const srcAspect = srcW / srcH;

  let sx = 0, sy = 0, sw = srcW, sh = srcH;

  if (srcAspect > targetAspect) {
    sw = srcH * targetAspect;
    sx = (srcW - sw) / 2;
  } else if (srcAspect < targetAspect) {
    sh = srcW / targetAspect;
    sy = (srcH - sh) / 2;
  }

  if (zoom > 1.0) {
    const sw2 = sw / zoom;
    const sh2 = sh / zoom;
    sx += (sw - sw2) / 2;
    sy += (sh - sh2) / 2;
    sw = sw2; sh = sh2;
  }

  image(img, dx, dy, dw, dh, sx, sy, sw, sh);
}

// =========================
// Misc
// =========================
function isHover(btn) {
  return mouseX >= btn.x && mouseX <= btn.x + btn.w &&
         mouseY >= btn.y && mouseY <= btn.y + btn.h;
}

function drawStopLoading() {
  fill(255);
  textSize(20);
  text("STOP SCREEN: loading...", 30, 30);
}

function drawStopError() {
  fill(255);
  textSize(18);
  text("STOP SCREEN: load FAILED", 30, 30);
}
