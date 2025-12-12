class Environment {
  constructor(cityImg, cloudImg, stationImg) {
    this.cityImg = cityImg;
    this.cloudImg = cloudImg;
    this.stationImg = stationImg;
  }

  display(isStationImgActive, stage) {
    const outsideYOffset = 250;
    let stage2YShift = 0; // stage 2일 때 적용할 Y축 이동량

    if (stage === 2) {
      stage2YShift = -220; // 위로 100px 이동
    }

    if (this.cityImg && !isStationImgActive) {
      let sScale = 0.55;
      let yPos = outsideYOffset + stage2YShift;
      
      let sw = this.cityImg.width * sScale;
      let sh = this.cityImg.height * sScale;

      cityX -= citySpeed;
      if (cityX <= -sw) cityX += sw;

      const maxX = (stage === 2 && backgr) ? backgr.width : width;
      for (let xx = cityX; xx < maxX; xx += sw) {
        image(this.cityImg, xx, yPos, sw, sh);
      }
    }

    if (this.cloudImg && !isStationImgActive) {
      let cScale = 0.6;
      let cw = this.cloudImg.width * cScale;
      let ch = this.cloudImg.height * cScale;

      cloudX -= cloudSpeed;
      if (cloudX <= -cw) cloudX += cw;

      const maxX = (stage === 2 && backgr) ? backgr.width : width;
      for (let xx = cloudX; xx < maxX; xx += cw) {
        image(this.cloudImg, xx, -40 + outsideYOffset + stage2YShift, cw, ch);
      }
    }

    if (isStationImgActive && this.stationImg) {
      let sw = 1024; // 고정된 가로 사이즈
      let sScale = sw / this.stationImg.width; // 비율 유지
      let sh = this.stationImg.height * sScale; // 세로 사이즈 계산
      let fixedX = (width - sw) / 2; // 고정된 x좌표 계산
      let fixedY = height - sh - 115; // 바닥에서 115px 띄우기
      image(this.stationImg, fixedX, fixedY, sw, sh);
    }
  }
}
