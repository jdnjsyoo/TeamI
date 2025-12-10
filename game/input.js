// These were not defined, so I am defining them here.
// I've taken some reasonable default values.
const boostAmount = 2;
const maxBoost = 10;
const baseSpeed = 5;

// =======================
// 키 입력
// =======================
function gameScreenKeyPressed() {
  // Spacebar: stage 토글
  if (key === ' ' || keyCode === 32) {
    if (stage === 1) {
      // 1 → 2로 진입
      enterStage2();
    } else if (stage === 2) {
      // stage2 도중 스페이스바를 누르면 즉시 역 도착 풍경으로 전환
      isStationImgActive = true;
      stage = 1;
      selectedNpcIndex = highlightedNpcIndex;
      stage2StartTime = null;
    } else {
      // 2 → 1로 수동 복귀
      stage = 1;
      selectedNpcIndex = highlightedNpcIndex; // 현재 하이라이트된 NPC를 선택
      stage2StartTime = null;
      isStationImgActive = false;
    }
    return;
  }

  // 'n' 키: 2라운드 진입
  if (key === 'n' || key === 'N') {
    startRound2()
  }
}

// =======================
// 마우스 클릭
// =======================
function gameScreenMousePressed() {
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

  // --- sit here 버튼 ---
  if (isSitButtonHovered) {
    isSitButtonPressed = true;
    sitButtonPressTime = millis();
    
    // ⭐ sit here 클릭 시 바로 역 도착 풍경으로 전환
    isStationImgActive = true;

    // ⭐ sit here 클릭 시 3초 후 2번 NPC가 서도록 트리거
    npc2StandTriggerTime = millis();

    // ⭐ 만약 왼쪽에서 2번째 NPC(인덱스 1)를 선택한 경우에만 "정답" 처리
    if (hoveredSitNpcIndex === 1) {
      npc2SeatChosen = true;
    } else {
      npc2SeatChosen = false;
    }

    return; // 다른 클릭 로직 방지
  }

  // --- 버튼이 아닌 곳 클릭 → 기존 속도 증가 로직 ---
  // 2라운드에서만 동작하도록 옮겼습니당
    if (stage === 3) {
      
    // 1) 화살표 위를 클릭했다 → 성공!
    if (isTargetArrowHovered && !round2Finished) {
      const seatX = npcPositions[targetSeatIndex].x;

      round2Finished = true;
      round2Result = "success";

      // 플레이어를 좌석 위치에 맞추고 앉히기
    
      x = seatX 
      isPlayerAutoMovingToSeat = false;
      playerTargetX = null;
      playerDir = "sit";

      resultOverlayType = "success";
      resultOverlayStartTime = millis();

      console.log("ROUND 2 SUCCESS: clicked arrow!");

      return;
    }

    boostSpeed();  
    return;
  }
};
