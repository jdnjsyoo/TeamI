class ScriptPlayer {
  constructor(scriptLines, onFinishedCallback) {
    this.lines = scriptLines;
    this.onFinished = onFinishedCallback;
    
    this.currentLineIndex = 0;
    this.displayedText = '';
    this.typingIndex = 0;
    this.typingSpeed = 2; // 프레임당 1글자씩 타이핑 (숫자가 클수록 느려짐)
    this.frameCount = 0;
    this.lineWaitStartTime = 0;

    this.state = 'typing'; // 'typing', 'waiting', 'finished'
  }

  // 타이핑 애니메이션 및 자동 넘김 업데이트
  update() {
    if (this.state === 'finished') {
      return;
    }

    if (this.state === 'typing') {
        this.frameCount++;
        if (this.frameCount % this.typingSpeed === 0) {
          const currentLine = this.lines[this.currentLineIndex];
          if (this.typingIndex < currentLine.length) {
            this.typingIndex++;
            this.displayedText = currentLine.substring(0, this.typingIndex);
          } else {
            // 현재 줄 타이핑 완료, 사운드 중지
            if (typingSound && typingSound.isLoaded()) {
              typingSound.stop();
            }
            this.state = 'waiting';
            this.lineWaitStartTime = millis();
          }
        }
    }
    // 'waiting' 상태에서는 아무 동작도 하지 않음 (자동 진행 제거)
  }

  // 다음으로 넘기기 (스페이스바)
  next() {
    if (this.state === 'typing') {
      // 타이핑 중이면 즉시 전체 줄 표시, 사운드 중지
      if (typingSound && typingSound.isLoaded()) {
        typingSound.stop();
      }
      this.displayedText = this.lines[this.currentLineIndex];
      this.typingIndex = this.lines[this.currentLineIndex].length;
      this.state = 'waiting';
      this.lineWaitStartTime = millis();
    } else if (this.state === 'waiting') {
      // 다음 줄로 이동 전, 현재 사운드 중지
      if (typingSound && typingSound.isLoaded()) {
        typingSound.stop();
      }
      this.currentLineIndex++;
      if (this.currentLineIndex >= this.lines.length) {
        // 모든 스크립트 종료
        this.state = 'finished';
        if (this.onFinished) {
          this.onFinished();
        }
      } else {
        // 다음 줄 타이핑 시작, 사운드 재생
        if (typingSound && typingSound.isLoaded()) {
          typingSound.loop();
        }
        this.typingIndex = 0;
        this.displayedText = '';
        this.state = 'typing';
      }
    }
  }

  isFinished() {
    return this.state === 'finished';
  }

  // 대화창과 텍스트 그리기 (\n 줄바꿈 지원)
  draw() {
    // 줄바꿈 지원: \n 기준으로 분리
    const lines = this.displayedText.split('\n');
    const lineHeight = 40; // 줄 간격
    if (dialogImg) {
      let dW = dialogImg.width;
      let dH = dialogImg.height;
      let dX = (width - dW) / 2;
      let dY = height - dH;
      image(dialogImg, dX, dY, dW, dH);

      // 텍스트 설정
      if (dungGeunMoFont) {
        textFont(dungGeunMoFont);
      }
      fill(255);
      textSize(30);
      textAlign(LEFT, TOP);

      // 여러 줄 출력
      for (let i = 0; i < lines.length; i++) {
        text(lines[i], dX + 50, dY + 35 + i * lineHeight, dW - 100, lineHeight);
      }
    } else {
      // dialogImg가 없을 경우의 대체 코드 (기존 검은 박스)
      fill(0, 0, 0, 180);
      noStroke();
      rect(0, height - 250, width, 250);

      // 텍스트 설정
      if (dungGeunMoFont) {
        textFont(dungGeunMoFont);
      }
      fill(255);
      textSize(30);
      textAlign(LEFT, TOP);

      // 여러 줄 출력
      for (let i = 0; i < lines.length; i++) {
        text(lines[i], 30, height - 250 + i * lineHeight, width - 100, lineHeight);
      }
    }
  }
}


function drawUi(instance) {
    // 인트로 스크립트 재생
    if (instance && instance.introState === 'playing' && instance.introScriptPlayer) {
      instance.introScriptPlayer.update();
      instance.introScriptPlayer.draw();
      return; // 스크립트 재생 중에는 다른 UI를 그리지 않음
    }

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

    // settingButton 먼저
    if (settingButton) {
      image(settingButton, buttonX, buttonY, buttonWidth, buttonHeight);
      // setting 버튼 히트박스 저장
      settingBtnX = buttonX;
      settingBtnY = buttonY;
      settingBtnW = buttonWidth;
      settingBtnH = buttonHeight;

      buttonX -= buttonWidth / 2 + buttonGap;
    }

    // stopButton 나중
    if (stopButton) {
      image(stopButton, buttonX, buttonY, buttonWidth, buttonHeight);
      // stop 버튼 히트박스 저장
      stopBtnX = buttonX;
      stopBtnY = buttonY;
      stopBtnW = buttonWidth;
      stopBtnH = buttonHeight;
    }
    pop();

    // ======= 좌측 상단 게임 점수판 (스크린 좌표, 스케일/스크롤 영향 X) =======
    push();
    const gameScoreX = 20; // 왼쪽 여백 20px
    const gameScoreY = 17; // 위쪽 여백 17px
    const gameScoreWidth = 130; // 버튼과 동일한 너비
    const gameScoreHeight = 95; // 버튼과 동일한 높이

    if (gameScore) {
        image(gameScore, gameScoreX, gameScoreY, gameScoreWidth, gameScoreHeight);
    }
    pop();

    // Timer rendering in stage 2
    if (instance.stage === 2 && timeBarBase && timeBar) {
        // Define new height and calculate new width to maintain aspect ratio
        const newHeight = 360;
        const newWidth = timeBarBase.width * (newHeight / timeBarBase.height);

        const elapsedTime = millis() - instance.timerStartTime;

        // 라운드에 맞는 지속 시간 선택
        let duration;
        if (instance.isRound2) {
            // Round2 에서는 ROUND2_TIME_LIMIT 사용
            duration = ROUND2_TIME_LIMIT;
        } else {
            // Round1 에서는 stage2DurationRound1 사용
            duration = stage2DurationRound1;
        }
        
        const timeRatio = max(0, 1 - (elapsedTime / duration));
        
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

    // ⭐ SUCCESS / FAIL 오버레이 및 스크립트
    if (instance.resultOverlayType && instance.resultOverlayStartTime !== null) {
        if (millis() - instance.resultOverlayStartTime >= 500) {
            let overlayImg =
                instance.resultOverlayType === "success" ? successImg :
                instance.resultOverlayType === "fail"    ? failImg    : null;

            if (overlayImg) {
                let rw = overlayImg.width;
                let rh = overlayImg.height;
                let rx = (width  - rw) / 2;
                let ry = (height - rh) / 2 - 200; // 중앙보다 약간 위로
                image(overlayImg, rx, ry, rw, rh);
            }
            
            // ScriptPlayer 생성 (아직 없는 경우)
            if (instance.resultScriptPlayer === null) {
                const script = instance.resultOverlayType === "success" 
                    ? round1Scripts.round1_success 
                    : round1Scripts.round1_fail;
                
                instance.resultScriptPlayer = new ScriptPlayer(script, () => {
                    console.log("Result script finished.");
                });
            }

            // 스크립트 플레이어 업데이트 및 그리기
            instance.resultScriptPlayer.update();
            instance.resultScriptPlayer.draw();
        }
    }

    // ⭐⭐ 게임 시작 전 "PRESS SPACE" 오버레이
    if (instance.showPressEnter  && pressEnterImg&&(instance.stage === 1 || instance.isRound2)) {
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
