
// gameScreen.js의 함수들을 사용하여 메인에서 바로 gameScreen이 뜨도록 연결
let gameScreenPreload, gameScreenSetup, gameScreenDraw;

// gameScreen.js의 함수들을 임포트
// p5.js에서는 전역 함수로 정의되어 있으므로, 아래처럼 위임만 하면 됨

preload = typeof preload === 'function' ? preload : undefined;
setup   = typeof setup   === 'function' ? setup   : undefined;
draw    = typeof draw    === 'function' ? draw    : undefined;
