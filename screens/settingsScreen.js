
let emptyBounds = null;
let fullBounds = null;
let frameFrac = null; 

const CAP_L = 18;   // 왼쪽 캡(테두리) 두께
const CAP_R = 18;   // 오른쪽 캡(테두리) 두께
const KNOB_R = 9;   // 손잡이 반지름(지금 circle 18이면 반지름 9)

// ✅ 0/100 이미지의 "공통 프레임"을 비율로 계산
function buildCommonFrameFrac() {
  const ew = volBarEmptyImg.width, eh = volBarEmptyImg.height;
  const fw = volBarFullImg.width,  fh = volBarFullImg.height;

  const eL = emptyBounds.x / ew;
  const eR = (emptyBounds.x + emptyBounds.w) / ew;
  const eT = emptyBounds.y / eh;
  const eB = (emptyBounds.y + emptyBounds.h) / eh;

  const fL = fullBounds.x / fw;
  const fR = (fullBounds.x + fullBounds.w) / fw;
  const fT = fullBounds.y / fh;
  const fB = (fullBounds.y + fullBounds.h) / fh;

  // 둘 중 더 넓은(=캡까지 포함하는) 프레임을 공통 기준으로
  return {
    lx: Math.min(eL, fL),
    rx: Math.max(eR, fR),
    ty: Math.min(eT, fT),
    by: Math.max(eB, fB),
  };
}


function getOpaqueBounds(img) {
  img.loadPixels();
  const w = img.width, h = img.height;

  let minX = w, minY = h, maxX = -1, maxY = -1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = 4 * (y * w + x);
      const a = img.pixels[idx + 3]; // alpha
      if (a > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  // 전부 투명이면 fallback
  if (maxX < 0) return { x: 0, y: 0, w: w, h: h };

  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}


// screens/settingsScreen.js
// 설정 화면 (stopScreen 스타일 오버레이)

// ===== 볼륨 값 =====
let bgmVol = 0.8;
let sfxVol = 0.8;

// ===== UI 위치 =====
let bgmBar = { x: 340, y: 330, w: 340, h: 44 };
let sfxBar = { x: 340, y: 470, w: 340, h: 44 };
let btnClose = { x: 1024 - 90, y: 40, w: 50, h: 50 };

// ===== 상태 =====
let draggingTarget = null;

// ===== 사운드 그룹 =====
let bgmSounds = [];
let sfxSounds = [];

function rebuildSoundGroups() {
  bgmSounds = [scriptBgSound, roundPlayingSound, sp_bgm].filter(Boolean);
  sfxSounds = [clickSound, typingSound].filter(Boolean);
}

function applyBgmVolume() {
  for (const s of bgmSounds) s.setVolume(bgmVol);
}

function applySfxVolume() {
  for (const s of sfxSounds) s.setVolume(sfxVol);
}

// ===== screen hooks =====
function settingsScreenPreload() {
}

function settingsScreenSetup() {
  createCanvas(1024, 869);
  emptyBounds = getOpaqueBounds(volBarEmptyImg);
  fullBounds  = getOpaqueBounds(volBarFullImg);
  emptyBounds = getOpaqueBounds(volBarEmptyImg);
fullBounds  = getOpaqueBounds(volBarFullImg);

// ✅ 프레임 기준은 무조건 0.png(빈 바) 기준으로!
frameFrac = {
  lx: emptyBounds.x / volBarEmptyImg.width,
  rx: (emptyBounds.x + emptyBounds.w) / volBarEmptyImg.width,
  ty: emptyBounds.y / volBarEmptyImg.height,
  by: (emptyBounds.y + emptyBounds.h) / volBarEmptyImg.height,
};

  rebuildSoundGroups();
  applyBgmVolume();
  applySfxVolume();
}

function settingsScreenDraw() {
  // 배경 (이전 화면 캡처)
  if (settingsScreenBackdrop) {
    image(settingsScreenBackdrop, 0, 0, width, height);
  } else {
    background(0);
  }

  // 어두운 오버레이
  fill(0, 160);
  noStroke();
  rect(0, 0, width, height);

  // 패널
  drawPanel();

  // 닫기 버튼
  drawCloseButton();
  cursor(isHover(btnClose) ? HAND : ARROW);
}

// ===== 패널 =====
function drawPanel() {
  fill(0, 160);
  rect(230, 170, 560, 520, 18);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("설정", width / 2, 230);

  drawLabel("배경음악", bgmBar.x, bgmBar.y - 35);
  drawVolumeBar(bgmBar, bgmVol);
  drawPercent(bgmBar, bgmVol);

  drawLabel("효과음", sfxBar.x, sfxBar.y - 35);
  drawVolumeBar(sfxBar, sfxVol);
  drawPercent(sfxBar, sfxVol);
}

// ===== 입력 =====
function settingsScreenMousePressed() {
  rebuildSoundGroups();

  if (isHover(btnClose)) {
    closeSettingsScreen();
    return;
  }

  if (isInsideRect(mouseX, mouseY, bgmBar)) {
    draggingTarget = "bgm";
    setVolFromMouse("bgm", bgmBar);
  } else if (isInsideRect(mouseX, mouseY, sfxBar)) {
    draggingTarget = "sfx";
    setVolFromMouse("sfx", sfxBar);
  }
}

function settingsScreenMouseDragged() {
  if (draggingTarget === "bgm") setVolFromMouse("bgm", bgmBar);
  if (draggingTarget === "sfx") setVolFromMouse("sfx", sfxBar);
}

function settingsScreenMouseReleased() {
  draggingTarget = null;
}

// ===== UI =====

function drawVolumeBar(bar, v) {
  v = constrain(v, 0, 1);

  push();
  noStroke();

  // frameFrac 준비 안 됐으면 fallback
  if (!frameFrac) {
    image(volBarEmptyImg, bar.x, bar.y, bar.w, bar.h);
    const fillW0 = Math.round(bar.w * v);
    if (fillW0 > 0) {
      image(volBarFullImg, bar.x, bar.y, fillW0, bar.h, 0, 0, fillW0, volBarFullImg.height);
    }
    // 손잡이
    fill(255);
    circle(bar.x + fillW0, bar.y + bar.h/2, KNOB_R*2);
    pop();
    return;
  }

  // ✅ 공통 프레임(source rect) 구하기: "빈 바 기준 프레임"을 두 이미지에 동일 적용
  function srcRectByFrame(img) {
    const sx = Math.round(frameFrac.lx * img.width);
    const sy = Math.round(frameFrac.ty * img.height);
    const sw = Math.round((frameFrac.rx - frameFrac.lx) * img.width);
    const sh = Math.round((frameFrac.by - frameFrac.ty) * img.height);
    return { sx, sy, sw, sh };
  }

  const eSrc = srcRectByFrame(volBarEmptyImg);
  const fSrc = srcRectByFrame(volBarFullImg);

  // 1) 빈 바: 같은 프레임을 bar 박스에 렌더
  image(
    volBarEmptyImg,
    bar.x, bar.y, bar.w, bar.h,
    eSrc.sx, eSrc.sy, eSrc.sw, eSrc.sh
  );

  // 2) 찬 바: 같은 프레임 중에서 v만큼만 잘라 덮기
  // 손잡이가 밖으로 안 튀게: fill 영역을 (bar.w - 2*KNOB_R)로 제한
  const trackX = bar.x + KNOB_R;
  const trackW = bar.w - KNOB_R * 2;
  const fillW  = Math.round(trackW * v);

  if (fillW > 0) {
    const srcW = Math.round(fSrc.sw * (fillW / bar.w)); // bar.w 기준 비례
    image(
      volBarFullImg,
      trackX, bar.y, fillW, bar.h,
      fSrc.sx, fSrc.sy, srcW, fSrc.sh
    );
  }

  // 3) 손잡이(트랙 안쪽 고정)
  fill(255);
  circle(trackX + fillW, bar.y + bar.h / 2, KNOB_R * 2);

  pop();
}



function drawLabel(txt, x, y) {
  fill(230);
  textAlign(LEFT, CENTER);
  textSize(22);
  text(txt, x, y);
}

function drawPercent(bar, v) {
  fill(230);
  textSize(18);
  text(`${Math.round(v * 100)}%`, bar.x + bar.w + 20, bar.y + bar.h / 2);
}

function drawCloseButton() {
   fill(255, 0, 0, 200); // 
  rect(btnClose.x, btnClose.y, btnClose.w, btnClose.h, 12);

  stroke(255);
  strokeWeight(4);
  const cx = btnClose.x + btnClose.w / 2;
  const cy = btnClose.y + btnClose.h / 2;
  line(cx - 12, cy - 12, cx + 12, cy + 12);
  line(cx + 12, cy - 12, cx - 12, cy + 12);
  noStroke();
}

// ===== utils =====
function setVolFromMouse(which, bar) {
  const trackX = bar.x + CAP_L + KNOB_R;
  const trackW = bar.w - CAP_L - CAP_R - KNOB_R * 2;
  // 0~1로 무조건 고정
  const v = constrain((mouseX - bar.x) / bar.w, 0, 1);

  if (which === "bgm") {
    bgmVol = v;
    applyBgmVolume();
  } else {
    sfxVol = v;
    applySfxVolume();
  }
}


function isHover(btn) {
  return mouseX >= btn.x && mouseX <= btn.x + btn.w &&
         mouseY >= btn.y && mouseY <= btn.y + btn.h;
}

function isInsideRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w &&
         py >= r.y && py <= r.y + r.h;
}
