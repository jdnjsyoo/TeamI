function updateNpcAnimations() {
    // NPC 애니메이션 프레임 업데이트
    if (millis() - lastAnimationTime > 500) {
        for (let i = 0; i < 7; i++) {
        if (npcAnimationFrames[i] && npcAnimationFrames[i].length > 0) {
            npcCurrentFrameIndex[i] = (npcCurrentFrameIndex[i] + 1) % npcAnimationFrames[i].length;
        }
        }
        lastAnimationTime = millis();
    }
}

function handleNpcBehavior(worldGroundY, scrollX, stageScale) {
    // sit here 클릭 후 2초가 지나면 2번 NPC 서기 (유저와 같은 키, 이후 걷기 타이밍 시작)
    if (npc2StandTriggerTime !== null && millis() - npc2StandTriggerTime >= 2000) {
        isNpc2Standing = true;
        npc2StandTriggerTime = null;
        npc2WalkStartTime = millis();   // 서 있는 시점 기록
    }

    // 2번 NPC가 서 있고, 2초가 지난 뒤부터 왼쪽으로 걷기 시작 (화면에서 나갈 때까지)
    if (
        isNpc2Standing &&
        npc2WalkStartTime !== null &&
        millis() - npc2WalkStartTime >= 2000 &&
        !npc2HasLeftScreen
    ) {
        npcPositions[1].x -= npc2WalkSpeed;
    }

    // ⭐ 2번 NPC가 화면에서 완전히 나갔는지 체크 + 결과 처리
    if (
        isNpc2Standing &&
        !npc2HasLeftScreen &&
        npcStandImgs[1]
    ) {
        let targetHeight = playerScale;
        let scaleFactor = targetHeight / npcStandImgs[1].height;
        let w = npcStandImgs[1].width * scaleFactor;

        let rightWorld = npcPositions[1].x + w / 2;
        let rightScreenX = (rightWorld + (scrollX - 50)) * stageScale;

        if (rightScreenX < 0) {
            npc2HasLeftScreen = true;

            // 정답: 2번째 NPC를 골랐을 때 → 유저 착석 후 SUCCESS
            if (npc2SeatChosen) {
                playerDir = "sit";               // 유저 캐릭터 착석
                resultOverlayType = "success";   // SUCCESS 오버레이
                resultOverlayStartTime = millis();
            } else {
                // 오답: 다른 NPC를 골랐거나 선택 안 했을 때 → FAIL
                resultOverlayType = "fail";
                resultOverlayStartTime = millis();
            }
        }
    }
}


function drawNpcs(worldMouseX, worldMouseY) {
    let npcBottomWorldY = backgr ? backgr.height - 80 : height - 50;

    // NPC 그리기
    isSitButtonHovered = false;       // 매 프레임 호버 상태 초기화
    hoveredSitNpcIndex = -1;          // sit here 대상 NPC 인덱스 초기화
    for (let i = 0; i < npcAnimationFrames.length; i++) {
        const currentFrameIndex = npcCurrentFrameIndex[i];
        let imgToDraw = npcAnimationFrames[i][currentFrameIndex];

        if (i === 1 && isNpc2Standing && npcStandImgs[1]) {
        imgToDraw = npcStandImgs[1];
        }

        const isHighlighted = (i === highlightedNpcIndex) || (i === selectedNpcIndex);
        drawNPC(imgToDraw, npcPositions[i].x, npcBottomWorldY, i, isHighlighted, worldMouseX, worldMouseY);
    }
    return npcBottomWorldY;
}

// =======================
// NPC 렌더 (비율 통일)
// =======================
function drawNPC(npcImg, baseX, baseY, index, isHighlighted, worldMouseX, worldMouseY) {
  if (!npcImg) return;

  let targetHeight = npcTargetHeight;
  let lift = 12; // 좌석 위에 살짝 띄우기 (현재는 사용 안 하지만 일단 유지)

  let isStandingNpc2 = (index === 1 && isNpc2Standing && npcStandImgs[1] && npcImg === npcStandImgs[1]);
  if (isStandingNpc2) {
    targetHeight = playerScale; // 유저와 같은 키
    lift = 0;                   // 바닥선까지
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

  // 원본 이미지를 위에 다시 그립니다.
  image(npcImg, drawX, drawY, w, h);

  // 'sit here' 버튼 로직
  if (isHighlighted && stage === 1 && sitHereImg) {
    const desiredSitHereWidth = 200;
    const sitHereScale = desiredSitHereWidth / sitHereImg.width;
    const sitW = sitHereImg.width * sitHereScale;
    const sitH = sitHereImg.height * sitHereScale;
    const sitX = drawX + (w - sitW) / 2;
    const sitY = drawY - sitH * 0.8;

    const isCurrentlyHovered =
      (worldMouseX > sitX && worldMouseX < sitX + sitW &&
       worldMouseY > sitY && worldMouseY < sitY + sitH);

    if (isCurrentlyHovered) {
      isSitButtonHovered = true;
      hoveredSitNpcIndex = index;   // ⭐ 어느 NPC의 sit here인지 기록
    }

    let imgToDraw = isCurrentlyHovered ? sitHereHoverImg : sitHereImg;
    
    let scaleMod = 1.0;
    // 클릭 애니메이션 처리
    if (isSitButtonPressed && isCurrentlyHovered) {
      if (millis() - sitButtonPressTime < 200) { // 200ms 애니메이션
        scaleMod = 0.9; // 클릭 효과로 크기 줄이기
      } else {
        // 애니메이션 종료 후 stage 1로 전환 (NPC 선택 해제)
        isSitButtonPressed = false;
        stage = 1; // stage 1으로 돌아옴
        selectedNpcIndex = -1; // NPC 선택 해제
        return; // 상태가 바뀌므로 더 이상 그리지 않음
      }
    }
    
    const finalW = sitW * scaleMod;
    const finalH = sitH * scaleMod;
    const finalX = sitX + (sitW - finalW) / 2;
    const finalY = sitY + (sitH - finalH) / 2;

    image(imgToDraw, finalX, finalY, finalW, finalH);
  }
}
