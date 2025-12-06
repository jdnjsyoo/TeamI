// 전역 변수 - Round1 클래스 인스턴스를 담을 변수
let round1_instance;

// gameScreenPreload 함수는 screens/game/assets.js 파일에 있습니다.

function gameScreenSetup() {
  createCanvas(1024, 869);
  round1_instance = new Round1();
  round1_instance.setup();
}

function gameScreenDraw() {
  if (round1_instance) {
    round1_instance.draw();
  }
}

function gameScreenKeyPressed() {
  if (round1_instance) {
    round1_instance.keyPressed();
  }
}

function gameScreenMousePressed() {
  if (round1_instance) {
    round1_instance.mousePressed();
  }
}
