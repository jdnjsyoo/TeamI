let round1Scripts;

// 모든 플레이어 캐릭터 에셋을 저장할 배열
let playerCharacterAssets = [];

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

// =======================
// ⭐ SCOREBOARD STATE
// =======================
let scoreCount = 0;          // 0 ~ 3
let scoreImages = [];        // [score, score_1, score_2, score_3]

// preload에서 로드된 gameScore를 기준으로 세팅
function initScoreboard() {
  scoreCount = 0;
  scoreImages = [
    loadImage('assets/result/score.png'),
    loadImage('assets/result/score_1.png'),
    loadImage('assets/result/score_2.png'),
    loadImage('assets/result/score_3.png'),
  ];
  gameScore = scoreImages[0];
}

// SUCCESS 시 1회만 증가
function addSuccessScoreOnce(instance) {
  // 이미 이 Round에서 성공 처리된 경우 방지
  if (instance._scoreAdded) return;

  instance._scoreAdded = true;

  scoreCount = min(scoreCount + 1, 3);
  gameScore = scoreImages[scoreCount];

  console.log("✅ SCORE UP:", scoreCount);
}

// 라운드 시작/재시작 시 초기화용
function resetScoreboard() {
  scoreCount = 0;
  gameScore = scoreImages[0];
}


function gameScreenPreload() {
  // =========================
  // 라운드 1에 필요한 동적 에셋
  // =========================
  if (typeof preloadRound1Assets === "function") {
    preloadRound1Assets();
  }

  // =========================
  // 공통 폰트
  // =========================
  dungGeunMoFont = loadFont('assets/fonts/DungGeunMo.ttf');
  
  // =========================
  // 라운드 스크립트
  // =========================
  round1Scripts = loadJSON('assets/scripts/round1.json');
  round2Scripts = loadJSON('assets/scripts/round2.json'); 
  round3Scripts = loadJSON('assets/scripts/round3.json'); 

  // =========================
  // start / 안내 이미지
  // =========================
  pressEnterImg = loadImage("assets/start/pressenter.png");

  // =========================
  // 지하철 배경 / 대화창
  // =========================
  backgr = loadImage('assets/subwayBackground/낮(임산부석X) 창문 투명 - 대화창X.png');
  dialogImg = loadImage('assets/subwayBackground/대화창.png');

  // =========================
  // 플레이어 캐릭터 에셋
  // =========================
  for (let i = 1; i <= 3; i++) {
    playerCharacterAssets[i] = {
      walk:  loadImage(`assets/userCharacter/유저-${i} 걷는 옆모습 모션 (1).png`),
      front: loadImage(`assets/userCharacter/유저-${i} 정면 스탠딩.png`),
      back:  loadImage(`assets/userCharacter/유저-${i} 뒷모습.png`),
      sit:   loadImage(`assets/userCharacter/유저-${i} 기본 착석.png`)
    };
  }

  // 기본 플레이어 캐릭터 적용
  setPlayerCharacterAssets(playerCharacterIndex);

  // =========================
  // UI 버튼들
  // =========================
  stopButton    = loadImage('assets/buttons/stop_투명.png');
  settingButton = loadImage('assets/buttons/setting_투명.png');

  sitHereImg       = loadImage('assets/buttons/sit_here.png');
  sitHereHoverImg  = loadImage('assets/buttons/sit_here_hover.png');
  sitArrowImg      = loadImage("assets/buttons/sit_arrow.png");

  // =========================
  // 결과 오버레이 (SUCCESS / FAIL)
  // =========================
  successImg = loadImage('assets/result/SUCCESS.png');
  failImg    = loadImage('assets/result/FAIL.png');

  // =========================
  // 타이머
  // =========================
  timeBarBase = loadImage('assets/time/time0.png');
  timeBar     = loadImage('assets/time/time100.png');

  // ⚠️ 중요
  // ❌ gameScore preload 제거
  // 점수판은 drawScoreboardUI()에서 lazy-load로 처리

  initScoreboard(); 
}


