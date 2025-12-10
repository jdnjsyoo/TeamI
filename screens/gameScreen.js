// 전역 변수 - Round1 클래스 인스턴스를 담을 변수

let currentRound = 1;
let round1_instance = null;
let round2_instance = null;

// Round2로 넘어갈 때 호출할 헬퍼 (Round1에서 부름)
// gameScreen.js
function switchToRound2() {
  console.log("=== SWITCH TO ROUND 2 ===");

  // 🔥 1) 2라운드용 역 + NPC 다시 뽑기
  //    (loadRound2Assets는 round2 코드 쪽에 정의되어 있어야 함)
  if (typeof loadRound2Assets === "function") {
    loadRound2Assets();
  }

  // 🔥 2) Round2 인스턴스 생성 / 재생성
  //    한 번만 만들고 재사용하고 싶으면 if (!round2_instance)만 쓰고,
  //    매번 새로 시작하고 싶으면 그냥 매번 new 해도 됨.
  round2_instance = new Round2();
  round2_instance.setup();

  // 🔥 3) 현재 라운드 / 씬 전환
  currentRound = 2;

  if (typeof currentScene !== "undefined") {
    currentScene = round2_instance;
  }
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
  }
}

function gameScreenKeyPressed() {
  if (currentRound === 1 && round1_instance) {
    round1_instance.keyPressed();
  } else if (currentRound === 2 && round2_instance) {
    round2_instance.keyPressed();
  }
  return false;
}

function gameScreenMousePressed() {
  if (currentRound === 1 && round1_instance) {
    round1_instance.mousePressed();
  } else if (currentRound === 2 && round2_instance) {
    round2_instance.mousePressed();
  }
}
