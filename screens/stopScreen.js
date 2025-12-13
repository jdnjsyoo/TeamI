// screens/stopScreen.js
// STOP SCREEN: black bg + 2 centered buttons + hover swap
// Click:
//  - Continue: resumeToPreviousScreen()  (setup 없이 복귀 → 진행 유지)
//  - Quit:     startScreen으로

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

const CONTINUE_HOVER_SCALE = 1.0;
const CONTINUE_HOVER_VISUAL_ZOOM = 1.24;
const QUIT_HOVER_ZOOM = 1.0;

function stopScreenPreload() {}

function stopScreenSetup() {
  createCanvas(STOP_W, STOP_H);
}

function stopScreenDraw() {
  background(0);

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

  // 계속하기
  if (hoverContinue && imgContinueHover) {
    const dw = btnContinue.w * CONTINUE_HOVER_SCALE;
    const dh = btnContinue.h * CONTINUE_HOVER_SCALE;
    const dx = btnContinue.x + (btnContinue.w - dw) / 2;
    const dy = btnContinue.y + (btnContinue.h - dh) / 2;

    drawImageContainClipped(imgContinueHover, dx, dy, dw, dh, CONTINUE_HOVER_VISUAL_ZOOM);
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

// ✅ 너 라우터(mousePressed)에서 자동 호출됨
function stopScreenMousePressed() {
  if (!stopLoad.done || stopLoad.failed) return;
  if (btnContinue.w === 0 || btnQuit.w === 0) layoutStopButtons();

  if (isHover(btnContinue)) {
    // ✅✅ 핵심: setup 없이 복귀 → "누른 순간 위치" 그대로
    if (typeof resumeToPreviousScreen === "function") {
      resumeToPreviousScreen();
    } else if (typeof switchToGameScreen === "function") {
      // fallback (이건 setup 실행되므로 위치 리셋 가능)
      switchToGameScreen();
    }
    return;
  }

  if (isHover(btnQuit)) {
    // startScreen으로
    if (typeof clearResumeTarget === "function") clearResumeTarget();

    applyScreen("startScreen");
    if (typeof setup === "function") setup();
    return;
  }
}

// -------------------- Loading
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

  loadWithBases(FILES.continue, (img, log) => { imgContinue = img; stopLoad.logs.push(`continue: ${log}`); doneOne(); });
  loadWithBases(FILES.continueHover, (img, log) => { imgContinueHover = img; stopLoad.logs.push(`continueHover: ${log}`); doneOne(); });
  loadWithBases(FILES.quit, (img, log) => { imgQuit = img; stopLoad.logs.push(`quit: ${log}`); doneOne(); });
  loadWithBases(FILES.quitHover, (img, log) => { imgQuitHover = img; stopLoad.logs.push(`quitHover: ${log}`); doneOne(); });
}

function loadWithBases(filename, onDone) {
  let idx = 0;
  function tryNext() {
    if (idx >= BASE_PATHS.length) {
      onDone(null, `FAILED (all bases) -> ${filename}`);
      return;
    }
    const path = BASE_PATHS[idx++] + filename;
    loadImage(path, (img) => onDone(img, `OK -> ${path}`), () => tryNext());
  }
  tryNext();
}

// -------------------- Layout
function layoutStopButtons() {
  if (!imgContinue || !imgQuit) return;

  const cW0 = imgContinue.width, cH0 = imgContinue.height;
  const qW0 = imgQuit.width,     qH0 = imgQuit.height;

  const maxTotalW = width * MAX_TOTAL_W_RATIO;
  const sByW = (maxTotalW - GAP) / (cW0 + qW0);

  const maxBtnH = height * MAX_BTN_H_RATIO;
  const sByH = min(maxBtnH / cH0, maxBtnH / qH0);

  const s = min(sByW, sByH, 1);

  btnContinue.w = cW0 * s; btnContinue.h = cH0 * s;
  btnQuit.w = qW0 * s;     btnQuit.h = qH0 * s;

  const totalW = btnContinue.w + GAP + btnQuit.w;
  const startX = (width - totalW) / 2;
  const centerY = height / 2;

  btnContinue.x = startX;
  btnContinue.y = centerY - btnContinue.h / 2;

  btnQuit.x = startX + btnContinue.w + GAP;
  btnQuit.y = centerY - btnQuit.h / 2;
}

// -------------------- Draw helpers
function drawImageContainClipped(img, dx, dy, dw, dh, zoom = 1.0) {
  const imgAspect = img.width / img.height;
  const boxAspect = dw / dh;

  let w, h;
  if (imgAspect > boxAspect) { w = dw; h = dw / imgAspect; }
  else { h = dh; w = dh * imgAspect; }

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

function drawImageCoverCropToAspectWithZoom(img, dx, dy, dw, dh, targetAspect, zoom = 1.0) {
  const srcW = img.width, srcH = img.height;
  const srcAspect = srcW / srcH;

  let sx = 0, sy = 0, sw = srcW, sh = srcH;

  if (srcAspect > targetAspect) { sw = srcH * targetAspect; sx = (srcW - sw) / 2; }
  else if (srcAspect < targetAspect) { sh = srcW / targetAspect; sy = (srcH - sh) / 2; }

  if (zoom && zoom > 1.0) {
    const sw2 = sw / zoom, sh2 = sh / zoom;
    sx += (sw - sw2) / 2; sy += (sh - sh2) / 2;
    sw = sw2; sh = sh2;
  }
  image(img, dx, dy, dw, dh, sx, sy, sw, sh);
}

// -------------------- Helpers
function isHover(btn) {
  return mouseX >= btn.x && mouseX <= btn.x + btn.w &&
         mouseY >= btn.y && mouseY <= btn.y + btn.h;
}

function drawStopLoading() {
  fill(255); textSize(20);
  text("STOP SCREEN: loading...", 30, 30);
}

function drawStopError() {
  fill(255); textSize(18);
  text("STOP SCREEN: load FAILED", 30, 30);
}
