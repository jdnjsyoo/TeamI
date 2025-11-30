// =======================
// 키보드/마우스 입력 처리
// =======================

function handlePlayerMovement() {
    if (keyIsDown(LEFT_ARROW)) {
        x -= speed;
        playerDir = "left";
    }
    // → 오른쪽
    else if (keyIsDown(RIGHT_ARROW)) {
        x += speed;
        playerDir = "right";
    }
    // ↑ 정면
    else if (keyIsDown(UP_ARROW)) {
        playerDir = "front";
    }
    // ↓ 뒷모습
    else if (keyIsDown(DOWN_ARROW)) {
        playerDir = "back";
    }
}

function keyPressed() {
    // Spacebar: stage 토글
    if (key === ' ' || keyCode === 32) {
        if (stage === 1) {
            // 1 → 2로 진입
            stage = 2;
            stage2StartTime = millis(); // 지금 시간 기록
            isStationImgActive = false; // 새 stage2 진입이니까 역이미지 리셋
        } else {
            // 2 → 1로 수동 복귀
            stage = 1;
            stage2StartTime = null;
            isStationImgActive = false;
        }
        return;
    }

    // 'n' 키: 2번 NPC 일어나기
    if (key === 'n' || key === 'N') {
        isNpc2Standing = true;
    }
}

function mousePressed() {
    // --- stop 버튼 ---
    if (
        stopBtnX !== undefined &&
        mouseX >= stopBtnX && mouseX <= stopBtnX + stopBtnW &&
        mouseY >= stopBtnY && mouseY <= stopBtnY + stopBtnH
    ) {
        if (typeof switchToStopScreen === "function") {
            switchToStopScreen();
        }
        return;
    }

    // --- quit 버튼 ---
    if (
        quitBtnX !== undefined &&
        mouseX >= quitBtnX && mouseX <= quitBtnX + quitBtnW &&
        mouseY >= quitBtnY && mouseY <= quitBtnY + quitBtnH
    ) {
        if (typeof switchToQuitScreen === "function") {
            switchToQuitScreen();
        }
        return;
    }

    // --- setting 버튼 ---
    if (
        settingBtnX !== undefined &&
        mouseX >= settingBtnX && mouseX <= settingBtnX + settingBtnW &&
        mouseY >= settingBtnY && mouseY <= settingBtnY + settingBtnH
    ) {
        if (typeof switchToSettingsScreen === "function") {
            switchToSettingsScreen();
        }
        return;
    }

    // --- 버튼이 아닌 곳 클릭 → 기존 속도 증가 로직 ---
    /* 
    // This logic is commented out as boostAmount, maxBoost, and baseSpeed are not defined in the original file.
    speed += boostAmount;
    if (speed > maxBoost) speed = maxBoost;

    print("현재 속도:", speed);

    setTimeout(() => {
        speed -= boostAmount;

        if (speed < baseSpeed) speed = baseSpeed;

        print("복귀 이후 속도:", speed);
    }, 1000);
    */
}