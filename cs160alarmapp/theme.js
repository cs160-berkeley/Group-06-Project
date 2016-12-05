// Put colors here
let black = "#0B1410";

// Put Skins here
let buttonSkin = new Skin({ fill : "#c4c4c4" });
let darkGraySkin = new Skin({ fill: "#202020" });
let lightGraySkin = new Skin({ fill: "#EFEFEF"});
let downSkin = new Skin({ fill : "white" });
let greenSkin = new Skin({ fill : "#62C370" });
let yellowGreenSkin = new Skin({ fill: "#D8FFBF"});
let redSkin = new Skin({ fill : "#cc3363" });
let blackBorderedSkin = new Skin({
  fill: "white" ,
  borders: {top: 0, bottom: 1, left: 0, right: 0},
  stroke: "#C0C0C0"
});

let deviceBorderdSkin = new Skin({
	fill: "white",
	borders: { top: 0, bottom: 1, left: 0, right: 0},
	stroke: "#C0C0C0"
});

let mapBorderedSkin = new Skin({
  fill: "white" ,
  borders: {top: 2, bottom: 2, left: 0, right: 0},
  stroke: "#C0C0C0"
});

let whiteSkin = new Skin({ fill: "white" });
let blackSkin = new Skin({ fill: "#0B1410" });
let bannerSkin = new Skin({ fill: "#f9f7f7"});

// Put Styles here
let buttonStyle = new Style({font: '40px', color: black, style: "bold"});
let titleStyle = new Style({ font: "60px", color: black });
let buttonBoldStyle = new Style({font: '22px', style: "bold", color: black});
let toneStyle = new Style({ font: "30px", color: black});
let optionStyle = new Style({ color: black, font: '40px', horizontal: 'left', vertical: 'middle' });

// Skins for Slider
let mainTexture = new Texture('assets/main.png', 1);
let horizontalSliderBarSkin = new Skin({ texture: mainTexture, x: 45, y: 50, width: 60, height: 50, states: 50, tiles: { left:15, right:25 } });
let horizontalSliderButtonSkin = new Skin({ texture: mainTexture, x: 110, y: 50, width: 30, height: 50, states: 50 });
let verticalSliderBarSkin = new Skin({ texture: mainTexture, x: 200, y: 95, width: 50, height: 60, states: 50, tiles: { top:15, bottom:25 } });
let verticalSliderButtonSkin = new Skin({ texture: mainTexture, x: 250, y: 110, width: 50, height: 30, states: 50 });


export let THEME = {
  buttonSkin, darkGraySkin, downSkin, greenSkin, redSkin, blackBorderedSkin, whiteSkin, yellowGreenSkin, blackSkin, mapBorderedSkin, lightGraySkin, deviceBorderdSkin, bannerSkin,
  titleStyle, buttonStyle, buttonBoldStyle, toneStyle, optionStyle,
  mainTexture, horizontalSliderBarSkin, horizontalSliderButtonSkin, verticalSliderBarSkin, verticalSliderButtonSkin,
}