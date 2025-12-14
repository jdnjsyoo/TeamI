// =====================
// 화면 전환 시 배경음악 정지 (항상 전역에서 접근 가능하도록 최상단에 선언)
// =====================
function selectPlayerStopBgm() {
    if (sp_bgm && sp_bgmPlaying) {
        sp_bgm.stop();
        sp_bgmPlaying = false;
    }
}
// =====================
// 배경음악 관리
// =====================
let sp_bgm;
let sp_bgmPlaying = false;

// =====================
// 화면: 플레이어 선택
// =====================

let sp_bg;
let sp_chars = [];
let sp_btnSelect;
let sp_btnSelectHover;

let sp_charPositions = [];

function updateCharPositions() {
    // 캐릭터 이미지 크기와 캔버스 크기를 고려하여 중앙 정렬
    const charWidth = 330; // selectPlayerSetup에서 resize(330, 0)로 고정
    const spacing = 0; // 캐릭터 간 간격을 완전히 붙임
    const totalWidth = charWidth * 3 + spacing * 2;
    const startX = (1024 - totalWidth) / 2;
    const y = 300;
    sp_charPositions = [
        { x: startX+50, y },
        { x: startX + charWidth + spacing, y },
        { x: startX + (charWidth + spacing) * 2 - 50, y },
    ];
}

let sp_buttons = [];
let sp_hoveredButton = -1;
let sp_selectedButton = -1; // 선택된 캐릭터 인덱스

// 하단 중앙 선택 버튼 위치
let sp_mainBtn = null;

function selectPlayerPreload() {
        // 배경음악 미리 로드
        sp_bgm = loadSound('assets/sound/playerselect.mp3');
    sp_bg = loadImage("assets/start/Tutorial.png");
    sp_chars[0] = loadImage("assets/userCharacter/유저-1 정면 스탠딩.png");
    sp_chars[1] = loadImage("assets/userCharacter/유저-2 정면 스탠딩.png");
    sp_chars[2] = loadImage("assets/userCharacter/유저-3 정면 스탠딩.png");
    sp_btnSelect = loadImage("assets/buttons/choose.png");
    sp_btnSelectHover = loadImage("assets/buttons/choose-hover.png");
}

function selectPlayerSetup() {
    // 배경음악 재생 (이미 재생 중이 아니면)
    if (sp_bgm && !sp_bgmPlaying) {
        sp_bgm.setLoop(true);
        sp_bgm.play();
        sp_bgmPlaying = true;
    }
    // =====================
    // 화면 전환 시 배경음악 정지 (전역 함수)
    // =====================
    function selectPlayerStopBgm() {
        if (sp_bgm && sp_bgmPlaying) {
            sp_bgm.stop();
            sp_bgmPlaying = false;
        }
    }
    createCanvas(1024, 869);
    // 캐릭터 이미지 크기 조절
    sp_chars.forEach(img => img.resize(330, 0));

    updateCharPositions();

    // 캐릭터별 버튼은 더 이상 사용하지 않음
    sp_buttons = [];
    // sp_mainBtn은 draw에서 동적으로 계산
}

function selectPlayerDraw() {
    image(sp_bg, 0, 0, width, height);

    sp_hoveredButton = -1;

    // 캐릭터 그리기 및 hover/선택 효과
    for (let i = 0; i < sp_charPositions.length; i++) {
        let drawWidth = 330;
        let drawHeight = sp_chars[i].height;
        let drawX = sp_charPositions[i].x;
        let drawY = sp_charPositions[i].y;

        let hoverRect = {
            x: sp_charPositions[i].x - 15,
            y: sp_charPositions[i].y - (sp_chars[i].height * (380 / 330) - sp_chars[i].height) / 2,
            w: 380,
            h: sp_chars[i].height * (380 / 330)
        };

        if (sp_selectedButton === i) {
            drawWidth = 380;
            drawHeight = sp_chars[i].height * (380 / 330);
            drawX = sp_charPositions[i].x - (drawWidth - 330) / 2;
            drawY = sp_charPositions[i].y - (drawHeight - sp_chars[i].height) / 2;
        } else if (
            mouseX >= hoverRect.x &&
            mouseX <= hoverRect.x + hoverRect.w &&
            mouseY >= hoverRect.y &&
            mouseY <= hoverRect.y + hoverRect.h
        ) {
            drawWidth = 380;
            drawHeight = sp_chars[i].height * (380 / 330);
            drawX = sp_charPositions[i].x - (drawWidth - 330) / 2;
            drawY = sp_charPositions[i].y - (drawHeight - sp_chars[i].height) / 2;
            sp_hoveredButton = i;
        }

        image(sp_chars[i], drawX, drawY, drawWidth, drawHeight);
    }

    // 하단 중앙 선택 버튼 위치와 크기 고정 (작게)
    let btnW = 200;
    let btnH = 200;
    let btnX = (1024 - btnW) / 2;
    let btnY = 869 - btnH - 40;
    sp_mainBtn = { x: btnX, y: btnY, w: btnW, h: btnH };

    // 하단 중앙 선택 버튼
    let isBtnHover = mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH;
    let btnActive = sp_selectedButton !== -1;
    if (sp_btnSelect && sp_btnSelect.width > 0 && sp_btnSelect.height > 0) {
        if (!btnActive) {
            // 캐릭터 미선택 시 항상 hover 이미지
            image(sp_btnSelect, btnX, btnY, btnW, btnH);
        } else if (isBtnHover) {
            image(sp_btnSelectHover, btnX, btnY, btnW, btnH);
        } else {
            image(sp_btnSelect, btnX, btnY, btnW, btnH);
        }
    }

    // 제목
    fill(0);
    textAlign(CENTER);
    textSize(40);
    textFont(dungGeunMoFont);
    text("플레이할 캐릭터를 선택하세요", width / 2, 250);
}

function selectPlayerMousePressed() {
    // 캐릭터 클릭: 선택만 반영
    if (sp_hoveredButton !== -1) {
        sp_selectedButton = sp_hoveredButton;
        playerCharacterIndex = sp_selectedButton + 1;
        console.log("Selected Character:", playerCharacterIndex);
        return;
    }

    // 하단 중앙 선택 버튼 클릭 (선택된 캐릭터가 있을 때만 동작)
    if (
        sp_mainBtn &&
        mouseX >= sp_mainBtn.x && mouseX <= sp_mainBtn.x + sp_mainBtn.w &&
        mouseY >= sp_mainBtn.y && mouseY <= sp_mainBtn.y + sp_mainBtn.h
    ) {
        if (sp_selectedButton !== -1) {
            // 선택된 캐릭터 에셋으로 설정
            if (typeof setPlayerCharacterAssets === "function") {
                setPlayerCharacterAssets(playerCharacterIndex);
            }
            
            // round1 시작(게임 화면으로 전환)
            selectPlayerStopBgm();
            if (typeof switchToGameScreen === "function") {
                switchToGameScreen();
            }
        }
    }
}

// startScene에서 복사해 온 유틸 함수
function insideRect(mx, my, rectObj) {
  return (
    mx >= rectObj.x &&
    mx <= rectObj.x + rectObj.w &&
    my >= rectObj.y &&
    my <= rectObj.y + rectObj.h
  );
}
