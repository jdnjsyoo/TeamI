function drawOutside() {
  const outsideYOffset = 250;

  if (cityImg && !isStationImgActive) {
    let sScale = 0.55;
    let yPos = outsideYOffset;
    
    let sw = cityImg.width * sScale;
    let sh = cityImg.height * sScale;

    cityX -= citySpeed;
    if (cityX <= -sw) cityX += sw;

    const maxX = (stage === 2 && backgr) ? backgr.width : width;
    for (let xx = cityX; xx < maxX; xx += sw) {
      image(cityImg, xx, yPos, sw, sh);
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

  if (isStationImgActive && stationImg) {
    let sw = 1024; // 고정된 가로 사이즈
    let sScale = sw / stationImg.width; // 비율 유지
    let sh = stationImg.height * sScale; // 세로 사이즈 계산
    let fixedX = (width - sw) / 2; // 고정된 x좌표 계산
    let fixedY = height - sh - 115; // 바닥에서 115px 띄우기
    image(stationImg, fixedX, fixedY, sw, sh);
  }
}
