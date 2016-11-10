// Put Skins here
let buttonSkin = new Skin({ fill : "#c4c4c4" });
let darkGraySkin = new Skin({ fill: "#202020" });
let downSkin = new Skin({ fill : "white" });
let greenSkin = new Skin({ fill : "#62C370" });
let redSkin = new Skin({ fill : "#cc3363" });
let blackBorderedSkin = new Skin({
  fill: "white" ,
  borders: {top: 1, bottom: 1, left: 0, right: 0},
  stroke: "black"
});
let whiteSkin = new Skin({ fill: "white" });

// Put Styles here
let titleStyle = new Style({ font: "40px", color: "black" });
let buttonStyle = new Style({font: '30px', color: 'black'});
let buttonBoldStyle = new Style({font: '22px', style: "bold", color: 'black'});
let toneStyle = new Style({ font: "20px", color: "black" });

// Skins for Slider
let mainTexture = new Texture('assets/main.png', 1);
let horizontalSliderBarSkin = new Skin({ texture: mainTexture, x: 45, y: 50, width: 60, height: 50, states: 50, tiles: { left:15, right:25 } });
let horizontalSliderButtonSkin = new Skin({ texture: mainTexture, x: 110, y: 50, width: 30, height: 50, states: 50 });
let verticalSliderBarSkin = new Skin({ texture: mainTexture, x: 200, y: 95, width: 50, height: 60, states: 50, tiles: { top:15, bottom:25 } });
let verticalSliderButtonSkin = new Skin({ texture: mainTexture, x: 250, y: 110, width: 50, height: 30, states: 50 });


export let THEME = {
  buttonSkin, darkGraySkin, downSkin, greenSkin, redSkin, blackBorderedSkin, whiteSkin,
  titleStyle, buttonStyle, buttonBoldStyle, toneStyle,
  mainTexture, horizontalSliderBarSkin, horizontalSliderButtonSkin, verticalSliderBarSkin, verticalSliderButtonSkin,
}