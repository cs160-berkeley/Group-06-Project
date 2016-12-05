/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */
import KEYBOARD from './keyboard';


// imports

import Pins from "pins";
import { THEME } from "theme";
import { VerticalScroller, VerticalScrollbar, TopScrollerShadow, BottomScrollerShadow } from 'scroller';
import { HorizontalSlider, HorizontalSliderBehavior } from 'sliders';
import { Push, TimeTravel } from 'transition';
import { FieldScrollerBehavior, FieldLabelBehavior } from 'field';




// remotes
var remotePins;
var deviceURL = "";

// Handlers
Handler.bind("/discover", Behavior({
    onInvoke: function(handler, message){
        deviceURL = JSON.parse(message.requestText).url;
        trace("Found device.\n");
    }
}));

Handler.bind("/forget", Behavior({
    onInvoke: function(handler, message){
        deviceURL = "";
    }
}));

// Buttons
class ButtonBehavior extends Behavior {
	onTouchBegan(button) {
		button.add(new Container({
			left: 0, right: 0, top: 0, bottom: 0,
			skin: THEME.bannerSkin
		}));
	}
	onTouchEnded(button) {
		button.remove(button.last);
	}
}

let deactivateButton = Container.template($ => ({
	left: 20, right: 10, height: 40, active: true, skin: THEME.greenSkin,
	contents: [
		Label($, {top: 0, bottom: 0, right: 0, left: 0, style: THEME.toneStyle, string: "Deactivate"})
	],
	behavior: Behavior({
		onCreate: function(container, data) {
			this.index = data.index;
		},
		onTouchBegan: function(container) {
			container.skin = THEME.buttonSkin;
		},
		onTouchEnded: function(container) {
			container.skin = THEME.greenSkin;
			if (model.data.alarmTriggered) {
				deviceTable[this.index].on = "off";
				deviceTable[this.index].proximity = "off";
				model.data.alarmTriggered = false;
			}
			if (deviceURL != "") new Message(deviceURL + "stopAudio").invoke(Message.JSON);
			model.data.deactivated = true;
			application.distribute("onReset");
			application.remove(application.last);
			application.add(new MainScreen(model.data));
			//application.run(new TimeTravel(), application.last, new MainScreen(model.data), { direction: "back", duration: 1000, easeType: "sineEaseOut" } );
		}
	})
}));

let emergencyButton = Container.template($ => ({
	left: 10, right: 20, height: 40, active: true, skin: THEME.redSkin,
	contents: [
		Label($, {top: 0, bottom: 0, right: 0, left: 0, style: THEME.toneStyle, string: "Dial 911"})
	],
	behavior: Behavior({
		onTouchBegan: function(container) {
			container.skin = THEME.buttonSkin;
		},
		onTouchEnded: function(container) {
			container.skin = THEME.redSkin;
		}
	})
}));

let LinkButton = Container.template($ => ({
	width: 65, top: 15, bottom: 15, right: 15, active: true,
	contents: [
		Picture($, {height: 50, width: 50, url: "assets/" + $.url })
	],
	Behavior: class extends ButtonBehavior {
		onTouchEnded(button) {
			super.onTouchEnded(button);
			application.distribute("onReset");
			application.run(new Push(), application.last, new $.nextScreen(model.data), { duration: 400, direction: $.direction} );
		}
	}
}))

let SwitchButton = Container.template($ => ({
	top: 5, bottom: 5,
	contents: [
		Picture($, { height: 45, width: 75, url: "assets/" + deviceTable[$.index].on + ".png", active: true, 
			behavior: Behavior({
				onCreate: function(picture, data) {
					this.index = data.index;
				},
				onTouchEnded: function(picture) {
					if (deviceTable[this.index].on == "on") {
						picture.url = "assets/off.png";
						deviceTable[this.index].on = "off";
					} else {
						picture.url = "assets/on.png";
						deviceTable[this.index].on = "on";
					}
					trace(deviceTable[this.index].name + " " + deviceTable[this.index].on + "\n");
				},
				onTurnOnAlarm: function(picture) {
					if (this.index == 3 && deviceTable[this.index].on != "on") {
						picture.url = "assets/on.png";
						deviceTable[this.index].on = "on";
					}
				}
			})
		})
	],
}));

let ProximitySwitchButton = Container.template($ => ({
	top: 5, bottom: 5,
	contents: [
		Picture($, { height: 45, width: 75, url: "assets/" + deviceTable[$.index].proximity + ".png", active: true, 
			behavior: Behavior({
				onCreate: function(picture, data) {
					this.index = data.index;
				},
				onTouchEnded: function(picture) {
					if (deviceTable[this.index].proximity == "on") {
						picture.url = "assets/off.png";
						deviceTable[this.index].proximity = "off";
					} else {
						picture.url = "assets/on.png";
						deviceTable[this.index].proximity = "on";
					}
					trace(deviceTable[this.index].name + " proximity " + deviceTable[this.index].proximity + "\n");
				}
			})
		})
	],
}));


let ToneButton = Container.template($ => ({
	width: 200, top: 0, bottom: 0, right: 0, active: true,
	skin: THEME.lightGraySkin,
	contents: [
		Label($, { left: 0, right: 0, string: "Choose Tone", style: THEME.toneStyle })
	],
	behavior: Behavior({
		onCreate: function(container, data) {
			this.index = data.index;
			if (deviceTable[$.index].tone.name)
				container.last.string = deviceTable[$.index].tone.name;
		},
		onTouchBegan: function(container) {
			container.skin = THEME.whiteSkin;
		},
		onTouchEnded: function(container) {
			container.skin = THEME.lightGraySkin;
			application.distribute("onReset");
			application.run(new Push(), application.last, new SoundScreen({index: this.index}), { duration: 400, direction: "left" } );
		}
	})
}))

// Tone List
var toneTable = [
	{ name: "default", url: "beep.mp3" },
	{ name: "old clock", url: "oldclock.mp3" },
	{ name: "fire alarm", url: "firealarm.mp3" },
	{ name: "classic", url: "classic.mp3"},
	{ name: "school bell", url: "schoolbell.mp3"},

]

// Device List
var deviceTable = [
	{ name: "MacBook", url: "macbook.png", on: "off", tone: toneTable[0], index: 0, volume: 5, latitude: 37.869107, longitude: -122.259716, proximity: "off" },
	{ name: "iPad", url: "ipad.jpg", on: "off", tone: toneTable[0], index: 1, volume: 5, latitude: 37.869107, longitude: -122.259716, proximity: "off"},
	{ name: "iPhone", url: "iphone.png", on: "off", tone: toneTable[0], index: 2, volume: 5, latitude: 37.869107, longitude: -122.259716, proximity: "off"},

];



// Alarm Triggered Screen
let AlarmScreen = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0,
	skin: THEME.whiteSkin,
	contents: [
		Column($, {
			top: 80, bottom: 50,left: 0, right: 0,
			contents: [
				Container($, {
					left: 0, right: 0, top: 0, height: 350,
					contents: [
						DeviceGPSScreen({ index: $.index, mapHeight: 346 }),
					]
				}),
				new Container({
					top: 0, height: 50, left: 0, right: 0,
					contents: [
						Label($, { top: 0, bottom:0, left: 0, right: 0, style: THEME.toneStyle, string: deviceTable[$.index].name + " alarm triggered!" }),
					]

				}),
				Line($, {
					top: 0, bottom: 0, left: 0, right: 0,
					contents: [
						deactivateButton($),
						emergencyButton()
					]
				})
			]
		}),
		Container($, {
			left: 0, right: 0, top: 0, height: 80,
			contents: [
				Label($, {left: 5, right: 5, top: 5, bottom: 5, string: "Alert!", style: THEME.titleStyle})
			]
		})
	],
	behavior: Behavior({
		onCreate: function(container, data) {
			var device = deviceTable[data.index];
			if (deviceURL != "") new MessageWithObject(deviceURL + "playAudio?url=" +device.tone.url+ "&volume=" + device.volume.toString()).invoke(Message.JSON);
			if (remotePins) {
				let repeater = remotePins.repeat("/thumpPrint/read", 3000, value => {
					if (value == 1 && !model.data.deactivated) {
						model.data.deactivated = true;
						repeater.close();
						if (model.data.alarmTriggered) {
							device.on = "off";
							model.data.alarmTriggered = false;
							device.proximity = "off";
						}
						if (deviceURL != "") new Message(deviceURL + "stopAudio").invoke(Message.JSON);
						application.distribute("onReset");
						application.remove(application.last);
						application.add(new MainScreen(model.data));
						// application.run(new TimeTravel(), application.last, new MainScreen(model.data), { direction: "back", duration: 1000, easeType: "sineEaseOut" } );
					}
				})
			}
		}
	})
}));


// Searching Screen
let SearchingScreen = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0, 
	skin: THEME.whiteSkin,
	contents: [
		Container($, {top: 80, bottom: 0, left: 0, right: 0,
			contents: [
				Picture($, {top: 140, height: 300, width: 300, url: "assets/syncing.png"}),
			]
		}),
		Container($, {
			top: 0, height: 80, left: 0, right: 0,
			skin: THEME.bannerSkin,
			contents: [
				Line($ ,{
					left: 5, right: 5, top: 0, bottom: 0,
					contents: [
						new LinkButton({ nextScreen: MainScreen, direction: "right", url: "cancel.png" }),
						Label($, {left: 5, right: 5, string: "Searching...", style: THEME.titleStyle}),
						new Container({ right: 0, width: 10})
					]
				})
			]
		})
	],
	behavior: Behavior({
		onDisplayed: function(container) {
			sensorUtils.delay(1);
			application.run(new Push(), application.last, new AddingDeviceScreen(model.data), { duration: 400, direction: "left" } );
		}
	})
}))

// Keyboard Screen
let KeyboardScreen = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0,
	skin: THEME.whiteSkin,
	contents: [
		Container($, {
			left: 0, right: 0, top: 80, bottom: 0,
			active: true,
			contents: [
				Container($, {
					width: 300, height: 54, 
					skin: new Skin({ borders: { left: 2, right: 2, top: 2, bottom: 2 }, stroke: 'gray' }), 
					contents: [
				        Scroller($, { 
				            left: 4, right: 4, top: 4, bottom: 4, active: true, 
				            Behavior: FieldScrollerBehavior, clip: true, 
				            contents: [
				                Label($, { 
				                    left: 0, top: 0, bottom: 0, 
				                    skin: new Skin({ fill: ['transparent', 'transparent', '#C0C0C0', '#acd473']}), 
				                    style: new Style({ color: 'black', font: '36px', type: 'bold', horizontal: 'left', vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5 }),
				                    anchor: 'NAME',
				                    editable: true, string: "",
				                    Behavior: class extends FieldLabelBehavior {
				                    	onCreate(label, data) {
				                    		this.data = {};
				                    	}
				                        onEdited(label) {
				                            let data = this.data;
				                            data.name = label.string;
				                            label.container.hint.visible = (data.name.length == 0);
				                        }
				                        onEnterKeyPressed(label) {
				                        	model.data.lastNumber ++;
				                        	this.data.index = model.data.lastNumber;
				                        	deviceTable.push({name: this.data.name, url: "kindle.png", on: "off", tone: toneTable[0], index: model.data.lastNumber, volume: 5, latitude: 37.869107, longitude: -122.259716, proximity: "off"});
				                        	remotePins.invoke("/synced/write", 1);
				                        	remotePins.repeat("/alarm/read", 500, value => {
				                        		if (value == 1 && deviceTable[this.data.index].on == "on" && !model.data.alarmTriggered) {
				                        			model.data.alarmTriggered = true;
				                        			model.data.deactivated = false;
				                        			application.remove(application.last);
				                        			application.add(new AlarmScreen(this.data));
				                        			//application.run(new TimeTravel(), application.last, new AlarmScreen(this.data), { direction: "forward", duration: 1000, easeType: "sineEaseIn" } );
				                        		}
				                        	});
				                        	remotePins.repeat("/gps/read", 300, position => {
				                        		let device = deviceTable[this.data.index];
				                        		device.latitude = position.latitude;
				                        		device.longitude = position.longitude;
				                        		if (device.proximity == "on") {
													let d2r = Math.PI / 180.0;
				                        			let lat1 = device.latitude * d2r ;
				                        			let lon1 = device.longitude * d2r;
				                        			let lat2 = model.data.latitude * d2r;
				                        			let lon2 = model.data.longitude * d2r;
				                        			let dLat = lat2 - lat1;
				                        			let dLon = lon2 - lon1;
				                        			var R = 6371; // km
													var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
													        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
													var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
													var distance = R * c * 1000;
					                        		if (distance > 30) {
					                        			application.distribute("onTurnOnAlarm");
					                        		}
				                        		}
				                        	});
				                        	application.run(new Push(), application.last, new MainScreen(model.data), { duration: 400, direction: "right" } );
				                        }
				                    },
				                }),
				                Label($, {
				                    left: 4, right: 4, top: 4, bottom: 4, 
				                    style: new Style({ color: '#aaa', font: '36px', horizontal: 'left', vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5 }),
				                    string: "Tap to add Name...", name: "hint"
				                }),
				            ]
				        })
				    ]
				})
			],
			Behavior: class extends Behavior {
				onTouchEnded(content) {
					KEYBOARD.hide();
					content.focus();
				}
			}
		}),
		Line($ ,{
			left: 0, right: 0, top: 0, height: 80,
			skin: THEME.bannerSkin,
			contents: [
				new LinkButton({ nextScreen: MainScreen, direction: "right", url: "back.png" }),
				Label($, {left: 5, right: 5, string: "Add Device", style: THEME.titleStyle, anchor: "title"}),
				new Container({ right: 0, width: 15})
			]
		})
	]
}))

// Adding Device Screen
let AddingDeviceScreen = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0,
	skin: THEME.whiteSkin,
	contents: [
		Container($, {
			active: true, top: 80, bottom: 0, left: 0, right: 0,
			contents: [
				new Label({
					top: 0, bottom: 0, left: 0, right: 0, style: THEME.buttonStyle,
					string: "No Device Found"
				})
			],
			behavior: Behavior({
				onCreate: function(container, data) {
					if (remotePins) {
						remotePins.invoke("/synced/read", value => {
							if (value == 0) {
								container.remove(container.last);
								container.add(new Container({
									height: 400, left: 0, right: 0, active: true,
									contents: [
										new Picture({ height: 400, url: "assets/kindle.png" })
									],
									behavior: Behavior({
										onTouchBegan: function(container) {
											container.skin = THEME.buttonSkin;
										},
										onTouchEnded: function(container) {
											container.skin = THEME.whiteSkin;
											application.run(new Push(), application.last, new KeyboardScreen(model.data), { duration: 400, direction: "left" } );
										}
									})
								}));
							}
						})
						
					}
				}
			})
		}),
		Container($, {
			left: 0, right: 0, top: 0, height: 80,
			skin: THEME.bannerSkin,
			contents: [
				Line($ ,{
					left: 5, right: 5, top: 0, bottom: 0,
					contents: [
						new LinkButton({ nextScreen: MainScreen, direction: "right", url: "back.png" }),
						Label($, {left: 5, right: 5, string: "Add Device", style: THEME.titleStyle, anchor: "title"}),
						new Container({ right: 0, width: 15})
					]
				})
			]
		})
	],

}))


// Sound Screen
let TonePad = Container.template($ => ({
	active: true, left: 0, right: 0, bottom: 0, height: 50,
	skin: THEME.blackBorderedSkin,
	contents: [
		Line($, {
			left: 5, right: 5, top: 5, bottom: 5,
			contents: [
				Label($, { left: 0, right: 0, string: $.name, style: THEME.buttonStyle, horizontal: "left" }),
				Label($, {anchor: "checkTone", right: 15, width: 50, style: THEME.buttonStyle, string: ""}),
			]
		})
	],
	behavior: Behavior({
		onCreate: function(container, data) {
			this.data = data;
		},
		onDisplayed: function(container) {
			
			container.container.delegate("onCheckTone", this.data);
		},
		onTouchEnded: function(container) {
			container.container.delegate("onToneSelected", this.data);
		}
	})

}));

let ToneColumn = Column.template($ => ({ 
	top: 0, left: 0, right: 0, 
	contents: [
		toneTable.map(tone => TonePad(tone))
	],
	behavior: Behavior({
		onCreate: function(column, data) {
			this.index = data.index;
		},
		onToneSelected: function(column, tone) {
			deviceTable[this.index].tone = tone;
			application.run(new Push(), application.last, new ManagingScreen({index: this.index}), { duration: 400, direction: "right" } );
		},
		onCheckTone: function(column, tone) {
			if (tone.name == deviceTable[this.index].tone.name)
				tone.checkTone.string = "●"
		}
	})
}));

let SoundScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: THEME.whiteSkin,
	contents: [
		VerticalScroller($, {
			active: true, top: 80, bottom: 0, left: 0, right: 0,
			contents: [
				ToneColumn($),
                VerticalScrollbar(), 
			    TopScrollerShadow(),
			    BottomScrollerShadow()
			]
		}),
		Line($, {
			left: 0, right: 0, top: 0, height: 80, skin: THEME.bannerSkin,
			contents: [
				new Container(({
					left: 15, top: 15, bottom: 15, active: true,
					contents: [
						Picture($, {height: 50, width: 50, url: "assets/back.png" })
					],
					Behavior: class extends ButtonBehavior {
						onTouchEnded(button) {
							super.onTouchEnded(button);
							application.run(new Push(), application.last, new ManagingScreen($), { duration: 400, direction: "right"} );
						}
					}
				})),
				Label($, {left: 5, right: 5, string: "Choose Tone", style: THEME.titleStyle}),
				new Container({ right: 0, width: 15})
			]
		})
	],
}));

// Managing Screen
let VolumeSlider = Layout.template($ => ({
   	top: 0, bottom: 0, left: 0, right: 0, active: true,
   	contents: [
		Content($, { left: 0, right: 0, top: 0, bottom: 0, skin: THEME.horizontalSliderBarSkin, state: 0, }),
		Content($, { left: 0, width: 30 + Math.round(deviceTable[$.index].volume * 19), top: 0, bottom: 0, skin: THEME.horizontalSliderBarSkin, state: 1, }),
		Content($, { left: Math.round(deviceTable[$.index].volume * 19), width: 30 , top: 0, bottom: 0, skin: THEME.horizontalSliderButtonSkin, state: 0}),
	],
    Behavior: class extends HorizontalSliderBehavior {
        onValueChanged(container) {
            deviceTable[this.data.index].volume = this.data.value;
        }
    }
}));

let DeviceGPSScreen = Container.template($ => ({
	left: 0, right: 0, top: 2, bottom: 2,
	behavior: Behavior({
		onCreate: function(container, data) {
			this.index = data.index;
			this.mapHeight = data.mapHeight;
		},
		onDisplayed: function(container) {
			this.deviceLatitude = this.deviceLongitude = -1;
			this.latitude = this.longitude = -1;
			this.map = null;
			container.interval = 500;
			this.onGPS(container);
			container.start();
		},
		onGPS: function(container) {
			let device = deviceTable[this.index];
			if (device.latitude != this.deviceLatitude || device.longitude != this.deviceLongitude || model.data.latitude != this.latitude || model.data.longitude != this.longitude) {
				var url = "https://maps.googleapis.com/maps/api/staticmap?center=" + device.latitude + "," + device.longitude + "&zoom=16&format=JPEG&markers=color:blue|label:D|" + device.latitude + "," + device.longitude + "&markers=color:red|label:C|" + model.data.latitude + "," + model.data.longitude + "&size=" + application.width + "x" + this.mapHeight +  "&key=AIzaSyBx3GuVTAo9y-8OgFKUUYRyhbNG5dB1DJY";
				this.map = new MapPicture(url);
			}
			this.deviceLatitude = device.latitude;
			this.deviceLongitude = device.longitude;
			this.latitude = model.data.latitude;
			this.longitude = model.data.longitude;
		},
		onMapReady: function(container, picture) {

			if (container.length)
				container.replace(container.last, picture);
			else
				container.add(picture);
			this.map = null;
		},
		onTimeChanged: function(container) {
			this.onGPS(container);
		},
		onReset: function(container) {
			container.stop();
		}
	})
}))


let ManagingScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: THEME.whiteSkin,
	contents: [
		Container($, {
			left: 0, right: 0, top: 80, height: 300, name: "map",
			skin: THEME.mapBorderedSkin,
			contents: [
				Label($, { left: 0, right: 0, height: 50, style: THEME.buttonStyle, string: "Map Loading..."}),
				DeviceGPSScreen({ index: $.index, mapHeight: 296 })
			]
		}),
		Column($, {
			left: 20, right: 20, top: 380, bottom: 55,
			contents: [				
				Line($, {
					left: 0, right: 0, top: 0, bottom: 0,
					contents: [
						Label($, { left: 0, right: 15, top: 0, bottom: 0, style: THEME.optionStyle, string: "Alarm" }),
						Container($, { width: 100, right: 0, top: 0, bottom: 0,
							contents: [
								SwitchButton($),
							]
						}),
					]
				}),
				Line($, {
					left: 0, right: 0, top: 0, bottom: 0,
					contents: [
						Label($, { left: 0, right: 15, top: 0, bottom: 0, style: THEME.optionStyle, string: "Proximity" }),
						Container($, { width: 100, right: 0, top: 0, bottom: 0,
							contents: [
								ProximitySwitchButton($),
							]
						}),
					]
				}),
				Line($, {
					left: 0, right: 0, top: 0, bottom: 0,
					contents: [
						Label($, { left: 0, right: 0, top: 0, bottom: 0, style: THEME.optionStyle, string: "Tone" }),
						ToneButton($)
					]
				}),
				Line($, {
					left: 0, right: 0, top: 0, bottom: 0,
					contents: [
						Label($, { left: 0, width: 100, top: 0, bottom: 0, style: THEME.optionStyle, string: "Volume" }),
						Container($, { left: 0, width: 15, top: 0, bottom: 0}),
						new VolumeSlider({ min: 0, max: 10, value: deviceTable[$.index].volume, index: $.index })
					]
				}),

			]
		}),
		Container($, {
			left: 0, height: 55, bottom: 0, right: 0, active: true, skin: THEME.buttonSkin,
			contents: [
				Label($, { left: 0, top: 0, bottom: 0, right: 0, string: "Play alarm to test", style: THEME.buttonStyle })
			],
			behavior: Behavior({
				onCreate: function(container, data) {
					this.data = data;
				},
				onTouchBegan: function(container) {
					container.skin = THEME.whiteSkin;
				},
				onTouchEnded: function(container) {
					container.skin = THEME.buttonSkin;
					if (remotePins && this.data.index == 3) {
						remotePins.invoke("/synced/read", value => {
							if (value == 1) {
								application.distribute("onReset");
								model.data.deactivated = false;
								application.remove(application.last);
				                application.add(new AlarmScreen(this.data));
								//application.run(new TimeTravel(), application.last, new AlarmScreen(this.data), { direction: "forward", duration: 1000, easeType: "sineEaseIn" } );
							}
						});
					}
					
				}
			})
		}),
		Line($ ,{
			left: 0, right: 0, top: 0, height: 80,
			skin: THEME.bannerSkin,
			contents: [
				new LinkButton({ nextScreen: MainScreen, direction: "right", url: "back.png" }),
				Label($, {left: 5, right: 5, string: deviceTable[$.index].name, style: THEME.titleStyle}),
				new Container({ right: 0, width: 65 })
			]
		})
	]
}))



// MainScreen
let DevicePad = Container.template($ => ({
	left: 0, right: 0, bottom: 2, height: 78,
	skin: THEME.deviceBorderdSkin,
	contents: [
		Container($, {
			active: true, left: 5, right: 5, bottom: 1, top: 1,
			skin: THEME.whiteSkin,
			contents: [
				Line($, {
					left: 5, right: 5, top: 5, bottom: 5,
					contents: [
						Picture($, { top: 2, bottom: 2, left: 2, width: 70, height: 70, url: "assets/" + $.url, aspect: "fit" }),
						Label($, { left: 0, right: 0, string: $.name, style: THEME.buttonStyle }),
						SwitchButton($)
					]
				})
			],
			behavior: Behavior({
				onTouchEnded: function(container) {
					application.distribute("onReset");
					application.run( new Push(), application.last, new ManagingScreen({index: $.index}), { duration: 400, direction: "left" } );
				}
			})
		})
	]
}));

let DeviceColumn = Column.template($ => ({ 
	top: 0, left: 0, right: 0, 
	contents: [
		deviceTable.map(device => DevicePad(device))
	]
}));

var MapPicture = Picture.template($ => ({
	left:0, right:0, top:0, bottom:0,
	behavior: Behavior({
		onCreate: function(picture, url) {
			picture.url = url;
		},
		onLoaded: function(picture) {
			if (picture.ready)
				application.distribute("onMapReady", picture);
		},
	})
}));


let GPSScreen = Container.template($ => ({
	left: 0, right: 0, top: 2, bottom: 2,
	behavior: Behavior({
		onDisplayed: function(container) {
			this.map = null;
			this.latitude = this.longitude = -1;
			container.interval = 500;
			this.onGPS(container);
			container.start();
		},
		onGPS: function(container) {
			if (model.data.latitude != this.latitude || model.data.longitude != this.longitude) {
				this.latitude = model.data.latitude;
				this.longitude = model.data.longitude;
				var url = "https://maps.googleapis.com/maps/api/staticmap?center=" + this.latitude + "," + this.longitude + "&zoom=16&format=JPEG&markers=" + this.latitude + "," + this.longitude + "&size=" + application.width + "x196&key=AIzaSyBx3GuVTAo9y-8OgFKUUYRyhbNG5dB1DJY";
				this.map = new MapPicture(url);
			}
		},
		onMapReady: function(container, picture) {
			if (container.length)
				container.replace(container.last, picture);
			else
				container.add(picture);
			this.map = null;
		},
		onTimeChanged: function(container) {
			this.onGPS(container);
		},
		onReset: function(container) {
			container.stop();
		}
	})
}))


let MainScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: THEME.whiteSkin,
	contents: [
		VerticalScroller($, {
			active: true, top: 282, bottom: 0, left: 0, right: 0,
			contents: [
				DeviceColumn($),
                VerticalScrollbar(), 
			    TopScrollerShadow(),
			    BottomScrollerShadow()
			]
		}),
		Container($, {
			left: 0, right: 0, top: 80, height: 200, name: "map",
			skin: THEME.mapBorderedSkin,
			contents: [
				Label($, { left: 0, right: 0, height: 50, style: THEME.buttonStyle, string: "Map Loading..."}),
				GPSScreen($)
			]
		}),
		Line($, {
			left: 0, right: 0, top: 0, height: 80,
			skin: THEME.bannerSkin,
			contents: [
				new Container({ left: 0, width: 65}),
				Label($, {left: 5, right: 5, string: "AlertMe", style: THEME.titleStyle}),
				new LinkButton({ nextScreen: SearchingScreen, direction: "left", url: "add.png" }),
			]
		})
	],
}));


// Application Behavior
var model = application.behavior = Behavior({
	onLaunch(application) {
		this.data = {
			lastNumber: 2,
			alarmTriggered: false,
			latitude: -1, longitude: -1,
			deactivated: true
		};
		application.discover("prog3device.project.kinoma.marvell.com");
		let discoveryInstance = Pins.discover(
            connectionDesc => {
                if (connectionDesc.name == "pins-share-led") {
                    trace("Connecting to remote pins\n");
                    remotePins = Pins.connect(connectionDesc);
                    if (deviceTable.length > 3) {
                    	remotePins.invoke("/synced/write", 1);
                    	remotePins.repeat("/alarm/read", 500, value => {
                    		if (value == 1 && deviceTable[3].on == "on" && !model.data.alarmTriggered) {
                    			model.data.alarmTriggered = true;
                    			application.remove(application.last);
				                application.add(new AlarmScreen({index: 3}));
                    			//application.run(new TimeTravel(), application.last, new AlarmScreen({index: 3}), { direction: "forward", duration: 1000, easeType: "sineEaseIn" } );
                    		}
                    	});
                    	remotePins.repeat("/gps/read", 300, position => {
                    		let device = deviceTable[3];
                    		device.latitude = position.latitude;
                    		device.longitude = position.longitude;
                    		if (device.proximity == "on") {
                    			let d2r = Math.PI / 180.0;
                    			let lat1 = device.latitude * d2r ;
                    			let lon1 = device.longitude * d2r;
                    			let lat2 = model.data.latitude * d2r;
                    			let lon2 = model.data.longitude * d2r;
                    			let dLat = lat2 - lat1;
                    			let dLon = lon2 - lon1;
                    			var R = 6371; // km
								var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
								        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
								var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
								var distance = R * c * 1000;
                        		if (distance > 30) {
                        			application.distribute("onTurnOnAlarm");
                        		}
                    		}
                    	});
                    }
                }
            }, 
            connectionDesc => {
                if (connectionDesc.name == "pins-share-led") {
                    trace("Disconnected from remote pins\n");
                    remotePins = undefined;
                }
            }
        );
        Pins.configure({
        	gps: {
        		require: "MTK3339",
        		pins: {
        			serial: {tx: 31, rx: 33}
        		}
        	}
        }, success => this.onPinsConfigured(application, success));
    },
    onPinsConfigured(application, success) {
    	if (success) {
    		application.add(new MainScreen(model.data));
    		Pins.repeat('/gps/read', 200, position => {
    			this.data.latitude = position.latitude;
    			this.data.longitude = position.longitude;
    		})
    	} else {
    		trace("failed to configure pins\n");
    	}
    },
    onQuit(application) {
        application.forget("prog3device.project.kinoma.marvell.com");
    }
});

application.style = new Style({ font: "Fira Sans" });