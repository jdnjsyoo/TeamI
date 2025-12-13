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
// NPC 렌더링
// =======================
function drawNPC(npcImg, baseX, baseY, index, isHighlighted) {
    if (!npcImg) return;

    let targetHeight = npcTargetHeight;
    let lift = 12; // 좌석 위에 살짝 띄우기

    let isStandingNpc2 = (index === 1 && isNpc2Standing && npcStandImgs[1] && npcImg === npcStandImgs[1]);
    if (isStandingNpc2) {
        targetHeight = playerScale; // 유저와 같은 키
        lift = 0; // 바닥선까지
    }

    let scaleFactor = targetHeight / npcImg.height;
    let w = npcImg.width * scaleFactor;
    let h = targetHeight;

    let drawX = baseX - w / 2;
    let drawY = baseY - h;

    if (isStandingNpc2) {
        drawY += standingNpcYShift;
    }

        // 하이라이트 효과 (캐릭터 외곽선)
        if (isHighlighted) {
            // 가장 안정적인 방법: drawingContext를 사용하여 흰색 실루엣 생성
            let buffer = createGraphics(w, h);
            buffer.image(npcImg, 0, 0, w, h);
            
            // 'source-in' composite operation을 사용하여 기존 픽셀 위에만 색칠
            buffer.drawingContext.globalCompositeOperation = 'source-in';
            
            // 흰색으로 채우기
            buffer.fill(255);
            buffer.noStroke();
            buffer.rect(0, 0, w, h);
            
            // composite operation 리셋 (p5.js의 다른 그리기에 영향 없도록)
            buffer.drawingContext.globalCompositeOperation = 'source-over';
    
            const borderPx = 3;
    
            // 흰색 실루엣을 상하좌우로 그려 테두리 효과를 냄
            image(buffer, drawX - borderPx, drawY, w, h);
            image(buffer, drawX + borderPx, drawY, w, h);
            image(buffer, drawX, drawY - borderPx, w, h);
            image(buffer, drawX, drawY + borderPx, w, h);
            
            buffer.remove(); // 메모리 누수 방지를 위해 버퍼 제거
        }
    
        // 원본 이미지를 위에 다시 그립니다.
        image(npcImg, drawX, drawY, w, h);}


// =======================
// 플레이어 렌더링
// =======================
function drawPlayer(npcBottomWorldY) {
    let playerBottomY = npcBottomWorldY;
    let playerTopY = playerBottomY - playerScale;

    push();
    if (playerDir === "left") {
        // 왼쪽: 옆모습 뒤집기
        translate(x + playerScale, playerTopY + playerYShift);
        scale(-1, 1);
        image(img, 0, 0, playerScale, playerScale);
    } else if (playerDir === "right") {
        // 오른쪽: 옆모습 그대로
        image(img, x, playerTopY + playerYShift, playerScale, playerScale);
    } else if (playerDir === "front") {
        // 정면
        image(imgBack, x, playerTopY + playerYShift, playerScale, playerScale);
    } else if (playerDir === "back") {
        // 뒷모습
        image(imgFront, x, playerTopY + playerYShift, playerScale, playerScale);
    }
    pop();
}

// =======================
// UI 렌더링
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

    if (settingButton) {
        image(settingButton, buttonX, buttonY, buttonWidth, buttonHeight);
        // setting 버튼 히트박스 저장
        settingBtnX = buttonX;
        settingBtnY = buttonY;
        settingBtnW = buttonWidth;
        settingBtnH = buttonHeight;
    }

    if (stopButton) {
        image(stopButton, buttonX, buttonY, buttonWidth, buttonHeight);
        // stop 버튼 히트박스 저장
        stopBtnX = buttonX;
        stopBtnY = buttonY;
        stopBtnW = buttonWidth;
        stopBtnH = buttonHeight;

        buttonX -= buttonWidth / 2 + buttonGap;
    }
    pop();
}
