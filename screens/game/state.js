let x = 200;
let y = 480;          // 바닥에 있을 때 y
let groundY = 480;    // 캐릭터가 항상 유지할 y
let speed = 5;

let img;        // 플레이어 (옆모습)
let imgFront;   // 정면
let imgBack;    // 뒷모습
let imgSit;     // ⭐ 유저-1 기본 착석
let playerDir = "right";

let playerScale = 300; // ⭐ 유저 NPC 크기

let backgr;     // 지하철 내부(창문 투명)
let dialogImg;  // 대화창 이미지

// 창밖
let cityImg;    // 도시 배경
let cloudImg;   // 구름

let facingLeft = false;

// 창밖 패럴럭스용 변수
let cityX = 0;
let cloudX = 0;
let citySpeed = 4;   // 도시 속도
let cloudSpeed = 1;  // 구름은 훨씬 느리게

// NPC 7명
let npcAnimationFrames = [];    // NPC 애니메이션 프레임 (2D 배열)
let npcCurrentFrameIndex = [0, 0, 0, 0, 0, 0, 0]; // 각 NPC의 현재 프레임 인덱스
let lastAnimationTime = 0;      // 마지막 애니메이션 시간
let npcStandImgs = [];          // 서 있는 버전 이미지 (2번째 NPC용)
let npcPositions = [];
// 좌석 배치용 전역 값
let seatBaseY = 520;
let startX = 230;
let seatSpacing = 95;
let npcTargetHeight = 280;   // 잠실/군인 정도 키로 통일

let isNpc2Standing = false;  // 두 번째 NPC가 일어났는지 여부
let stage = 1; // 1 or 2
let currentStationName; // 랜덤으로 선택된 역 이름
const stations = ['강남', '강변', '성수', '시청', '을지로', '잠실', '홍대']; // 지하철역 목록

// 버튼 이미지
let stopButton, quitButton, settingButton;
// 버튼 히트박스(스크린 좌표 기준)
let stopBtnX, stopBtnY, stopBtnW, stopBtnH;
let quitBtnX, quitBtnY, quitBtnW, quitBtnH;
let settingBtnX, settingBtnY, settingBtnW, settingBtnH;

// ⭐ 추가: 발을 더 아래로 내리기 위한 Y 오프셋
const playerYShift = 25;        // 유저 캐릭터를 화면에서 더 아래로
const standingNpcYShift = 25;   // 서 있는 2번 NPC도 같은 만큼 아래로

let stage2StartTime = null;   // stage2에 진입한 시각 (millis 단위)
let stationImg;
let isStationImgActive = false;

let highlightedNpcIndex = -1; // 스테이지 2에서 하이라이트될 NPC 인덱스
let selectedNpcIndex = -1;    // 스테이지 1에서 선택된 NPC 인덱스
let sitHereImg;               // '여기 앉으세요' 이미지
let sitHereHoverImg;          // '여기 앉으세요' 호버 이미지

// 'sit here' 버튼 상호작용 상태 변수
let isSitButtonHovered = false;
let isSitButtonPressed = false;
let sitButtonPressTime = 0;

// ⭐ sit here 클릭 후 3초 뒤에 2번 NPC가 서도록 트리거 시간
let npc2StandTriggerTime = null;

// ⭐ 2번 NPC 걷기 관련 변수
let npc2WalkSpeed = 2;
let npc2WalkStartTime = null;     // 서고 난 뒤 걷기 시작 시점
let npc2HasLeftScreen = false;    // 화면 밖으로 완전히 나갔는지

// ⭐ 2번 좌석 관련
let npc2OriginalSeatX = null;     // 원래 2번 좌석의 X (좌석 중심)
let npc2SeatChosen = false;       // 유저가 2번 NPC를 sit here로 선택했는지
let hoveredSitNpcIndex = -1;      // 현재 hover 중인 sit here 버튼의 NPC 인덱스

// ⭐ 유저 자동 이동 관련 (지금은 안 써도 됨, false라서 동작 안 함)
let isPlayerAutoMovingToSeat = false;
let playerTargetX = null;

// ⭐ 결과 에셋 및 상태
let successImg;
let failImg;
let resultOverlayType = null;      // 'success' 또는 'fail'
let resultOverlayStartTime = null; // SUCCESS/FAIL 표시 타이밍용

// press enter 추가
let pressEnterImg;      // Press "ENTER" 이미지
let showPressEnter = true

// Timer variables
let timeBarBase;
let timeBar;
let timerWidth;
const stage2Duration = 10000; // 10 seconds
let timerStartTime;

let dungGeunMoFont; // 모든 라운드에서 사용할 폰트
