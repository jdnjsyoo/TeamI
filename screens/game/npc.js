function updateNpcAnimations(round) {
    // NPC 애니메이션 프레임 업데이트
    if (millis() - round.lastAnimationTime > 500) {
        for (let i = 0; i < 7; i++) {
            // npcStandingIndex에 해당하는 NPC는 애니메이션을 멈춤
            if (i === round.npcStandingIndex) continue;
            if (npcAnimationFrames[i] && npcAnimationFrames[i].length > 0) {
                round.npcCurrentFrameIndex[i] = (round.npcCurrentFrameIndex[i] + 1) % npcAnimationFrames[i].length;
            }
        }
        round.lastAnimationTime = millis();
    }
}

function handleNpcBehavior(round, worldGroundY, scrollX, stageScale) {
    if (round.isRound2) return;

    // --- 정답 NPC 일어나고 걷기 ---
    const npcIndex = round.npcStandingIndex;
    if (npcIndex === -1) return; // 일어설 NPC가 없으면 종료

    // sit here 클릭 후 1초가 지나면 NPC 서기 시작
    if (round.npcStandTriggerTime !== null && millis() - round.npcStandTriggerTime >= 1000) {
        if (round.npcWalkStartTime === null) {
            round.npcWalkStartTime = millis(); // 걷기 시작 시간 기록
        }
        round.npcStandTriggerTime = null;
    }

    // NPC가 서 있고, 1초가 지난 뒤부터 왼쪽으로 걷기 시작
    if (
        round.npcWalkStartTime !== null &&
        millis() - round.npcWalkStartTime >= 1000 &&
        !round.npcHasLeftScreen
    ) {
        round.npcPositions[npcIndex].x -= npc2WalkSpeed;
    }

    // NPC가 화면에서 완전히 나갔는지 체크
    if (
        !round.npcHasLeftScreen &&
        npcStandImgs[npcIndex]
    ) {
        let targetHeight = playerScale;
        let scaleFactor = targetHeight / npcStandImgs[npcIndex].height;
        let w = npcStandImgs[npcIndex].width * scaleFactor;

        let rightWorld = round.npcPositions[npcIndex].x + w / 2;
        // The scrollX calculation might need adjustment depending on your camera logic
        let rightScreenX = (rightWorld + (scrollX - 50)) * stageScale;


        if (rightScreenX < 0) {
            round.npcHasLeftScreen = true;
            
            // 플레이어가 앉아야 하는 경우, 자동 이동 시작
            if (round.playerShouldSit) {
                round.isPlayerAutoMovingToSeat = true;
            }
        }
    }
}


function drawNpcs(round, worldMouseX, worldMouseY) {
    let npcBottomWorldY = backgr ? backgr.height - 80 : height - 50;

    round.isSitButtonHovered = false;
    round.hoveredSitNpcIndex = -1;
    for (let i = 0; i < npcAnimationFrames.length; i++) {
        if (round.isRound2 && i === 6) {
            continue;
        }

        // 정답을 맞춰서 사라진 NPC는 그리지 않음
        if (round.npcHasLeftScreen && i === round.npcStandingIndex) {
            continue;
        }

        const currentFrameIndex = round.npcCurrentFrameIndex[i];
        let imgToDraw = npcAnimationFrames[i][currentFrameIndex];

        // 일어서야 할 NPC인 경우, 서 있는 이미지로 교체
        if (i === round.npcStandingIndex && npcStandImgs[i]) {
            imgToDraw = npcStandImgs[i];
        }

        const isHighlighted = (i === round.highlightedNpcIndex) || (i === round.selectedNpcIndex);
        drawNPC(round, imgToDraw, round.npcPositions[i].x, npcBottomWorldY, i, isHighlighted, worldMouseX, worldMouseY);
    }
    return npcBottomWorldY;
}

function drawNPC(round, npcImg, baseX, baseY, index, isHighlighted, worldMouseX, worldMouseY) {
    if (!npcImg) return;

    let targetHeight = npcTargetHeight;
    let lift = 12;

    // 현재 NPC가 일어서 있는 NPC인지 확인
    let isStandingNpc = (index === round.npcStandingIndex && npcStandImgs[index] && npcImg === npcStandImgs[index]);
    if (isStandingNpc) {
        targetHeight = playerScale; // 유저와 같은 키
        lift = 0;
    }

    let scaleFactor = targetHeight / npcImg.height;
    let w = npcImg.width * scaleFactor;
    let h = targetHeight;

    let drawX = baseX - w / 2;
    let drawY = baseY - h;

    if (isStandingNpc) {
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
  
    image(npcImg, drawX, drawY, w, h);

    // 'sit here' 버튼 로직
    if (isHighlighted && round.stage === 1 && sitHereImg && round.resultOverlayType === null) {
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
            round.isSitButtonHovered = true;
            round.hoveredSitNpcIndex = index;
        }

        let imgToDraw = isCurrentlyHovered ? sitHereHoverImg : sitHereImg;
        image(imgToDraw, sitX, sitY, sitW, sitH);
    }
}
