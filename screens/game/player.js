function handlePlayerMovement() {
  // ⭐ 좌석 앞으로 자동 이동 중일 때: (지금은 플래그가 안 켜져서 실행 안 됨)
  if (isPlayerAutoMovingToSeat && playerTargetX !== null) {
    const autoSpeed = 4;
    if (Math.abs(x - playerTargetX) <= autoSpeed) {
      x = playerTargetX;
      isPlayerAutoMovingToSeat = false;
      playerDir = "sit";  // 도착 후 착석
    } else {
      let dir = (playerTargetX > x) ? 1 : -1;
      x += dir * autoSpeed;
      playerDir = dir === 1 ? "right" : "left";
    }
    return;
  }

  if (stage !== 1) { // Stage 1이 아닐 때만 좌우 이동 허용
    if (keyIsDown(LEFT_ARROW)) {
      x -= speed;
      playerDir = "left";
    }
    // → 오른쪽
    else if (keyIsDown(RIGHT_ARROW)) {
      x += speed;
      playerDir = "right";
    }
  }
  // ↑ 정면
  if (keyIsDown(UP_ARROW)) {
    playerDir = "front";
  }
  // ↓ 뒷모습
  else if (keyIsDown(DOWN_ARROW)) {
    playerDir = "back";
  }
}

function drawPlayer(npcBottomWorldY) {
    // ⭐ 플레이어 그리기
  let playerBottomY = npcBottomWorldY;

  push();
  if (playerDir === "left") {
    // 왼쪽: 옆모습 뒤집기
    let playerTopY = playerBottomY - playerScale;
    translate(x + playerScale, playerTopY + playerYShift);
    scale(-1, 1);
    image(img, 0, 0, playerScale, playerScale);
  } else if (playerDir === "right") {
    // 오른쪽: 옆모습 그대로
    let playerTopY = playerBottomY - playerScale;
    image(img, x, playerTopY + playerYShift, playerScale, playerScale);
  } else if (playerDir === "front") {
    // 정면
    let playerTopY = playerBottomY - playerScale;
    image(imgBack, x, playerTopY + playerYShift, playerScale, playerScale);
  } else if (playerDir === "back") {
    // 뒷모습
    let playerTopY = playerBottomY - playerScale;
    image(imgFront, x, playerTopY + playerYShift, playerScale, playerScale);
  } else if (playerDir === "sit") {
    // ⭐ 착석 상태: 다른 앉아 있는 NPC와 동일한 사이즈 & y축 정렬
    let sitHeight = npcTargetHeight;           // 앉은 NPC와 같은 높이
    let sitScale  = sitHeight / imgSit.height;
    let sitW      = imgSit.width * sitScale;
    let sitH      = sitHeight;

    // 바닥 기준으로 위로 sitHeight만큼 올려서 y 정렬
    let sitTopY = playerBottomY - sitH;

    // ⭐ 정답을 맞춘 경우: 시청 캐릭터가 앉아 있던 좌석 중심에 정확히 앉기
    let sitX;
    if (npc2SeatChosen && npc2OriginalSeatX !== null) {
      sitX = npc2OriginalSeatX - sitW / 2;   // 좌석 중심 - 반 너비
    } else {
      sitX = x;
    }

    image(imgSit, sitX, sitTopY, sitW, sitH);
  }
  pop();
}
