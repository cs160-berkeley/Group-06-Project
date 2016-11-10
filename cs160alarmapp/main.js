/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */import KEYBOARD from './keyboard';let screenHeight = 240;let screenWidth = 320;// importsimport Pins from "pins";import { THEME } from "theme";import { VerticalScroller, VerticalScrollbar, TopScrollerShadow, BottomScrollerShadow } from 'scroller';import { HorizontalSlider, HorizontalSliderBehavior } from 'sliders';import { Push, TimeTravel } from 'transition';import { FieldScrollerBehavior, FieldLabelBehavior } from 'field';// remotesvar remotePins;var deviceURL;// HandlersHandler.bind("/discover", Behavior({    onInvoke: function(handler, message){        deviceURL = JSON.parse(message.requestText).url;        trace("Found device.\n");    }}));Handler.bind("/forget", Behavior({    onInvoke: function(handler, message){        deviceURL = "";    }}));// Buttonsclass ButtonBehavior extends Behavior {	onTouchBegan(button) {		button.add(new Container({			left: 0, right: 0, top: 0, bottom: 0,			skin: THEME.whiteSkin		}));	}	onTouchEnded(button) {		button.remove(button.last);	}}let settingButton = Container.template($ => ({	left: 5, top: 5, bottom: 5, active: true,	contents: [		Picture($, {height: 35, width: 35, url: "assets/wheel.png"})	],	Behavior: ButtonBehavior}));let deactivateButton = Container.template($ => ({	left: 20, right: 10, height: 40, active: true, skin: THEME.greenSkin,	contents: [		Label($, {top: 0, bottom: 0, right: 0, left: 0, style: THEME.toneStyle, string: "Deactivate"})	],	behavior: Behavior({		onCreate: function(container, data) {			this.index = data.index;		},		onTouchBegan: function(container) {			container.skin = THEME.buttonSkin;		},		onTouchEnded: function(container) {			container.skin = THEME.greenSkin;			if (model.data.alarmTriggered) {				deviceTable[this.index].on = "off";				model.data.alarmTriggered = false;			}			if (deviceURL != "") new Message(deviceURL + "stopAudio").invoke(Message.JSON);			application.run(new TimeTravel(), application.last, new MainScreen(model.data), { direction: "back", duration: 1000, easeType: "sineEaseOut" } );		}	})}));let emergencyButton = Container.template($ => ({	left: 10, right: 20, height: 40, active: true, skin: THEME.redSkin,	contents: [		Label($, {top: 0, bottom: 0, right: 0, left: 0, style: THEME.toneStyle, string: "911"})	],	behavior: Behavior({		onTouchBegan: function(container) {			container.skin = THEME.buttonSkin;		},		onTouchEnded: function(container) {			container.skin = THEME.redSkin;		}	})}));let LinkButton = Container.template($ => ({	left: 5, top: 5, bottom: 5, active: true,	contents: [		Picture($, {height: 35, width: 35, url: "assets/" + $.url })	],	Behavior: class extends ButtonBehavior {		onTouchEnded(button) {			super.onTouchEnded(button);			application.run(new Push(), application.last, new $.nextScreen(model.data), { duration: 400, direction: $.direction} );		}	}}))let SwitchButton = Container.template($ => ({	top: 5, bottom: 5,	contents: [		Picture($, { height: 30, width: 50, url: "assets/" + deviceTable[$.index].on + ".png", active: true, 			behavior: Behavior({				onCreate: function(picture, data) {					this.index = data.index;				},				onTouchEnded: function(picture) {					if (deviceTable[this.index].on == "on") {						picture.url = "assets/off.png";						deviceTable[this.index].on = "off";					} else {						picture.url = "assets/on.png";						deviceTable[this.index].on = "on";					}					trace(deviceTable[this.index].name + " " + deviceTable[this.index].on + "\n");				}			})		})	],}));let ToneButton = Container.template($ => ({	left: 0, top: 0, bottom: 0, right: 0, active: true,	contents: [		Label($, { left: 0, right: 0, string: "Choose Tone", style: THEME.toneStyle })	],	behavior: Behavior({		onCreate: function(container, data) {			this.index = data.index;			if (deviceTable[$.index].tone.name)				container.last.string = deviceTable[$.index].tone.name;		},		onTouchBegan: function(container) {			container.skin = THEME.buttonSkin;		},		onTouchEnded: function(container) {			container.skin = new Skin({ fill: "transparent" });			application.run(new Push(), application.last, new SoundScreen({index: this.index}), { duration: 400, direction: "left" } );		}	})}))// Tone Listvar toneTable = [	{ name: "default", url: "beep.mp3" },	{ name: "old clock", url: "oldclock.mp3" },	{ name: "fire alarm", url: "firealarm.mp3" },	{ name: "classic", url: "classic.mp3"},	{ name: "school bell", url: "schoolbell.mp3"},]// Device Listvar deviceTable = [	{ name: "MacBook", url: "macbook.png", on: "off", tone: toneTable[0], index: 0, volume: 5},	{ name: "iPad", url: "ipad.jpg", on: "off", tone: toneTable[0], index: 1, volume: 5},	{ name: "iPhone", url: "iphone.png", on: "off", tone: toneTable[0], index: 2, volume: 5},];// Alarm Triggered Screenlet AlarmScreen = Container.template($ => ({	top: 0, bottom: 0, left: 0, right: 0,	skin: THEME.whiteSkin,	contents: [		Column($, {			top: 50, bottom: 50,left: 0, right: 0,			contents: [				new Container({					top: 0, height: 150, left: 0, right: 0,					contents: [						new Picture({ left: 0, right: 0, url: "assets/mapLong.png" })					]				}),				new Container({					top: 0, height: 50, left: 0, right: 0,					contents: [						Label($, { top: 0, bottom:0, left: 0, right: 0, style: THEME.toneStyle, string: deviceTable[$.index].name + " alarm triggered!" }),					]				}),				Line($, {					top: 0, bottom: 0, left: 0, right: 0,					contents: [						deactivateButton($),						emergencyButton()					]				})			]		}),		Container($, {			left: 5, right: 5, top: 0, height: 50,			contents: [				Label($, {left: 4, right: 4, string: "Alert!", style: THEME.titleStyle})			]		})	],	behavior: Behavior({		onCreate: function(container, data) {			var device = deviceTable[data.index];			trace(deviceURL + "playAudio?url=" +device.tone.url+ "&volume=" + device.volume.toString() + "\n");			if (deviceURL != "") new MessageWithObject(deviceURL + "playAudio?url=" +device.tone.url+ "&volume=" + device.volume.toString()).invoke(Message.JSON);		}	})}));// Searching Screenlet SearchingScreen = Container.template($ => ({	top: 0, bottom: 0, left: 0, right: 0, 	skin: THEME.whiteSkin,	contents: [		Container($, {top: 50, bottom: 0, left: 0, right: 0,			contents: [				Picture($, {top: 50, height: 100, width: 100, url: "assets/syncing.png"}),			]		}),		Line($ ,{			left: 5, right: 5, top: 0, height: 50,			skin: THEME.whiteSkin,			contents: [				new LinkButton({ nextScreen: MainScreen, direction: "right", url: "cancel.jpg" }),				Label($, {left: 4, right: 4, string: "Searching...", style: THEME.titleStyle}),				new Container({ right: 0, width: 10})			]		})	],	behavior: Behavior({		onDisplayed: function(container) {			sensorUtils.delay(1);			application.run(new Push(), application.last, new AddingDeviceScreen(model.data), { duration: 400, direction: "left" } );		}	})}))// Keyboard Screenlet KeyboardScreen = Container.template($ => ({	top: 0, bottom: 0, left: 0, right: 0,	skin: THEME.whiteSkin,	contents: [		Container($, {			left: 0, right: 0, top: 50, bottom: 0,			active: true,			contents: [				Container($, {					width: 200, height: 36, 					skin: new Skin({ borders: { left: 2, right: 2, top: 2, bottom: 2 }, stroke: 'gray' }), 					contents: [				        Scroller($, { 				            left: 4, right: 4, top: 4, bottom: 4, active: true, 				            Behavior: FieldScrollerBehavior, clip: true, 				            contents: [				                Label($, { 				                    left: 0, top: 0, bottom: 0, 				                    skin: new Skin({ fill: ['transparent', 'transparent', '#C0C0C0', '#acd473']}), 				                    style: new Style({ color: 'black', font: '24px', type: 'bold', horizontal: 'left', vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5 }),				                    anchor: 'NAME',				                    editable: true, string: "",				                    Behavior: class extends FieldLabelBehavior {				                    	onCreate(label, data) {				                    		this.data = {};				                    	}				                        onEdited(label) {				                            let data = this.data;				                            data.name = label.string;				                            label.container.hint.visible = (data.name.length == 0);				                        }				                        onEnterKeyPressed(label) {				                        	model.data.lastNumber ++;				                        	this.data.index = model.data.lastNumber;				                        	deviceTable.push({name: this.data.name, url: "kindle.png", on: "off", tone: toneTable[0], index: model.data.lastNumber, volume: 5});				                        	remotePins.invoke("/synced/write", 1);				                        	remotePins.repeat("/alarm/read", 500, value => {				                        		if (value == 1 && deviceTable[this.data.index].on == "on" && !model.data.alarmTriggered) {				                        			model.data.alarmTriggered = true;				                        			application.run(new TimeTravel(), application.last, new AlarmScreen(this.data), { direction: "forward", duration: 1000, easeType: "sineEaseIn" } );				                        		}				                        	});				                        	application.run(new Push(), application.last, new MainScreen(model.data), { duration: 400, direction: "left" } );				                        }				                    },				                }),				                Label($, {				                    left: 4, right: 4, top: 4, bottom: 4, 				                    style: new Style({ color: '#aaa', font: '24px', horizontal: 'left', vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5 }),				                    string: "Tap to add Name...", name: "hint"				                }),				            ]				        })				    ]				})			],			Behavior: class extends Behavior {				onTouchEnded(content) {					KEYBOARD.hide();					content.focus();				}			}		}),		Line($ ,{			left: 5, right: 5, top: 0, height: 50,			skin: THEME.whiteSkin,			contents: [				new LinkButton({ nextScreen: MainScreen, direction: "right", url: "back.png" }),				Label($, {left: 4, right: 4, string: "Add Device", style: THEME.titleStyle, anchor: "title"}),				new Container({ right: 0, width: 10})			]		})	]}))// Adding Device Screenlet AddingDeviceScreen = Container.template($ => ({	top: 0, bottom: 0, left: 0, right: 0,	skin: THEME.whiteSkin,	contents: [		Container($, {			active: true, top: 50, bottom: 0, left: 0, right: 0,			contents: [				new Label({					top: 0, bottom: 0, left: 0, right: 0, style: THEME.buttonStyle,					string: "No Device Found"				})			],			behavior: Behavior({				onCreate: function(container, data) {					if (remotePins) {						remotePins.invoke("/synced/read", value => {							if (value == 0) {								container.remove(container.last);								container.add(new Container({									height: 200, left: 0, right: 0, active: true,									contents: [										new Picture({ height: 200, url: "assets/kindle.png" })									],									behavior: Behavior({										onTouchBegan: function(container) {											container.skin = THEME.buttonSkin;										},										onTouchEnded: function(container) {											container.skin = THEME.whiteSkin;											application.run(new Push(), application.last, new KeyboardScreen(model.data), { duration: 400, direction: "left" } );										}									})								}));							}						})											}				}			})		}),		Line($ ,{			left: 5, right: 5, top: 0, height: 50,			skin: THEME.whiteSkin,			contents: [				new LinkButton({ nextScreen: MainScreen, direction: "right", url: "back.png" }),				Label($, {left: 4, right: 4, string: "Add Device", style: THEME.titleStyle, anchor: "title"}),				new Container({ right: 0, width: 10})			]		})			],}))// Sound Screenlet TonePad = Container.template($ => ({	active: true, left: 0, right: 0, bottom: 0, height: 40,	skin: THEME.blackBorderedSkin,	contents: [		Line($, {			left: 5, right: 5, top: 5, bottom: 5,			contents: [				Label($, {anchor: "checkTone", left: 5, width: 20, style: THEME.buttonStyle, string: ""}),				Label($, { left: 0, right: 0, string: $.name, style: THEME.buttonStyle })			]		})	],	behavior: Behavior({		onCreate: function(container, data) {			this.data = data;		},		onDisplayed: function(container) {						container.container.delegate("onCheckTone", this.data);		},		onTouchEnded: function(container) {			container.container.delegate("onToneSelected", this.data);		}	})}));let ToneColumn = Column.template($ => ({ 	top: 0, left: 0, right: 0, 	contents: [		toneTable.map(tone => TonePad(tone))	],	behavior: Behavior({		onCreate: function(column, data) {			this.index = data.index;		},		onToneSelected: function(column, tone) {			deviceTable[this.index].tone = tone;			application.run(new Push(), application.last, new ManagingScreen({index: this.index}), { duration: 400, direction: "right" } );		},		onCheckTone: function(column, tone) {			if (tone.name == deviceTable[this.index].tone.name)				tone.checkTone.string = "!"		}	})}));let SoundScreen = Container.template($ => ({	left: 0, right: 0, top: 0, bottom: 0, skin: THEME.whiteSkin,	contents: [		VerticalScroller($, {			active: true, top: 50, bottom: 0, left: 0, right: 0,			contents: [				ToneColumn($),                VerticalScrollbar(), 			    TopScrollerShadow(),			    BottomScrollerShadow()			]		}),		Line($, {			left: 5, right: 5, top: 0, height: 50,			skin: THEME.whiteSkin,			contents: [				new Container(({					left: 5, top: 5, bottom: 5, active: true,					contents: [						Picture($, {height: 35, width: 35, url: "assets/back.png" })					],					Behavior: class extends ButtonBehavior {						onTouchEnded(button) {							super.onTouchEnded(button);							application.run(new Push(), application.last, new ManagingScreen($), { duration: 400, direction: "right"} );						}					}				})),				Label($, {left: 4, right: 4, string: "Choose Tone", style: THEME.titleStyle}),				new Container({ right: 0, width: 10})			]		})	],}));// Managing Screenlet VolumeSlider = Layout.template($ => ({   	top: 0, bottom: 0, left: 0, right: 0, active: true,   	contents: [		Content($, { left: 0, right: 0, top: 0, bottom: 0, skin: THEME.horizontalSliderBarSkin, state: 0, }),		Content($, { left: 0, width: 30 + Math.round(deviceTable[$.index].volume * 9), top: 0, bottom: 0, skin: THEME.horizontalSliderBarSkin, state: 1, }),		Content($, { left: Math.round(deviceTable[$.index].volume * 9), width: 30 , top: 0, bottom: 0, skin: THEME.horizontalSliderButtonSkin, state: 0}),	],    Behavior: class extends HorizontalSliderBehavior {        onValueChanged(container) {            deviceTable[this.data.index].volume = this.data.value;        }    }}));let ManagingScreen = Container.template($ => ({	left: 0, right: 0, top: 0, bottom: 0, skin: THEME.whiteSkin,	contents: [		Column($, {			left: 20, right: 20, top: 50, bottom: 35,			contents: [				new Picture({width:300, height:100, url: "assets/" + deviceTable[$.index].url}),				Line($, {					left: 0, right: 0, top: 0, bottom: 0,					contents: [						Label($, { left: 0, width: 80, top: 0, bottom: 0, style: THEME.buttonStyle, string: "Alarm" }),						Container($, { left: 0, right: 0, top: 0, bottom: 0,							contents: [								SwitchButton($),							]						}),					]				}),				Line($, {					left: 0, right: 0, top: 0, bottom: 0,					contents: [						Label($, { left: 0, width: 80, top: 0, bottom: 0, style: THEME.buttonStyle, string: "Tone" }),						ToneButton($)					]				}),				Line($, {					left: 0, right: 0, top: 0, bottom: 0,					contents: [						Label($, { left: 0, width: 80, top: 0, bottom: 0, style: THEME.buttonStyle, string: "Volume" }),						new VolumeSlider({ min: 0, max: 10, value: deviceTable[$.index].volume, index: $.index })					]				}),			]		}),		Container($, {			left: 0, height: 35, bottom: 0, right: 0, active: true, skin: THEME.buttonSkin,			contents: [				Label($, { left: 0, top: 0, bottom: 0, right: 0, string: "Play alarm to test", style: THEME.buttonStyle })			],			behavior: Behavior({				onCreate: function(container, data) {					this.data = data;				},				onTouchBegan: function(container) {					container.skin = THEME.whiteSkin;				},				onTouchEnded: function(container) {					container.skin = THEME.buttonSkin;					if (remotePins && this.data.index == 3) {						remotePins.invoke("/synced/read", value => {							if (value == 1)								application.run(new TimeTravel(), application.last, new AlarmScreen(this.data), { direction: "forward", duration: 1000, easeType: "sineEaseIn" } );						});					}									}			})		}),		Line($ ,{			left: 5, right: 5, top: 0, height: 50,			skin: THEME.whiteSkin,			contents: [				new LinkButton({ nextScreen: MainScreen, direction: "right", url: "back.png" }),				Label($, {left: 4, right: 4, string: deviceTable[$.index].name, style: THEME.titleStyle}),				new Container({ right: 0, width: 45 })			]		})	]}))// MainScreenlet DevicePad = Container.template($ => ({	active: true, left: 2, right: 2, bottom: 2, height: 54,	skin: THEME.whiteSkin,	contents: [		Line($, {			left: 5, right: 5, top: 5, bottom: 5,			contents: [				Picture($, { top: 2, bottom: 2, left: 2, width: 50, height: 50, url: "assets/" + $.url, aspect: "fit" }),				Label($, { left: 0, right: 0, string: $.name, style: THEME.buttonStyle }),				SwitchButton($)			]		})	],	behavior: Behavior({		onTouchEnded: function(container) {			application.run( new Push(), application.last, new ManagingScreen({index: $.index}), { duration: 400, direction: "left" } );		}	})}));let DeviceColumn = Column.template($ => ({ 	top: 0, left: 0, right: 0, 	contents: [		deviceTable.map(device => DevicePad(device))	]}));let MainScreen = Container.template($ => ({	left: 0, right: 0, top: 0, bottom: 0, skin: THEME.whiteSkin,	contents: [		VerticalScroller($, {			active: true, top: 150, bottom: 0, left: 0, right: 0,			contents: [				DeviceColumn($),                VerticalScrollbar(), 			    TopScrollerShadow(),			    BottomScrollerShadow()			]		}),		Container($, {			top: 50, height: 100,			contents: [				Picture($, {width:300, height:100, url: "assets/map.png"})			]		}),		Line($, {			left: 5, right: 5, top: 0, height: 50,			skin: THEME.whiteSkin,			contents: [				new settingButton(),				Label($, {left: 4, right: 4, string: "Alert Me", style: THEME.titleStyle}),				new LinkButton({ nextScreen: SearchingScreen, direction: "left", url: "add.png" }),			]		})	],}));// Application Behaviorvar model = application.behavior = Behavior({	onLaunch(application) {		this.data = {			lastNumber: 2,			alarmTriggered: false		};		application.discover("prog3device.project.kinoma.marvell.com");		application.add(new MainScreen(model.data));		let discoveryInstance = Pins.discover(            connectionDesc => {                if (connectionDesc.name == "pins-share-led") {                    trace("Connecting to remote pins\n");                    remotePins = Pins.connect(connectionDesc);                }            },             connectionDesc => {                if (connectionDesc.name == "pins-share-led") {                    trace("Disconnected from remote pins\n");                    remotePins = undefined;                }            }        );	    },    onQuit(application) {        application.forget("prog3device.project.kinoma.marvell.com");    }})application.style = new Style({ font: "Fira Sans" });