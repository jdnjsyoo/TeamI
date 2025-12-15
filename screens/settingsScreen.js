
let screenBeforeSettings = null;
let settingsScreenBackdrop = null;

function settingsScreenPreload() {
closeBtnImg = loadImage("assets/buttons/quit_투명.png");
}

// screens/settingsScreen.js

const SET_W = 1024;
const SET_H = 869;
const SET_DIM_ALPHA = 160;

let bgmVol = 0.8;
let sfxVol = 0.8;

let bgmBar = { x: 330, y: 330, w: 520, h: 56 };
let sfxBar = { x: 330, y: 470, w: 520, h: 56 };

let btnClose = { x: 1024 - 125, y: 20, w: 116, h: 90 };

const KNOB_D = 18;
const KNOB_R = KNOB_D / 2;

let draggingTarget = null;

// 사운드 그룹(너가 말한 분류 기준)
let bgmSounds = [];
let sfxSounds = [];

function rebuildSoundGroups() {
  bgmSounds = [scriptBgSound, roundPlayingSound, sp_bgm].filter(Boolean);
  sfxSounds = [clickSound, typingSound].filter(Boolean);
}

function applyBgmVolume() { for (const s of bgmSounds) s.setVolume(bgmVol); }
function applySfxVolume() { for (const s of sfxSounds) s.setVolume(sfxVol); }



function settingsScreenSetup() {
  rebuildSoundGroups();
  applyBgmVolume();
  applySfxVolume();

  // 패널 설정
  const panelX = 210;
  const panelY = 160;
  const panelW = 604;
  const cxPanel = panelX + panelW / 2;

  // ✅ [수정 1] 길이와 두께 조정
  // 너비는 유지(320), 높이를 더 두껍게(40)
  const barW = 360; 
  const barH = 130; 

  // 위치 설정 (패널 중앙 정렬)
  bgmBar = { x: cxPanel - barW / 2, y: panelY + 200, w: barW, h: barH };
  sfxBar = { x: cxPanel - barW / 2, y: panelY + 340, w: barW, h: barH };
}


function settingsScreenDraw() {
  resetMatrix();
  // 배경 캡처
  if (settingsScreenBackdrop) image(settingsScreenBackdrop, 0, 0, width, height);
  else background(0);

  // 딤
  noStroke();
  fill(0, SET_DIM_ALPHA);
  rect(0, 0, width, height);

  // 패널
  drawPanel();

  // 닫기
  const hoverClose = isHover(btnClose);
  drawCloseButton(hoverClose);
  cursor(hoverClose ? HAND : ARROW);
}

function drawPanel() {
  // panel box
  push();
  noStroke();
  fill(0, 160);
  rect(210, 160, 604, 560, 18);
  pop();

  // title
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(50);
  text("설정", width / 2, 270);
  pop();

  drawLabel("배경음악", bgmBar.x, bgmBar.y - 1);
  drawVolumeBar(bgmBar, bgmVol);
  drawPercent(bgmBar, bgmVol);

  drawLabel("효과음", sfxBar.x, sfxBar.y - 1);
  drawVolumeBar(sfxBar, sfxVol);
  drawPercent(sfxBar, sfxVol);
}

function drawLabel(txt, x, y) {
  push();
  fill(240);
  textAlign(LEFT, CENTER);
  textSize(26);
  text(txt, x, y);
  pop();
}

function drawPercent(bar, v) {
  v = constrain(v, 0, 1);
  push();
  fill(240);
  textAlign(LEFT, CENTER);
  textSize(18);
  text(`${Math.round(v * 100)}%`, bar.x + bar.w + 18, bar.y + bar.h / 2);
  pop();
}

function drawVolumeBar(bar, v) {
  if (!volBarEmptyImg || !volBarFullImg) return;

  v = constrain(v, 0, 1);

  push();
  noStroke();

  // ✅ [수정 3] 손잡이 크기를 24px로 '강제 고정' (바 높이와 끊어버림)
  const fixedKnobSize = 35;       // 원하는 손잡이 크기 (여기 숫자를 바꾸면 손잡이 크기 변경됨)
  const padding = fixedKnobSize / 2 + 25; 

  // 1. 빈 바(배경) 그리기
  image(volBarEmptyImg, bar.x, bar.y, bar.w, bar.h);

  const activeW = bar.w - (padding * 2); // 움직일 수 있는 실제 길이
  const startX = bar.x + padding;        // 시작 지점

  // 현재 볼륨에 따른 채워질 길이
  const fillLen = activeW * v;
  const knobX = startX + fillLen;

  // 2. 꽉 찬 바(색깔) - Clip으로 자르기
  if (fillLen > 0) {
    drawingContext.save();
    drawingContext.beginPath();
    // 바의 시작부터 손잡이 중심(knobX)까지 자름
    drawingContext.rect(bar.x, bar.y, knobX - bar.x, bar.h);
    drawingContext.clip();
    image(volBarFullImg, bar.x, bar.y, bar.w, bar.h);
    drawingContext.restore();
  }

  // 3. 놉(손잡이) 그리기
  const knobY = bar.y + bar.h / 2;
  
  fill(255);
  drawingContext.shadowBlur = 4;
  drawingContext.shadowColor = "rgba(0,0,0,0.3)";
  
  // bar.h와 상관없이 고정된 크기로 그리기
  circle(knobX, knobY, fixedKnobSize);

  pop();
}

// screens/settingsScreen.js 의 마우스 누름 함수 수정

function settingsScreenMousePressed() {
  rebuildSoundGroups();

  // 1. 닫기 버튼을 눌렀을 때 (기존 코드 유지)
  if (isHover(btnClose)) {
    if (typeof startState !== 'undefined' && startState === "settings") {
      startState = "menu"; 
      settingsScreenBackdrop = null;
    } else if (typeof closeSettingsScreen === "function") {
      closeSettingsScreen();
    }
    return;
  }

  // ✅ [여기가 빠져 있었음!] 볼륨 바 클릭 감지 코드 추가
  // 배경음악 바를 눌렀니?
  if (isInsideRect(mouseX, mouseY, bgmBar)) {
    draggingTarget = "bgm";       // "나 지금 BGM 잡았다!"라고 표시
    setVolFromMouse("bgm", bgmBar); // 클릭하자마자 해당 위치로 볼륨 이동
  } 
  // 효과음 바를 눌렀니?
  else if (isInsideRect(mouseX, mouseY, sfxBar)) {
    draggingTarget = "sfx";       // "나 지금 SFX 잡았다!"라고 표시
    setVolFromMouse("sfx", sfxBar); // 클릭하자마자 해당 위치로 볼륨 이동
  }
}

function settingsScreenMouseDragged() {
  if (draggingTarget === "bgm") setVolFromMouse("bgm", bgmBar);
  if (draggingTarget === "sfx") setVolFromMouse("sfx", sfxBar);
}

function settingsScreenMouseReleased() {
  draggingTarget = null;
}

function setVolFromMouse(which, bar) {
  const fixedKnobSize = 35;
  // ✅ [수정 2] 양옆 여백(Padding)을 줘서 놉이 밖으로 안 나가게 함
  // 바 높이의 절반 정도를 여백으로 주면 놉이 딱 예쁘게 안착됩니다.
  const padding = bar.h / 2; 

  // 실제 슬라이더가 움직일 수 있는 유효 폭
  const activeW = bar.w - (padding * 2);
  
  // 시작점 (x좌표 + 여백)
  const startX = bar.x + padding;

  // 마우스 위치를 0~1 사이 값으로 변환 (constrain으로 0이하, 1이상 방지)
  const v = constrain((mouseX - startX) / activeW, 0, 1);

  if (which === "bgm") {
    bgmVol = v;
    applyBgmVolume();
  } else {
    sfxVol = v;
    applySfxVolume();
  }
}

// close button UI
function drawCloseButton(hover) {
  push();
  
  // 이미지가 정상적으로 로드되었을 때
  if (closeBtnImg) {
    // 호버(마우스 올림) 상태면 약간 어둡게 처리 (클릭 느낌)
    if (hover) {
      tint(200); // 255보다 낮으면 어두워짐
    } else {
      noTint(); // 평소엔 원본 색상
    }

    // 이미지 그리기 (btnClose에 설정된 위치와 크기에 맞춰서)
    image(closeBtnImg, btnClose.x, btnClose.y, btnClose.w, btnClose.h);
    
  } else {
    // ⚠️ 이미지가 없을 경우를 대비한 '비상용' 기존 코드 (개발용)
    noStroke();
    fill(hover ? color(255, 0, 0, 210) : color(0, 0, 0, 170));
    rect(btnClose.x, btnClose.y, btnClose.w, btnClose.h, 12);
    stroke(255);
    strokeWeight(4);
    const cx = btnClose.x + btnClose.w / 2;
    const cy = btnClose.y + btnClose.h / 2;
    line(cx - 12, cy - 12, cx + 12, cy + 12);
    line(cx + 12, cy - 12, cx - 12, cy + 12);
  }

  pop();
}

// utils
function isHover(btn) {
  return mouseX >= btn.x && mouseX <= btn.x + btn.w &&
         mouseY >= btn.y && mouseY <= btn.y + btn.h;
}
function isInsideRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w &&
         py >= r.y && py <= r.y + r.h;
}

