function handlePlayerMovement(round) {
  // ⭐ 좌석 앞으로 자동 이동 중일 때: (지금은 플래그가 안 켜져서 실행 안 됨)
  if (round.isPlayerAutoMovingToSeat && round.playerTargetX !== null) {
    const autoSpeed = 4;
    if (Math.abs(round.x - round.playerTargetX) <= autoSpeed) {
      round.x = round.playerTargetX;
      round.isPlayerAutoMovingToSeat = false;
      round.playerDir = "sit";  // 도착 후 착석
    } else {
      let dir = (round.playerTargetX > round.x) ? 1 : -1;
      round.x += dir * autoSpeed;
      round.playerDir = dir === 1 ? "right" : "left";
    }
    return;
  }

  if (round.stage !== 1) { // Stage 1이 아닐 때만 좌우 이동 허용
    if (keyIsDown(LEFT_ARROW)) {
      round.x -= speed;
      round.playerDir = "left";
    }
    // → 오른쪽
    else if (keyIsDown(RIGHT_ARROW)) {
      round.x += speed;
      round.playerDir = "right";
    }
  }
  // ↑ 정면
  if (keyIsDown(UP_ARROW)) {
    round.playerDir = "front";
  }
  // ↓ 뒷모습
  else if (keyIsDown(DOWN_ARROW)) {
    round.playerDir = "back";
  }
}

function drawPlayer(round, npcBottomWorldY) {
    // ⭐ 플레이어 그리기
  let playerBottomY = npcBottomWorldY;

  push();
  if (round.playerDir === "left") {
    // 왼쪽: 옆모습 뒤집기
    let playerTopY = playerBottomY - playerScale;
    translate(round.x + playerScale, playerTopY + playerYShift);
    scale(-1, 1);
    image(img, 0, 0, playerScale, playerScale);
  } else if (round.playerDir === "right") {
    // 오른쪽: 옆모습 그대로
    let playerTopY = playerBottomY - playerScale;
    image(img, round.x, playerTopY + playerYShift, playerScale, playerScale);
  } else if (round.playerDir === "front") {
    // 정면
    let playerTopY = playerBottomY - playerScale;
    image(imgBack, round.x, playerTopY + playerYShift, playerScale, playerScale);
  } else if (round.playerDir === "back") {
    // 뒷모습
    let playerTopY = playerBottomY - playerScale;
    image(imgFront, round.x, playerTopY + playerYShift, playerScale, playerScale);
  } else if (round.playerDir === "sit") {
    // ⭐ 착석 상태: 다른 앉아 있는 NPC와 동일한 사이즈 & y축 정렬
    let sitHeight = npcTargetHeight;           // 앉은 NPC와 같은 높이
    let sitScale  = sitHeight / imgSit.height;
    let sitW      = imgSit.width * sitScale;
    let sitH      = sitHeight;

    // 바닥 기준으로 위로 sitHeight만큼 올려서 y 정렬
    let sitTopY = playerBottomY - sitH;

    // ⭐ 정답을 맞춘 경우: 비어 있는 좌석 중심에 정확히 앉기
    let sitX;
    if (round.playerShouldSit && round.targetSeatX !== null) {
      sitX = round.targetSeatX - sitW / 2;   // 좌석 중심 - 반 너비
    } else {
      sitX = round.x;
    }

    image(imgSit, sitX, sitTopY, sitW, sitH);
  }
  pop();
}
