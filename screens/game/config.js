// game/config.js - 전역 게임 설정 및 상수

// 플레이어 관련
const playerScale = 150; // 플레이어 캐릭터 크기 (px)
const playerYShift = -50; // 플레이어 Y축 조정 (발 위치 맞추기)

// NPC 관련
const npcTargetHeight = 150; // NPC 기본 크기
const standingNpcYShift = -20; // 서 있는 NPC Y축 조정
const npc2WalkSpeed = 2; // 2번 NPC 걷는 속도

// 좌석 위치 (지하철 내부 배경 기준)
const startX = 300; // 첫 번째 좌석의 X 시작 위치
const seatSpacing = 200; // 좌석 간 간격
const seatBaseY = 550; // 좌석의 Y축 기본 위치 (바닥)

// 스테이지 2 타이머 (10초)
const stage2Duration = 30000;

// 속도 관련 (플레이어, 배경 스크롤 등)
let speed = 5; // 현재 플레이어 이동 속도 (변동 가능)
const boostAmount = 2; // 속도 부스트량
const maxBoost = 10; // 최대 속도
const baseSpeed = 5; // 기본 속도

// 지면 Y 좌표 (모든 캐릭터의 발이 닿는 기준선)
const groundY = 600; 

// 버튼 히트박스 (UI 관련)
const buttonWidth = 115;
const buttonHeight = 84;
const buttonGap = 20;
let stopBtnX, stopBtnY, stopBtnW, stopBtnH;
let quitBtnX, quitBtnY, quitBtnW, quitBtnH;
let settingBtnX, settingBtnY, settingBtnW, settingBtnH;

// 역 이름 목록 (initializeStationAssets에서 사용될 수 있음)
const stations = ["강남", "강변", "서울대입구", "성수", "시청", "을지로", "잠실", "홍대"];

// 유저 캐릭터 폼
const USER_CHARACTER_FORM = {
    form1: 0,
    form2: 1,
    form3: 2
};
let current_user_character_num = USER_CHARACTER_FORM.form1; // 기본 유저 캐릭터 폼

// 전역 P5.js 객체
// P5.js 함수들은 전역으로 접근 가능하므로 별도로 여기에 선언하지 않습니다.
