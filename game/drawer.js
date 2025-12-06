// =======================
// 외부 풍경 렌더링
// =======================
function drawOutside() {
  const outsideYOffset = 250;

  if (cityImg && !isStationImgActive) {
    let sScale = 0.55;
    let sw = cityImg.width * sScale;
    let sh = cityImg.height * sScale;

    cityX -= citySpeed;
    if (cityX <= -sw) cityX += sw;

    const maxX = (stage === 2 && backgr) ? backgr.width : width;
    for (let xx = cityX; xx < maxX; xx += sw) {
      image(cityImg, xx, outsideYOffset, sw, sh);
    }
  }

  if (cloudImg && !isStationImgActive) {
    let cScale = 0.6;
    let cw = cloudImg.width * cScale;
    let ch = cloudImg.height * cScale;

    cloudX -= cloudSpeed;
    if (cloudX <= -cw) cloudX += cw;

    const maxX = (stage === 2 && backgr) ? backgr.width : width;
    for (let xx = cloudX; xx < maxX; xx += cw) {
      image(cloudImg, xx, -40 + outsideYOffset, cw, ch);
    }
  }

  if (isStationImgActive) {
    let sw = 1024; // 고정된 가로 사이즈
    let sScale = sw / stationImg.width; // 비율 유지
    let sh = stationImg.height * sScale; // 세로 사이즈 계산
    let fixedX = (width - sw) / 2; // 고정된 x좌표 계산
    let fixedY = height - sh - 115; // 바닥에서 115px 띄우기
    image(stationImg, fixedX, fixedY, sw, sh);
  }
}

// =======================
// NPC 렌더링 (단일 NPC) - 헬퍼 함수
// =======================
function drawNPC(npcImg, baseX, baseY, npcIndex, isHighlighted) {
    if (!npcImg) return;

    let targetHeight = npcTargetHeight;
    let lift = 12; // 좌석 위에 살짝 띄우기

    let scaleFactor = targetHeight / npcImg.height;
    let w = npcImg.width * scaleFactor;
    let h = targetHeight;

    let drawX = baseX - w / 2;
    let drawY = baseY - h;

    // Highlight effect (character outline)
    if (isHighlighted) {
        let buffer = createGraphics(w, h);
        buffer.image(npcImg, 0, 0, w, h);
        buffer.drawingContext.globalCompositeOperation = 'source-in';
        buffer.fill(255);
        buffer.noStroke();
        buffer.rect(0, 0, w, h);
        buffer.drawingContext.globalCompositeOperation = 'source-over';

        const borderPx = 3;
        image(buffer, drawX - borderPx, drawY, w, h);
        image(buffer, drawX + borderPx, drawY, w, h);
        image(buffer, drawX, drawY - borderPx, w, h);
        image(buffer, drawX, drawY + borderPx, w, h);
        
        buffer.remove();
    }
    
    // Draw the original image on top
    image(npcImg, drawX, drawY, w, h);
}


// =======================
// 모든 NPC 렌더링 (새로운 함수)
// =======================
function drawNpcs(round, worldMouseX, worldMouseY) {
  let npcBottomY = 0; // Will store the bottom Y of the last drawn NPC to align player

  round.hoveredSitNpcIndex = -1; // Reset hovered state
  round.isSitButtonHovered = false;

  round.npcs.forEach((npc, index) => {
    if (npc.hasLeftScreen) return; // Don't draw NPCs that have left the screen

    let npcImgToDraw;
    let currentNpcX = npc.currentX !== undefined ? npc.currentX : npc.originalSeatX;
    let drawY = seatBaseY; // Base Y for sitting NPCs

    if (npc.isStanding) {
      npcImgToDraw = npc.standingImg;
      // Adjust drawY for standing NPCs
      drawY = seatBaseY + standingNpcYShift; // Use global standingNpcYShift
    } else if (npc.isCorrect && npc.currentAnimationState === 'hint' && npc.hintImg) {
      npcImgToDraw = npc.hintImg;
    } else {
      npcImgToDraw = npc.sittingImgs[npc.currentSittingFrame];
    }

    if (npcImgToDraw) {
      drawNPC(npcImgToDraw, currentNpcX, drawY, index, round.highlightedNpcIndex === index);
      
      npcBottomY = max(npcBottomY, drawY); // Keep track of the lowest point for player positioning

      // Draw "sit here" button if in stage 2 and this NPC is highlighted
      if (round.stage === 2 && round.highlightedNpcIndex === index && sitHereImg) {
        const btnW = sitHereImg.width * 0.7; // Adjust size as needed
        const btnH = sitHereImg.height * 0.7;
        const btnX = currentNpcX - btnW / 2;
        const btnY = drawY + 20; // Position below the NPC

        // Check for hover state
        const isHovered = worldMouseX > btnX && worldMouseX < btnX + btnW &&
                          worldMouseY > btnY && worldMouseY < btnY + btnH;

        if (isHovered) {
          image(sitHereHoverImg, btnX, btnY, btnW, btnH);
          round.isSitButtonHovered = true;
          round.hoveredSitNpcIndex = index;
        } else {
          image(sitHereImg, btnX, btnY, btnW, btnH);
        }
      }
    }
  });
  return npcBottomY;
}


// =======================
// 플레이어 렌더링
// =======================
function drawPlayer(npcBottomWorldY) { // Reverted to original signature
    let playerBottomY = npcBottomWorldY;
    let playerTopY = playerBottomY - playerScale;

    push();
    if (playerDir === "left") { // Use global playerDir
        // 왼쪽: 옆모습 뒤집기
        translate(x + playerScale, playerTopY + playerYShift); // Use global x
        scale(-1, 1);
        image(img, 0, 0, playerScale, playerScale);
    } else if (playerDir === "right") { // Use global playerDir
        // 오른쪽: 옆모습 그대로
        image(img, x, playerTopY + playerYShift, playerScale, playerScale); // Use global x
    } else if (playerDir === "front") { // Use global playerDir
        // 정면
        image(imgBack, x, playerTopY + playerYShift, playerScale, playerScale); // Use global x
    } else if (playerDir === "back") { // Use global playerDir
        // 뒷모습
        image(imgFront, x, playerTopY + playerYShift, playerScale, playerScale); // Use global x
    }
    pop();
}

/*
// =======================
// UI 렌더링 (drawUi는 screens/game/ui.js에 정의되어 있음)
// =======================
function drawUI() {
    // ======= 화면 하단 고정 대화창 =======
    if (dialogImg) {
        let dW = dialogImg.width;
        let dH = dialogImg.height;
        let dX = (width - dW) / 2;
        let dY = height - dH;
        image(dialogImg, dX, dY, dW, dH);
    }

    // ======= 우측 상단 버튼 (스크린 좌표, 스케일/스크롤 영향 X) =======
    push();
    const buttonWidth = 100;
    const buttonHeight = 73;
    const buttonGap = 20;
    let buttonX = width - buttonWidth - 10; // 오른쪽 여백 10px
    const buttonY = 20; // 위쪽 여백 20px

    if (stopButton) {
        image(stopButton, buttonX, buttonY, buttonWidth, buttonHeight);
        // stop 버튼 히트박스 저장
        stopBtnX = buttonX;
        stopBtnY = buttonY;
        stopBtnW = buttonWidth;
        stopBtnH = buttonHeight;

        buttonX -= buttonWidth / 2 + buttonGap;
    }

    if (quitButton) {
        image(quitButton, buttonX, buttonY, buttonWidth, buttonHeight);
        // quit 버튼 히트박스 저장
        quitBtnX = buttonX;
        quitBtnY = buttonY;
        quitBtnW = buttonWidth;
        quitBtnH = buttonHeight;

        buttonX -= buttonWidth / 2 + buttonGap;
    }

    if (settingButton) {
        image(settingButton, buttonX, buttonY, buttonWidth, buttonHeight);
        // setting 버튼 히트박스 저장
        settingBtnX = buttonX;
        settingBtnY = buttonY;
        settingBtnW = buttonWidth;
        settingBtnH = buttonHeight;
    }
    pop();
}
*/

// 좌석 위치 관련 상수 가져오기
const { seatBaseY } = window;
