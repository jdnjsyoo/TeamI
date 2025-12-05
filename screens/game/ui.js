function drawUi() {
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
    const buttonWidth = 115;
    const buttonHeight = 84;
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

    // Timer rendering in stage 2
    if (stage === 2 && timeBarBase && timeBar) {
        // Define new height and calculate new width to maintain aspect ratio
        const newHeight = 360;
        const newWidth = timeBarBase.width * (newHeight / timeBarBase.height);

        const elapsedTime = millis() - timerStartTime;
        const timeRatio = max(0, 1 - (elapsedTime / stage2Duration));
        
        // Calculate the shrinking width for both destination and source
        const shrinkingDestWidth = newWidth * timeRatio;
        const shrinkingSourceWidth = timeBar.width * timeRatio;

        // Draw timer at top-left
        const timerX = 360;
        const timerY = -126;
        
        // Draw the resized base bar
        image(timeBarBase, timerX, timerY, newWidth, newHeight);
        
        // Draw the resized and shrinking red bar
        if (shrinkingDestWidth > 0) {
        image(timeBar, 
                timerX, timerY,               // Destination position
                shrinkingDestWidth, newHeight,  // Destination size
                0, 0,                         // Source position
                shrinkingSourceWidth, timeBar.height // Source size
            );
        }
    }

    // ⭐ SUCCESS / FAIL 오버레이 (2초 지연 후 화면 거의 중앙, 살짝 위쪽)
    if (resultOverlayType && resultOverlayStartTime !== null) {
        if (millis() - resultOverlayStartTime >= 2000) {
        let overlayImg =
            resultOverlayType === "success" ? successImg :
            resultOverlayType === "fail"    ? failImg    : null;

        if (overlayImg) {
            let rw = overlayImg.width;
            let rh = overlayImg.height;
            let rx = (width  - rw) / 2;
            let ry = (height - rh) / 2 - 200; // 중앙보다 약간 위로
            image(overlayImg, rx, ry, rw, rh);
        }
        }
    }

    // ⭐⭐ 게임 시작 전 "PRESS SPACE" 오버레이
    if (showPressEnter && stage === 1 && pressEnterImg) {
        push();
        // 화면 살짝 어둡게
        noStroke();
        fill(0, 0, 0, 150);
        rect(0, 0, width, height);

        // 안내 이미지 중앙(살짝 아래쪽)에 표시
        imageMode(CENTER);
        image(pressEnterImg, width / 2, height / 2 + 150);
        pop();
    }
}
