let round1Scripts;
let gameNpcs = []; // Global array to store generated NPC data

// Define the available station and spec combinations
const stationSpecs = {
  "강남": ["직장인", "화장"],
  "강변": ["군인", "백팩", "캐리어"],
  "서울대입구": ["잠", "책"],
  "성수": ["쇼핑백", "폰"],
  "시청": ["서류", "집회"],
  "을지로": ["외국인", "힙합"],
  "잠실": ["코트", "학생"],
  "홍대": ["애니", "탈색"]
};

// Define frame counts for sitting animations where they are not 3
const sittingFrameCounts = {
  "강남_직장인": 2, // '강남_직장인' only has _1 and _2
  "시청_집회": 2,   // '시청_집회' only has _1 and _2
  "잠실_코트": 2,   // '잠실_코트' only has _1 and _2
  "강변_군인": 2,   // '강변_군인' only has _1 and _2
  "서울대입구_잠": 2, // '서울대입구_잠' only has _1 and _2
  "서울대입구_책": 2,
  "을지로_외국인": 2, // '을지로_외국인' only has _1 and _2
  "강남_화장": 2,   // '강남_화장' only has _1 and _2
  "잠실_학생": 2,   // '잠실_학생' only has _1 and _2
  "성수_폰": 2,     // '성수_폰' only has _1 and _2
  "강변_백팩": 2,   // '강변_백팩' only has _1 and _2
  // Add other exceptions here as needed
};

function initializeStationAssets() {
  // 역 관련 에셋
  const stations = ["강남", "강변", "서울대입구", "성수", "시청", "을지로", "잠실", "홍대"];
  currentStationName = random(stations); // 역 이름 랜덤 선택
  
  // currentStationName에 따라 다른 이미지 로드
  stationImg = loadImage(`assets/scenery/역_${currentStationName}.PNG`);
  cityImg = loadImage(`assets/scenery/${currentStationName}.png`);
  cloudImg = loadImage('assets/scenery/구름.png'); // 구름 이미지는 공통
}

function generateRandomNpcs() {
  gameNpcs = []; // Clear previous NPCs
  const allStations = Object.keys(stationSpecs);
  
  // Select 7 unique stations
  let selectedStations = [currentStationName];
  let availableStations = allStations.filter(s => s !== currentStationName);
  
  // Shuffle available stations and pick 6 more
  for (let i = availableStations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableStations[i], availableStations[j]] = [availableStations[j], availableStations[i]];
  }
  selectedStations = selectedStations.concat(availableStations.slice(0, 6));

  // Shuffle the final selected stations to randomize seat order
  for (let i = selectedStations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedStations[i], selectedStations[j]] = [selectedStations[j], selectedStations[i]];
  }

  // Generate NPC objects
  selectedStations.forEach(station => {
    const specsForStation = stationSpecs[station];
    const randomSpec = random(specsForStation); // Pick a random spec for the chosen station
    const isCorrectNpc = (station === currentStationName);

    let sittingImgs = [];
    // Determine max frames for this NPC type, default to 3 if not specified
    const npcKey = `${station}_${randomSpec}`;
    const maxFrames = sittingFrameCounts[npcKey] !== undefined ? sittingFrameCounts[npcKey] : 3;

    // Load sitting images up to maxFrames
    for (let i = 1; i <= maxFrames; i++) {
      const path = `assets/npcChracter/sitting/${station}_${randomSpec}_${i}.png`;
      console.log(`Loading sitting image: ${path}`);
      let img = loadImage(path, 
        () => { /* success callback */ }, 
        (event) => { console.error(`Failed to load sitting image ${path}:`, event); }
      );
      if (img && img.width > 0 && img.height > 0) { 
        sittingImgs.push(img);
      }
    }
    // Ensure sittingImgs has at least 2 frames as per spec (2-3 frames)
    if (sittingImgs.length < 2) {
      console.error(`Insufficient sitting images for ${station}_${randomSpec}. Expected at least 2, found ${sittingImgs.length}. This might lead to animation issues.`);
      // Fallback or error handling if not enough images are found.
      // For now, proceed with what's loaded, but this is a potential issue.
    }


    let hintImg = null;
    if (isCorrectNpc) {
      const path = `assets/npcChracter/hint/${station}_${randomSpec}_힌트.png`;
      console.log(`Loading hint image: ${path}`);
      hintImg = loadImage(path, 
        () => { /* success callback */ }, 
        (event) => { console.error(`Failed to load hint image ${path}:`, event); }
      );
    }

    const standingImg = loadImage(`assets/npcChracter/standing/${station}_${randomSpec}_스탠딩.png`,
      () => { /* success callback */ }, 
      (event) => { console.error(`Failed to load standing image assets/npcChracter/standing/${station}_${randomSpec}_스탠딩.png:`, event); }
    );
    console.log(`Loading standing image: assets/npcChracter/standing/${station}_${randomSpec}_스탠딩.png`);

    gameNpcs.push({
      station: station,
      spec: randomSpec,
      isCorrect: isCorrectNpc,
      sittingImgs: sittingImgs,
      hintImg: hintImg,
      standingImg: standingImg,
      // Add a placeholder for current animation frame index and state
      currentSittingFrame: 0, 
      currentAnimationState: 'sitting' // 'sitting' or 'hint'
    });
  });
}

function gameScreenPreload() {
  initializeStationAssets(); // 랜덤 역 선택 및 관련 에셋 로드

  // 공통 폰트 로드
  dungGeunMoFont = loadFont('assets/fonts/DungGeunMo.ttf');
  
  // 라운드 1 스크립트 로드
  round1Scripts = loadJSON('assets/scripts/round1.json');

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

  // NPC 에셋 로드
  generateRandomNpcs(); // Call the new function to generate and load random NPCs

  // 버튼 이미지 로드
  stopButton = loadImage('assets/buttons/stop_투명.png');
  quitButton = loadImage('assets/buttons/quit_투명.png');
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
