function gameScreenPreload() {
  initializeStationAssets(); // 랜덤 역 선택 및 관련 에셋 로드

  // 공통 폰트 로드
  dungGeunMoFont = loadFont('assets/fonts/DungGeunMo.ttf');

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
    loadImage('assets/npcChracter/sitting/홍대_애니_1.png'),
    loadImage('assets/npcChracter/sitting/홍대_애니_2.png'),
    loadImage('assets/npcChracter/sitting/홍대_애니_3.png')
  ];
  npcAnimationFrames[1] = [
    loadImage('assets/npcChracter/sitting/시청_서류_1.png'),
    loadImage('assets/npcChracter/hint/시청_서류_힌트.png')
  ];
  npcAnimationFrames[2] = [
    loadImage('assets/npcChracter/sitting/강남_직장인_1.png'),
    loadImage('assets/npcChracter/sitting/강남_직장인_2.png')
  ];
  npcAnimationFrames[3] = [
    loadImage('assets/npcChracter/sitting/강변_군인_1.png'),
    loadImage('assets/npcChracter/sitting/강변_군인_2.png')
  ];
  npcAnimationFrames[4] = [
    loadImage('assets/npcChracter/sitting/서울대입구_책_1.png'),
    loadImage('assets/npcChracter/sitting/서울대입구_책_2.png')
  ];
  npcAnimationFrames[5] = [
    loadImage('assets/npcChracter/sitting/성수_쇼핑백_2.png'),
    loadImage('assets/npcChracter/sitting/성수_쇼핑백_3.png')
  ];
  npcAnimationFrames[6] = [
    loadImage('assets/npcChracter/sitting/잠실_코트_1.png'),
    loadImage('assets/npcChracter/sitting/잠실_코트_2.png')
  ];

  // 두 번째 NPC의 "서 있는" 이미지
  npcStandImgs[1] = loadImage('assets/npcChracter/standing/시청_서류_스탠딩.png');

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
