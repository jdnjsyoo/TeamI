let round1Scripts;

// 모든 플레이어 캐릭터 에셋을 저장할 배열
let playerCharacterAssets = [];

// img, imgFront, imgBack, imgSit 변수들은 P5.js 전역 스코프에서 관리되거나 다른 파일에서 선언됨.
// 여기서는 별도로 let 선언하지 않고 할당만 수행함.

// 선택된 캐릭터의 에셋을 설정하는 함수
function setPlayerCharacterAssets(index) {
  const assets = playerCharacterAssets[index];
  if (assets) {
    img = assets.walk;
    imgFront = assets.front;
    imgBack = assets.back;
    imgSit = assets.sit;
  } else {
    console.error(`플레이어 캐릭터 에셋을 찾을 수 없습니다: 인덱스 ${index}`);
  }
}

function gameScreenPreload() {
  // 라운드 1에 필요한 동적 에셋 미리 로드
  if (typeof preloadRound1Assets === "function") {
    preloadRound1Assets();
  }

  // 공통 폰트 로드
  dungGeunMoFont = loadFont('assets/fonts/DungGeunMo.ttf');
  
  // 라운드 별 스크립트 로드
  round1Scripts = loadJSON('assets/scripts/round1.json');
  round2Scripts = loadJSON("assets/scripts/round2.json"); 
  round3Scripts = loadJSON("assets/scripts/round3.json"); 


  //press enter to start
  pressEnterImg = loadImage("assets/start/pressenter.png");

  // 지하철 내부
  backgr = loadImage('assets/subwayBackground/낮(임산부석X) 창문 투명 - 대화창X.png');
  // 대화창 이미지
  dialogImg = loadImage('assets/subwayBackground/대화창.png');

  // 모든 플레이어 캐릭터 에셋 미리 로드
  for (let i = 1; i <= 3; i++) {
    playerCharacterAssets[i] = {
      walk: loadImage(`assets/userCharacter/유저-${i} 걷는 옆모습 모션 (1).png`),
      front: loadImage(`assets/userCharacter/유저-${i} 정면 스탠딩.png`),
      back: loadImage(`assets/userCharacter/유저-${i} 뒷모습.png`),
      sit: loadImage(`assets/userCharacter/유저-${i} 기본 착석.png`)
    };
  }

  // 기본값으로 플레이어 캐릭터 에셋 설정
  setPlayerCharacterAssets(playerCharacterIndex);

  // 버튼 이미지 로드
  stopButton = loadImage('assets/buttons/stop_투명.png');
  settingButton = loadImage('assets/buttons/setting_투명.png');
  gameScore = loadImage('assets/result/score.png');
  sitHereImg = loadImage('assets/buttons/sit_here.png');
  sitHereHoverImg = loadImage('assets/buttons/sit_here_hover.png');
  sitArrowImg = loadImage("assets/buttons/sit_arrow.png")

  // ⭐ 결과 에셋 로드 (폴더명 result)
  successImg = loadImage('assets/result/SUCCESS.png');
  failImg    = loadImage('assets/result/FAIL.png');

  // Timer images
  timeBarBase = loadImage('assets/time/time0.png');
  timeBar = loadImage('assets/time/time100.png');
}
