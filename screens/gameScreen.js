// 전역 변수 - Round 클래스 인스턴스를 담을 변수

let currentRound = 1;
let round1_instance = null;
let round2_instance = null;
let round3_instance = null;

// Round2로 넘어갈 때 호출할 헬퍼 (Round1에서 부름)
function switchToRound2() {
  console.log("=== SWITCH TO ROUND 2 ===");

  if (typeof loadRound2Assets === "function") {
    loadRound2Assets();
  }

  round2_instance = new Round2();
  round2_instance.setup();

  currentRound = 2;
}

// Round3로 넘어갈 때 호출할 헬퍼 (Round2에서 부름)
function switchToRound3() {
  console.log("=== SWITCH TO ROUND 3 ===");

  if (typeof loadRound1Assets === "function") {
    loadRound1Assets();
  }

  round3_instance = new Round3();
  round3_instance.setup();

  currentRound = 3;
}



// gameScreenPreload 함수는 screens/game/assets.js 파일에 있습니다.

function gameScreenSetup() {
  createCanvas(1024, 869);
  round1_instance = new Round1();
  round1_instance.setup();
}

function gameScreenDraw() {
  if (currentRound === 1 && round1_instance) {
    round1_instance.draw();
  } else if (currentRound === 2 && round2_instance) {
    round2_instance.draw();
  } else if (currentRound === 3 && round3_instance) {
    round3_instance.draw();
  }
}

function gameScreenKeyPressed() {
  if (currentRound === 1 && round1_instance) {
    round1_instance.keyPressed();
  } else if (currentRound === 2 && round2_instance) {
    round2_instance.keyPressed();
  } else if (currentRound === 3 && round3_instance) {
    round3_instance.keyPressed();
  }
  return false;
}

function gameScreenMousePressed() {
  if (currentRound === 1 && round1_instance) {
    round1_instance.mousePressed();
  } else if (currentRound === 2 && round2_instance) {
    round2_instance.mousePressed();
  } else if (currentRound === 3 && round3_instance) {
    round3_instance.mousePressed();
  }
}
