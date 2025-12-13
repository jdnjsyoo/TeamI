let round1Scripts;

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

  // 플레이어
  img = loadImage('assets/userCharacter/유저-1 걷는 옆모습 모션 (1).png');
  imgFront = loadImage('assets/userCharacter/유저-1 정면 스탠딩.png');
  imgBack  = loadImage('assets/userCharacter/유저-1 뒷모습.png');
  imgSit   = loadImage('assets/userCharacter/유저-1 기본 착석.png'); // ⭐ 추가

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
