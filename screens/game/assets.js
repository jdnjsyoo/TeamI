function gameScreenPreload() {
  initializeStationAssets(); // 랜덤 역 선택 및 관련 에셋 로드

  //press enter to start
  pressEnterImg = loadImage("assets/start/pressenter.png");

  // 지하철 내부
  backgr = loadImage('assets/subwayBackground/낮(임산부석O) 창문 투명 - 대화창X.png');
  // 대화창 이미지
  dialogImg = loadImage('assets/subwayBackground/대화창.png');

  // 플레이어
  img = loadImage('assets/userCharacter/유저-1 걷는 옆모습 모션 (1).png');
  imgFront = loadImage('assets/userCharacter/유저-1 정면 스탠딩.png');
  imgBack  = loadImage('assets/userCharacter/유저-1 뒷모습.png');
  imgSit   = loadImage('assets/userCharacter/유저-1 기본 착석.png'); // ⭐ 추가

  // NPC 애니메이션 프레임 로드
  npcAnimationFrames[0] = [
    loadImage('assets/npcChracter/홍대-1 기본 착석.png'),
    loadImage('assets/npcChracter/홍대-1 모션 (1).png'),
    loadImage('assets/npcChracter/홍대-1 모션 (2).png')
  ];
  npcAnimationFrames[1] = [
    loadImage('assets/npcChracter/시청-2 모션.png'),
    loadImage('assets/npcChracter/시청-2 힌트 전광판.png')
  ];
  npcAnimationFrames[2] = [
    loadImage('assets/npcChracter/강남-1 모션 (1).png'),
    loadImage('assets/npcChracter/강남-1 모션 (2).png')
  ];
  npcAnimationFrames[3] = [
    loadImage('assets/npcChracter/강변 군인1.png'),
    loadImage('assets/npcChracter/강변 군인2.png')
  ];
  npcAnimationFrames[4] = [
    loadImage('assets/npcChracter/서울대입구-1 모션 (1).png'),
    loadImage('assets/npcChracter/서울대입구-1 모션 (2).png')
  ];
  npcAnimationFrames[5] = [
    loadImage('assets/npcChracter/성수-1 기본 착석.png'),
    loadImage('assets/npcChracter/성수-1 모션 (1).png'),
    loadImage('assets/npcChracter/성수-1 모션 (2).png')
  ];
  npcAnimationFrames[6] = [
    loadImage('assets/npcChracter/잠실 쇼핑1.png'),
    loadImage('assets/npcChracter/잠실 쇼핑2.png'),
    loadImage('assets/npcChracter/잠실 쇼핑3.png')
  ];

  // 두 번째 NPC의 "서 있는" 이미지
  npcStandImgs[1] = loadImage('assets/npcChracter/시청-2 정면 스탠딩.png');

  // 버튼 이미지 로드
  stopButton = loadImage('assets/buttons/stop_투명.png');
  quitButton = loadImage('assets/buttons/quit_투명.png');
  settingButton = loadImage('assets/buttons/setting_투명.png');
  sitHereImg = loadImage('assets/buttons/sit_here.png');
  sitHereHoverImg = loadImage('assets/buttons/sit_here_hover.png');

  // ⭐ 결과 에셋 로드 (폴더명 result)
  successImg = loadImage('assets/result/SUCCESS.png');
  failImg    = loadImage('assets/result/FAIL.png');

  // Timer images
  timeBarBase = loadImage('assets/time/time0.png');
  timeBar = loadImage('assets/time/time100.png');
}
