// ===============
// 지하철 자리전쟁 시작 화면 (startScreen)
// ===============

// 상태 관리
let startState = "menu"; // "menu", "howto", "settings"

// 이미지 변수
let imgStartBg; // 움직이는 뒷배경
let imgStartFg; // 고정된 앞화면

// ✅ [변경] 플레이 방법 이미지 배열로 변경
let howtoImages = []; 
let howtoIndex = 0; // 현재 몇 페이지인지 (0부터 시작)

// 배경 스크롤 변수
let bgX = 0;
const BG_SPEED = 2;

// 하이라이트 색상
let st_highlightColor;

// 버튼 좌표
let btnStart  = { x: 197, y: 701, r: 143 };  
let btnHowto  = { x: 510, y: 701, r: 143 };  
let btnHint   = { x: 820, y: 701, r: 143 };  

// 플레이 방법 화면 닫기 버튼 (기존 유지)
let closeBtn = { x: 900, y: 110, w: 45, h: 46 };

// ✅ [추가] 다음/이전 페이지 넘기는 버튼 (화면 양옆 중앙)
// r: 반지름 (클릭 범위)
let btnPrev = { x: 60,  y: 434, r: 40 }; 
let btnNext = { x: 964, y: 434, r: 40 }; 

// =====================
// 1) startScreenPreload
// =====================
function startScreenPreload() {
  imgStartBg = loadImage("assets/start/startbg1.png"); 
  imgStartFg = loadImage("assets/start/startpage1.png");

  // ✅ [변경] 플레이 방법 이미지 4장 불러오기 (tu1 ~ tu4)
  // 파일명이 tu1.png, tu2.png ... 형식이어야 합니다.
  for (let i = 1; i <= 4; i++) {
    howtoImages.push(loadImage(`assets/start/tu${i}.png`));
  }

  selectPlayerPreload();
  gameScreenPreload();

  if (typeof settingsScreenPreload === "function") {
    settingsScreenPreload();
  }
}

// =====================
// 2) startScreenSetup
// =====================
function startScreenSetup() {
  createCanvas(1024, 869); 

  st_highlightColor = color(255, 255, 20, 120);
  startState = "menu";
  bgX = 0; 

  if (typeof settingsScreenSetup === "function") {
    settingsScreenSetup();
  }
}

// =====================
// 3) startScreenDraw
// =====================
function startScreenDraw() {
  if (startState === "menu") {
    drawStartMenu();
  } else if (startState === "howto") {
    drawHowto(); // ✅ 변경된 그리기 함수 호출
  } else if (startState === "settings") { 
    if (typeof settingsScreenDraw === "function") {
      settingsScreenDraw();
    }
  }
}

// ------------- 각 화면 그리기 -------------

function drawStartMenu() {
  image(imgStartBg, bgX, 0, width, height);
  image(imgStartBg, bgX + width, 0, width, height);

  bgX -= BG_SPEED;
  if (bgX <= -width) {
    bgX = 0;
  }

  image(imgStartFg, 0, 0, width, height);
  drawMenuButtons();
}

function drawMenuButtons() {
  noFill();
  stroke(st_highlightColor);
  strokeWeight(10);

  if (insideCircle(mouseX, mouseY, btnStart)) ellipse(btnStart.x, btnStart.y, btnStart.r * 2 + 10);
  if (insideCircle(mouseX, mouseY, btnHowto)) ellipse(btnHowto.x, btnHowto.y, btnHowto.r * 2 + 10);
  if (insideCircle(mouseX, mouseY, btnHint)) ellipse(btnHint.x, btnHint.y, btnHint.r * 2 + 10);
}

// ✅ [변경] 플레이 방법 화면 그리기 (슬라이드 기능)
function drawHowto() {
  // 1. 현재 인덱스에 맞는 이미지 그리기
  // 이미지가 제대로 로드되었는지 확인 후 그리기
  if (howtoImages[howtoIndex]) {
    image(howtoImages[howtoIndex], 0, 0, width, height);
  }

  // 2. 화살표 그리기 (첫 페이지가 아닐 때만 '이전' 버튼 표시)
  if (howtoIndex > 0) {
    drawArrowBtn(btnPrev, "left");
  }

  // 3. 화살표 그리기 (마지막 페이지가 아닐 때만 '다음' 버튼 표시)
  // 이미지 개수 - 1 이 마지막 인덱스입니다.
  if (howtoIndex < howtoImages.length - 1) {
    drawArrowBtn(btnNext, "right");
  }
  
  // 4. 닫기 버튼은 이미지 안에 그려져 있다고 하셨지만,
  // 혹시 버튼 영역 확인용으로 그려보고 싶으면 주석 해제하세요.
  // noFill(); stroke(255, 0, 0); rect(closeBtn.x, closeBtn.y, closeBtn.w, closeBtn.h);
}

// 화살표 버튼 그리는 함수 (동그라미 + 삼각형)
function drawArrowBtn(btn, direction) {
  push();
  
  // 마우스 올리면 약간 밝게
  if (insideCircle(mouseX, mouseY, btn)) {
    fill(0, 0, 0, 150); // 배경 원 (진하게)
    stroke(255);
  } else {
    fill(0, 0, 0, 100); // 배경 원 (연하게)
    noStroke();
  }
  
  // 원 그리기
  ellipse(btn.x, btn.y, btn.r * 2);

  // 화살표(삼각형) 그리기
  fill(255);
  noStroke();
  if (direction === "left") {
    // ◀ 모양
    triangle(btn.x - 10, btn.y, btn.x + 10, btn.y - 15, btn.x + 10, btn.y + 15);
  } else {
    // ▶ 모양
    triangle(btn.x + 10, btn.y, btn.x - 10, btn.y - 15, btn.x - 10, btn.y + 15);
  }
  
  pop();
}

// =====================
// 4) 입력 처리
// =====================
function startScreenMousePressed() {
  // 메뉴 화면
  if (startState === "menu") {
    if (insideCircle(mouseX, mouseY, btnStart)) {
      if (typeof switchToSelectPlayerScreen === "function") {
        switchToSelectPlayerScreen();
      }
      return;
    } else if (insideCircle(mouseX, mouseY, btnHowto)) {
      startState = "howto";
      howtoIndex = 0; // ✅ 열 때마다 1페이지(0번)부터 시작하도록 리셋
      return;
    } else if (insideCircle(mouseX, mouseY, btnHint)) {
      settingsScreenBackdrop = get(); 
      startState = "settings"; 
      return;
    }
  }

  // 설정창 화면
  if (startState === "settings") {
    if (typeof settingsScreenMousePressed === "function") {
      settingsScreenMousePressed();
    }
    return;
  }

  // ✅ [변경] 플레이 방법 화면 (닫기 + 페이지 넘기기)
  if (startState === "howto") {
    // 1. 닫기 버튼 (오른쪽 상단 X)
    if (insideRect(mouseX, mouseY, closeBtn)) {
      startState = "menu";
    }
    
    // 2. 이전 버튼 (왼쪽 화살표) - 첫 페이지 아닐 때만 작동
    else if (howtoIndex > 0 && insideCircle(mouseX, mouseY, btnPrev)) {
      howtoIndex--; // 인덱스 감소 (이전 페이지)
    }
    
    // 3. 다음 버튼 (오른쪽 화살표) - 마지막 페이지 아닐 때만 작동
    else if (howtoIndex < howtoImages.length - 1 && insideCircle(mouseX, mouseY, btnNext)) {
      howtoIndex++; // 인덱스 증가 (다음 페이지)
    }
  }
}

function startScreenMouseDragged() {
  if (startState === "settings") {
    if (typeof settingsScreenMouseDragged === "function") {
      settingsScreenMouseDragged();
    }
  }
}

function startScreenMouseReleased() {
    if (startState === "settings") {
        if (typeof settingsScreenMouseReleased === "function") {
            settingsScreenMouseReleased();
        }
    }
}

function startScreenKeyPressed() {
  if (keyCode === ESCAPE) {
    if (startState === "settings") {
      closeSettingsScreen();
    } else {
      startState = "menu";
    }
  }
}

// =====================
// 5) 유틸 함수
// =====================

function closeSettingsScreen() {
  startState = "menu";            
  settingsScreenBackdrop = null; 
}

function insideCircle(mx, my, btn) {
  let d = dist(mx, my, btn.x, btn.y);
  return d <= btn.r;
}

function insideRect(mx, my, rectObj) {
  return (
    mx >= rectObj.x &&
    mx <= rectObj.x + rectObj.w &&
    mx >= rectObj.y &&
    mx <= rectObj.y + rectObj.h
  );
}