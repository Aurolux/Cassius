/**
 * Writing commands
 * Cassius - https://github.com/sirDonovan/Cassius
 *
 * @license MIT license
 */

'use strict';

const database = Storage.getDatabase('science');
const MESSAGES_TIME_OUT = 7 * 24 * 60 * 60 * 1000;

// sync database properties
if (!database.potd) database.potd = [];
if (!database.researchMerch) database.researchMerch = [];
}
/* Shop Merchandise
 * 1st Element: Name
 * 2nd Element: Description
 * 3rd Element: Price
 * 4th Element: Price with comma included (used for advertising)
 * 5th Element: Usage Instructions
 * 6th Element: Rooms
 */
let shopMerch = [
	["Fossil",
		"The best way for you to waste your money!",
		"5 (Five)",
		5,
		"fossil, amount of fossils",
		"groupchat-aurolux-science"],
	/* To be edited from writing
	["Take The Stage",
		"For up to 2 minutes, we will set the room to modchat(+) and let you recite your poem or rap in the chat live! There is no greater way to receive feedback and recognition.",
		"500 (Five Hundred)",
		500,
		"take the stage. Then, use the 'spotlight' command as instructed to use up your purchase! No refunds on this if you use it and nobody's paying attention, so use it when you think would be the best time. :3",
		"groupchat-aurolux-science"],
	["Poetic License",
		"Simply owning one of these grants you the ability to set the Word of the Day up to 3 times through the " + Config.commandCharacter + "wotd command! Usage: " + Config.commandCharacter + "wotd Word, Pronunciation, Part of Speech (Noun, Verb, Adjective, etc...), and Definition. -- DON'T BUY THIS IF YOU ARE ALREADY VOICE OR ABOVE",
		"550 (Five Hundred and Fifty)",
		550,
		"poetic license. Then, follow the instructions provided in the item's description.",
		"Writing"],
	["Personal Greeting (Public)",
		"Use this to gain the ability to set a personal greeting for The Scribe to say whenever you join the room after being gone for a while! What better way to make an entrance?",
		"1,500 (One Thousand, Five Hundred)",
		1500,
		"public greeting. Follow the instructions provided on purchase.",
		"Writing, Myths & Magic, and The Arcadium"],
	["Let's Save The World!",
		"Get yourself immortalized as a PROTAGONIST in a short story written by some of the Writing Room's best story writers. ETA: 3 weeks from purchase.",
		"2,000 (Two Thousand)",
		2000,
		"protagonist. Follow the rest instuctions provided on purchase.",
		"Writing"],
	["Destroy It All!",
		"Get yourself immortalized as an ANTAGONIST in a short story written by some of the Writing Room's best story writers. ETA: 3 weeks from purchase.",
		"2,000 (Two Thousand)",
		2000,
		"antagonist. Follow the rest instuctions provided on purchase.",
		"Writing"], */
	["Your Soul",
		"???",
		"1,000,000 (One Million)",
		0,
		"my soul",
		"Yourself"],
];

/**@type {{[k: string]: Command | string}} */
let commands = {
	/*
	 * Random Commands Section!
	 * Place all 'random thing generator' commands in this area!
	 * This is a template for all Random Commands; please don't use this as an actual command.
	 * randomcommands: function (target, room, user) {
	 *	if (!user.canUse('randomcommands', room.id)) return false;
	 *	let text = room instanceof Users.User || user.hasRank(room, '+') ? '' : '/pm ' + user.name + ', ';
	 *	let variableone = list1[Math.floor(list1.length * Math.random())];
	 *	let variabletwo = list2[Math.floor(list2.length * Math.random())];
	 *	this.say(text + "Randomly generated thing: __" + variableone + " " + variabletwo + "__.");
	 * },
	*/

	/*
	 * Messaging-related commands
	 *
	 */
	//Clears the mail of a specific user, or all of it.
	clearmail: 'clearmessages',
	clearmessages: function (target, room, user) {
		if (room instanceof Users.User || !user.hasRank(room, '#')) return false;
		if (!target) return this.say('Specify whose mail to clear or \'all\' to clear all mail.');
		if (!database.mail) return this.say('The message file is empty.');
		if (target === 'all') {
			database.mail = {};
			Storage.exportDatabase('writing');
			this.say('All messages have been cleared.');
		} else if (target === 'time') {
			for (let u in database.mail) {
				let messages = database.mail[u].slice(0);
				for (let i = 0; i < messages.length; i++) {
					if (messages[i].time < (Date.now() - MESSAGES_TIME_OUT)) database.mail[u].splice(database.mail[u].indexOf(messages[i]), 1);
				}
			}
			Storage.exportDatabase('writing');
			this.say('Messages older than one week have been cleared.');
		} else {
			let tarUser = Tools.toId(target);
			if (!database.mail[tarUser]) return this.say(target + ' does not have any pending messages.');
			delete database.mail[tarUser];
			Storage.exportDatabase('writing');
			this.say('Messages for ' + target + ' have been cleared.');
		}
	},
	//Counts how much mail is currently pending and returns a link (in PMs) to the user about who sent what when and to whom if they're of a certain rank.
	countmessages: 'countmail',
	countmail: function (target, room, user) {
		if (room instanceof Users.User || !user.hasRank(room, '+')) return false;
		if (!database.mail) this.say('The message file is empty');
		let messageCount = 0;
		let oldestMessage = Date.now();
		let messageArray = []; //Array that stores messages to be uploaded to Hastebin.
		for (let u in database.mail) {
			for (let i = 0; i < database.mail[u].length; i++) {
				if (database.mail[u][i].time < oldestMessage) oldestMessage = database.mail[u][i].time;
				messageCount++;
				messageArray.push(["From: " + database.mail[u][i].from, "To: " + database.mail[u][i].destination, "Days Since Sent: " + Math.round((Date.now() - database.mail[u][i].time) / (24 * 60 * 60 * 1000))]);
			}
		}
		//convert oldestMessage to days
		let day = Math.floor((Date.now() - oldestMessage) / (24 * 60 * 60 * 1000));
		this.say('There are currently **' + messageCount + '** pending messages. ' + (messageCount ? 'The oldest message ' + (!day ? 'was left today.' : 'is __' + day + '__ days old.') : ''));

		if (user.hasRank(room, '@')) {
			let output = [];
			for (let i = 0; i < messageArray.length; i++) {
				output.push(messageArray[i][0] + "\n" + messageArray[i][1] + "\n" + messageArray[i][2] + "\n");
			}
			Tools.uploadToHastebin('Messages:\n\n' + output.join('\n'), /**@param {string} link*/ link => this.say("/msg " + user.name + ", Messages Log: " + link));
		}
	},
	vmb: 'viewmessageblacklist',
	viewmessageblacklist: function (target, room, user) {
		if (room instanceof Users.User || !user.hasRank(room, '@')) return false;
		if (!database.messageBlacklist) return this.say('No users are blacklisted from the message system');
		let messageBlacklist = Object.keys(database.messageBlacklist);
		Tools.uploadToHastebin('The following users are banned in ' + room + ':\n\n' + messageBlacklist.join('\n'), /**@param {string} link*/ link => this.say("/pm " + user.name + ", Message Blacklist: " + link));
	},
	// Of the Day commands
	// Scientist of the Day
	'scientist': 'sotd',
	sotd: function (target, room, user) {
		let text = room instanceof Users.User || user.hasRank(room, '+') ? '' : '/pm ' + user.name + ', ';
		if (!target) {
			if (!database.sotd) return this.say(text + "No Scientist of the Day has been set.");
			let tem = new Date(database.sotd.time).toLocaleString('en-US', {hour: 'numeric', minute:'numeric', day:'2-digit', month:'long', hour12: true, timeZoneName: 'short'});
			let box = '<div style="font-family: Georgia, serif ; max-width: 550px ; margin: auto ; padding: 8px 8px 12px 8px; text-align: left; background: rgba(250, 250, 250, 0.8)"> <span style="display: block ; font-family: Verdana, Geneva, sans-serif ; font-size: 16pt ; font-weight: bold ; background: green ; padding: 3px 0 ; text-align: center ; border-radius: 2px ; color: rgba(255 , 255 , 255 , 1) ; margin-bottom: 0px"> <i class="fa fa-flask"></i> Scientist of the Day <i class="fa fa-flask"></i> </span><table style="padding-top: 0px;"> <tr> <td style="padding-left:8px; vertical-align:baseline;"> <div style="font-size: 22pt ; margin-top: 5px; color: black;">' + database.sotd.title + '</div> <span style="font-family:sans-serif;font-size:12pt;display:block;color:rgba(0,0,0,0.7);letter-spacing:0px;">' + database.sotd.lifetime + ' - <strong style="letter-spacing:0;">' + database.sotd.profession + '</strong></span><span style="font-size:10pt;font-family:sans-serif;margin-top:10px;display:block;color:rgba(0,0,0,0.8)"><strong style="font-family:serif;margin-right:10px;color:rgba(0,0,0,0.5)"></strong>' + database.sotd.description + '</span></td></tr></table></div>';
			let boxpm = '<div style="font-family: Georgia, serif ; max-width: 550px ; margin: auto ; padding: 8px 8px 12px 8px; text-align: left; background: rgba(250, 250, 250, 0.8)"> <span style="display: block ; font-family: Verdana, Geneva, sans-serif ; font-size: 16pt ; font-weight: bold ; background: green ; padding: 3px 0 ; text-align: center ; border-radius: 2px ; color: rgba(255 , 255 , 255 , 1) ; margin-bottom: 0px"> <i class="fa fa-flask"></i> Scientist of the Day <i class="fa fa-flask"></i> </span><table style="padding-top: 0px;"> <tr> <td style="padding-left:8px; vertical-align:baseline;"> <div style="font-size: 22pt ; margin-top: 5px; color: black;">' + database.sotd.title + '</div> <span style="font-family:sans-serif;font-size:12pt;display:block;color:rgba(0,0,0,0.7);letter-spacing:0px;">' + database.sotd.lifetime + ' - <strong style="letter-spacing:0;">' + database.sotd.profession + '</strong></span><span style="font-size:10pt;font-family:sans-serif;margin-top:10px;display:block;color:rgba(0,0,0,0.8)"><strong style="font-family:serif;margin-right:10px;color:rgba(0,0,0,0.5)"></strong>' + database.sotd.description + '</span></td></tr></table></div>';
			if (!(room instanceof Users.User) && user.hasRank(room, '+')) {
				return this.sayHtml(box);
			} else {
				// The below is a hacky way to get pminfobox to work within PM. It defaults to Writing since AxeBot/The Scribe is always * in that room. For personal bots, this should be changed to any room that you can guarentee the bot has at least * permissions.
				if (!(room instanceof Users.User) && Users.self.rooms.get(room) === '*') {
					return this.pmHtml(user, boxpm);
				} else {
					return this.say(text + "Today's Scientist of the Day is **" + database.sotd.title + "**:" + "__" + database.sotd.lifetime + "__" + " - " + database.sotd.profession) + database.sotd.description;
				}
			}
		}
		if (Tools.toId(target) === 'check' || Tools.toId(target) === 'time') {
			if (!database.sotd) return this.say(text + "There is no Scientist of the Day to check!");
			return this.say(text + "The Scientist of the Day was last updated to **" + database.sotd.title + "** " + Tools.toDurationString(Date.now() - database.sotd.time) + " ago by " + database.sotd.user);
		}
		let targets = target.split('|');
		let typo = false;
		if (targets[0] === "typo") {
			if (!database.sotd) return this.say(text + "There is no Scientist of the Day to correct!");
			if ((room instanceof Users.User || !user.hasRank(room, '%')) && user.name !== database.sotd.user) return this.say(text + "Sorry, you must be the original user or driver and above to make typo corrections.");
			typo = true;
			targets.shift();
		}
		if (database.sotd) {
			if (!typo && Date.now() - database.sotd.time < 61200000) return this.say(text + "Sorry, but at least 17 hours must have passed since the SOTD was last set in order to set it again!");
		}
		let hasPerms = false;
		if (database.scribeShop) {
			if (typo || (!(room instanceof Users.User) && user.hasRank(room, '+'))) {
				hasPerms = true;
			} 
		} else if (!(room instanceof Users.User) && user.hasRank(room, '+')) {
			hasPerms = true;
		}
		if (!hasPerms) return this.say(text + 'You must be at least Voice or higher to set the Scientist of the Day.');
		if (targets.length < 4) return this.say(text + "Invalid arguments specified. The format is: __title__ | __lifetime__ | __profession__ | __description__.");
		let sotd = {
			title: targets[0].trim(),
			lifetime: targets [1],
			profession: targets [2],
			description: targets[3].trim(),
		};
		if (!typo) {
			sotd.time = Date.now();
			sotd.user = user.name;
		} else {
			sotd.time = database.sotd.time;
			sotd.user = database.sotd.user;
		}
		if (!database.sotdScientist) {
			database.sotdScientist = [];
		}
		database.sotd = sotd;
		database.sotdScientist.push(sotd);
		Storage.exportDatabase('writing');
		this.say(text + "The Scientist of the Day has been set to '" + targets[0] + "'!");
		this.say("/modnote The Scientist of the Day was set to " + database.sotd.title + " by " + database.sotd.user + ".");
		},
	// Fact of the Day
	'fact': 'fotd',
	fotd: function (target, room, user) {
		let text = room instanceof Users.User || user.hasRank(room, '+') ? '' : '/pm ' + user.name + ', ';
		if (!target) {
			if (!database.fotd) return this.say(text + "No fact of the Day has been set.");
			let tem = new Date(database.fotd.time).toLocaleString('en-US', {hour: 'numeric', minute:'numeric', day:'2-digit', month:'long', hour12: true, timeZoneName: 'short'});
			let box = '<div style="font-family: Georgia, serif ; max-width: 550px ; margin: auto ; padding: 8px 8px 12px 8px; text-align: left; background: rgba(250, 250, 250, 0.8)"> <span style="display: block ; font-family: Verdana, Geneva, sans-serif ; font-size: 16pt ; font-weight: bold ; background: #e27a0b ; padding: 3px 0 ; text-align: center ; border-radius: 2px ; color: rgba(255 , 255 , 255 , 1) ; margin-bottom: 0px"> <i class="fa fa-thermometer-1"></i> Fact of the Day <i class = "fa fa-thermometer-1"></i> </span><table style="padding-top: 0px;"> <tr> <td style="padding-left:8px; vertical-align:baseline;"> <div style="font-size: 22pt ; margin-top: 5px; color: black;">' + database.fotd.fact + '</div><span style="font-family:sans-serif;font-size:12pt;display:block;color:rgba(0,0,0,0.7);letter-spacing:0px;"><b>Field of Science:</b> <span style="letter-spacing:0;">' + database.fotd.type + '</span></span> <span style="font-size:10pt;font-family:sans-serif;margin-top:10px;display:block;color:rgba(0,0,0,0.8)"><strong style="font-family:serif;margin-right:10px;color:rgba(0,0,0,0.5)"></strong>' + database.fotd.description + '</span></td></tr></table></div>';
			let boxpm = '<div style="font-family: Georgia, serif ; max-width: 550px ; margin: auto ; padding: 8px 8px 12px 8px; text-align: left; background: rgba(250, 250, 250, 0.8)"> <span style="display: block ; font-family: Verdana, Geneva, sans-serif ; font-size: 16pt ; font-weight: bold ; background: #e27a0b ; padding: 3px 0 ; text-align: center ; border-radius: 2px ; color: rgba(255 , 255 , 255 , 1) ; margin-bottom: 0px"> <i class="fa fa-thermometer-1"></i> Fact of the Day <i class = "fa fa-thermometer-1"></i> </span><table style="padding-top: 0px;"> <tr> <td style="padding-left:8px; vertical-align:baseline;"> <div style="font-size: 22pt ; margin-top: 5px; color: black;">' + database.fotd.fact + '</div><span style="font-family:sans-serif;font-size:12pt;display:block;color:rgba(0,0,0,0.7);letter-spacing:0px;"><b>Field of Science:</b> <span style="letter-spacing:0;">' + database.fotd.type + '</span></span> <span style="font-size:10pt;font-family:sans-serif;margin-top:10px;display:block;color:rgba(0,0,0,0.8)"><strong style="font-family:serif;margin-right:10px;color:rgba(0,0,0,0.5)"></strong>' + database.fotd.description + '</span></td></tr></table></div>';
			if (!(room instanceof Users.User) && user.hasRank(room, '+')) {
				return this.sayHtml(box);
			} else {
				// The below is a hacky way to get pminfobox to work within PM. It defaults to Writing since AxeBot/The Scribe is always * in that room. For personal bots, this should be changed to any room that you can guarentee the bot has at least * permissions.
				if (!(room instanceof Users.User) && Users.self.rooms.get(room) === '*') {
					return this.pmHtml(user, boxpm);
				} else {
					return this.say(text + "Today's Fact of the Day is **" + database.fotd.fact + "**:" + database.fotd.description);
				}
			}
		}
		if (Tools.toId(target) === 'check' || Tools.toId(target) === 'time') {
			if (!database.fotd) return this.say(text + "There is no Fact of the Day to check!");
			return this.say(text + "The Fact of the Day was last updated to **" + database.fotd.title + "** " + Tools.toDurationString(Date.now() - database.fotd.time) + " ago by " + database.fotd.user);
		}
		let targets = target.split('|');
		let typo = false;
		if (targets[0] === "typo") {
			if (!database.fotd) return this.say(text + "There is no Fact of the Day to correct!");
			if ((room instanceof Users.User || !user.hasRank(room, '%')) && user.name !== database.fotd.user) return this.say(text + "Sorry, you must be the original user or driver and above to make typo corrections.");
			typo = true;
			targets.shift();
		}
		if (database.fotd) {
			if (!typo && Date.now() - database.fotd.time < 61200000) return this.say(text + "Sorry, but at least 17 hours must have passed since the SOTD was last set in order to set it again!");
		}
		let hasPerms = false;
		if (database.scribeShop) {
			if (typo || (!(room instanceof Users.User) && user.hasRank(room, '+'))) {
				hasPerms = true;
			} 
		} else if (!(room instanceof Users.User) && user.hasRank(room, '+')) {
			hasPerms = true;
		}
		if (!hasPerms) return this.say(text + 'You must be at least Voice or higher to set the Scientist of the Day.');
		if (targets.length < 3) return this.say(text + "Invalid arguments specified. The format is: __title__ | __description__.");
		let fotd = {
			fact: targets[0].trim(),
			type: targets[1],
			description: targets[2].trim(),
		};
		if (!typo) {
			fotd.time = Date.now();
			fotd.user = user.name;	
		} else {
			fotd.time = database.fotd.time;
			fotd.user = database.fotd.user;
		}
		if (!database.fotdFact) {
			database.fotdFact = [];
		}
		database.fotd = fotd;
		database.fotdFact.push(fotd);
		Storage.exportDatabase('science');
		this.say(text + "The Fact of the Day has been set to '" + targets[0] + "'!");
		this.say("/modnote The Fact of the Day was set to " + database.fotd.fact + " by " + database.fotd.user + ".");
		},

	// Star of the Day
	'star': 'stotd',
	stotd: function (target, room, user) {
		let text = room instanceof Users.User || user.hasRank(room, '+') ? '' : '/pm ' + user.name + ', ';
		if (!target) {
			if (!database.stotd) return this.say(text + "No Star of the Day has been set.");
			let tem = new Date(database.stotd.time).toLocaleString('en-US', {hour: 'numeric', minute:'numeric', day:'2-digit', month:'long', hour12: true, timeZoneName: 'short'});
			let box = '<div style="font-family: Georgia, serif ; max-width: 550px ; margin: auto ; padding: 8px 8px 12px 8px; text-align: left; background: rgba(250, 250, 250, 0.8)"> <span style="display: block ; font-family: Verdana, Geneva, sans-serif ; font-size: 16pt ; font-weight: bold ; background: #5b24ad ; padding: 3px 0 ; text-align: center ; border-radius: 2px ; color: rgba(255 , 255 , 255 , 1) ; margin-bottom: 0px"> <i class="fa fa-star"></i> Scientist of the Day <i class="fa fa-star"></i> </span><table style="padding-top: 0px;"> <tr> <td style="padding-left:8px; vertical-align:baseline;"> <div style="font-size: 22pt ; margin-top: 5px; color: black;">' + database.stotd.title + '</div><span style="font-family:sans-serif;font-size:12pt;display:block;color:rgba(0,0,0,0.7);letter-spacing:0px;"><b>Type:</b> <span style="letter-spacing:0;">' + database.stotd.type + '</span></span> <span style="font-size:10pt;font-family:sans-serif;margin-top:10px;display:block;color:rgba(0,0,0,0.8)"><strong style="font-family:serif;margin-right:10px;color:rgba(0,0,0,0.5)"></strong>' + database.stotd.description + '</span></td></tr></table></div>';
			let boxpm = '<div style="font-family: Georgia, serif ; max-width: 550px ; margin: auto ; padding: 8px 8px 12px 8px; text-align: left; background: rgba(250, 250, 250, 0.8)"> <span style="display: block ; font-family: Verdana, Geneva, sans-serif ; font-size: 16pt ; font-weight: bold ; background: #5b24ad ; padding: 3px 0 ; text-align: center ; border-radius: 2px ; color: rgba(255 , 255 , 255 , 1) ; margin-bottom: 0px"> <i class="fa fa-star"></i> Scientist of the Day <i class="fa fa-star"></i> </span><table style="padding-top: 0px;"> <tr> <td style="padding-left:8px; vertical-align:baseline;"> <div style="font-size: 22pt ; margin-top: 5px; color: black;">' + database.stotd.title + '</div><span style="font-family:sans-serif;font-size:12pt;display:block;color:rgba(0,0,0,0.7);letter-spacing:0px;"><b>Type:</b> <span style="letter-spacing:0;">' + database.stotd.type + '</span></span> <span style="font-size:10pt;font-family:sans-serif;margin-top:10px;display:block;color:rgba(0,0,0,0.8)"><strong style="font-family:serif;margin-right:10px;color:rgba(0,0,0,0.5)"></strong>' + database.stotd.description + '</span></td></tr></table></div>';
			if (!(room instanceof Users.User) && user.hasRank(room, '+')) {
				return this.sayHtml(box);
			} else {
				// The below is a hacky way to get pminfobox to work within PM. It defaults to Writing since AxeBot/The Scribe is always * in that room. For personal bots, this should be changed to any room that you can guarentee the bot has at least * permissions.
				if (!(room instanceof Users.User) && Users.self.rooms.get(room) === '*') {
					return this.pmHtml(user, boxpm);
				} else {
					return this.say(text + "Today's Star of the Day is **" + database.stotd.title + "**:" + database.stotd.description);
				}
			}
		}
		if (Tools.toId(target) === 'check' || Tools.toId(target) === 'time') {
			if (!database.stotd) return this.say(text + "There is no Star of the Day to check!");
			return this.say(text + "The Star of the Day was last updated to **" + database.stotd.title + "** " + Tools.toDurationString(Date.now() - database.stotd.time) + " ago by " + database.stotd.user);
		}
		let targets = target.split('|');
		let typo = false;
		if (targets[0] === "typo") {
			if (!database.stotd) return this.say(text + "There is no Star of the Day to correct!");
			if ((room instanceof Users.User || !user.hasRank(room, '%')) && user.name !== database.stotd.user) return this.say(text + "Sorry, you must be the original user or driver and above to make typo corrections.");
			typo = true;
			targets.shift();
		}
		if (database.stotd) {
			if (!typo && Date.now() - database.stotd.time < 61200000) return this.say(text + "Sorry, but at least 17 hours must have passed since the SOTD was last set in order to set it again!");
		}
		let hasPerms = false;
		if (database.scribeShop) {
			if (typo || (!(room instanceof Users.User) && user.hasRank(room, '+'))) {
				hasPerms = true;
			} 
		} else if (!(room instanceof Users.User) && user.hasRank(room, '+')) {
			hasPerms = true;
		}
		if (!hasPerms) return this.say(text + 'You must be at least Voice or higher to set the Scientist of the Day.');
		if (targets.length < 2) return this.say(text + "Invalid arguments specified. The format is: __star__ | __star type__ | .");
		let stotd = {
			title: targets[0].trim(),
			type: targets[1],
			description: targets[2].trim(),
		};
		if (!typo) {
			stotd.time = Date.now();
			stotd.user = user.name;	
		} else {
			stotd.time = database.sotd.time;
			stotd.user = database.sotd.user;
		}
		if (!database.stotdStar) {
			database.stotdStar = [];
		}
		database.stotd = stotd;
		database.stotdStar.push(stotd);
		Storage.exportDatabase('science');
		this.say(text + "The Star of the Day has been set to '" + targets[0] + "'!");
		this.say("/modnote The Star of the Day was set to " + database.stotd.title + " by " + database.stotd.user + ".");
		},
	/*
	* ScienceData Shop Commands!
	*/
	addmoles: 'addfunds',
	pay: 'addfunds',
	addfunds: function (target, room, user) {
		if (room instanceof Users.User || !user.hasRank(room, '%')) return false;
		let targets = target.split(',');
		if (targets.length !== 2) return this.say("Incorrect number of arguments. Usage: user, funds to add");
		let targetUser = Tools.toId(targets[0]);
		//Whilst it certainly shouldn't be an issue in the rooms I'm personally stationed in, we may as well prevent moderators from abusing their rights and giving themselves infinite money. No need to enforce this on ROs.
		if (targetUser === user.id && !user.hasRank(room, '#')) return this.say("Sorry, but you're not allowed to add funds to your own account unless it's for debugging purposes. ^.^'");
		let funds = parseInt(targets[1]);
		if (isNaN(funds)) return this.say("Currency amount to add is not equal to a number.");

		//Build instance of the Science Shop if it does not exist; this will always happen on the first use of the command on a new bot, or if Settings.json has been erased or damaged.
		if (!database.researchMerch) {
			database.researchMerch = [];
			let extraFunds = Math.round(funds / 2);
			let amount = funds + extraFunds;
			database.researchMerch.push({
				account: targetUser,
				bal: amount,
				totalEarned: amount,
			});
			Storage.exportDatabase('writing');
			return this.say("A new Science Shop service has been created, and its very first account, " + targets[0].trim() + "'s, has had ``" + funds + "`` Moles added. And as a bonus for this event, we're throwing in an extra ``" + extraFunds + "`` Moles, absolutely free of charge! Now aren't we just so nice? c:");
		}

		//Search through all accounts.
		for (let i = 0; i < database.researchMerch.length; i++) {
			//If account is found...
			if (database.researchMerch[i].account === targetUser) {
				//Add funds.
				database.researchMerch[i].bal += funds;
				database.researchMerch[i].totalEarned += funds;
				//Save changes.
				Storage.exportDatabase('writing');
				//Report changes.
				return this.say("``" + funds + "`` Moles have been added to " + targets[0].trim() + "'s account! Current Balance: ``" + database.researchMerch[i].bal + "``");
			}
		}
		//Add new account and save changes.
		database.researchMerch.push({
			account: targetUser,
			bal: funds,
			totalEarned: funds,
		});
		Storage.exportDatabase('writing');
		//Report completion.
		return this.say("New account for " + targets[0].trim() + " has been created and ``" + funds + "`` Moles have been added!");
	},
	//Subtract funds from a user's account.
	takemoles: 'takefunds',
	take: 'takefunds',
	takefunds: function (target, room, user) {
		if (room instanceof Users.User || !user.hasRank(room, '@')) return false;
		let targets = target.split(',');
		if (targets.length !== 2) return this.say("Incorrect number of arguments. Usage: user, funds to add");
		let targetUser = Tools.toId(targets[0]);
		let funds = parseInt(targets[1]);
		if (isNaN(funds)) return this.say("Currency amount to take is not equal to a number.");

		for (let i = 0; i < database.researchMerch.length; i++) {
			if (database.researchMerch[i].account === targetUser) {
				//Checking to see if the user has enough money to subtract.
				database.researchMerch[i].bal = Math.max(database.researchMerch[i].bal - funds, 0);
				this.say("``" + funds + "`` Moles have been deducted from " + targets[0].trim() + "'s account! Their new balance is ``" + database.researchMerch[i].bal + "``");
			}
		}
	},
	// Returns current balance for a particular user. Or yourself, if nobody is specified.
	atm: 'bal',
	balance: 'bal',
	bal: function (target, room, user) {
		let text = room instanceof Users.User || user.hasRank(room, '+') ? '' : '/pm ' + user.name + ', ';
		if (!database.researchMerch) return this.say(text + "The Scribe Shop does not exist! Perhaps Moles should be given out first before trying to view a non-existent currency, hmm?");

		//If no user is specified, check the user's own balance.
		if (!target) {
			for (let i = 0; i < database.researchMerch.length; i++) {
				if (database.researchMerch[i].account === user.id) {
					if (database.researchMerch[i].totalEarned !== database.researchMerch[i].bal) {
						return this.say(text + user.name + ", you currently have ``" + database.researchMerch[i].bal + "`` Moles to spend! Over the whole lifetime of your account, you have earned a whole ``" + database.researchMerch[i].totalEarned + "`` Moles!");
					} else {
						return this.say(text + user.name + ", you currently have ``" + database.researchMerch[i].bal + "`` Moles to spend!");
					}
				}
			}
			return this.say(text + "You don't have an account! oAo Earn funds to get one automagically!");
		} else {
			let targetUser = Tools.toId(target);
			for (let i = 0; i < database.researchMerch.length; i++) {
				if (database.researchMerch[i].account === targetUser) {
					if (database.researchMerch[i].totalEarned !== database.researchMerch[i].bal) {
						return this.say(text + target + " currently has ``" + database.researchMerch[i].bal + "`` Moles to spend! Over the whole lifetime of their account, they have earned a whole ``" + database.researchMerch[i].totalEarned + "`` Moles!");
					} else {
						return this.say(text + target + " currently has ``" + database.researchMerch[i].bal + "`` Moles to spend!");
					}
				}
			}
			return this.say(text + "Account for '" + target + "' does not exist. :c");
		}
	},
	// Automatically generates the 'UI' for the shop, and uploads it to Hastebin.
	researchmerch: 'rm',
	researchmerch: function (target, room, user) {
		let text = room instanceof Users.User || user.hasRank(room, '+') ? '' : '/pm ' + user.name + ', ';
		let line = "__________________________________________________________________________________________________________________________________________";
		let post = [line,
			"\nResearch Warehouse!\n",
			'"Got spare Moles? This is where you spend them!"\n',
			"Use " + Config.commandCharacter + "buy ITEM NAME, ITEM QUANTITY to purchase something!",
			"Alternatively, you can leave out the item quantity to just buy one of the item, and use the number in brackets in place of the item's full name!\n\n",
			"As a general rule of thumb, to purchase things, you simply type " + Config.commandCharacter + "buy, followed by the item's name or number. For instance, to purchase the item '" + shopMerch[0][0] + "', you would ype " + Config.commandCharacter + "buy " + shopMerch[0][0] + " or " + Config.commandCharacter + "buy 0\n",
			"Additionally, it's also possible to specify just how many of something you want to buy by including that at the end of the message! Returning to our " + shopMerch[0][0] + " example from earlier, " + Config.commandCharacter + "buy " + shopMerch[0][0] + ", 10 will purchase the item 10 times!\n",
			line + "\n",
		];

		let accFound = false;
		if (database.researchMerch) {
			for (let i = 0; i < database.researchMerch.length; i++) {
				if (database.researchMerch[i].account === user.id) {
					post.push("Greetings, " + user.name + "! Welcome to the Scribe Shop!\n\nCurrent Balance: " + database.researchMerch[i].bal + "\nTotal Earned Over Time: " + database.researchMerch[i].totalEarned + "\n" + line + "\n");
					accFound = true;
					break;
				}
			}
		}
		if (!accFound) {
			post.push("Greetings, " + user.name + "! It seems that you don't have an account with us yet! Feel free to ask our staff about earning Moles (the currency that The Scribe uses in the store!)" + "\n" + line + "\n");
		}

		for (let i = 0; i < shopMerch.length; i++) {
			post.push("[" + i + "] " + shopMerch[i][0] + "\nPrice: " + shopMerch[i][2] + " Moles\nDescription: " + shopMerch[i][1] + "\nUsage: " + Config.commandCharacter + "buy " + shopMerch[i][4] + "\nApplicable Room(s): " + shopMerch[i][5] + "\n");
		}

		post.push("\n\n\n" + line + "\nWe here at the Scribe Shop reserve the right to deny a user their purchase or demand that their request be altered on a case-by-case basis");

		Tools.uploadToHastebin(post.join('\n'), /**@param {string} link*/ link => this.say(text + "Research Warehouse! " + link));
	},
	// Buy stuff. .-.
	buy: function (target, room, user) {
		let text = room instanceof Users.User || user.hasRank(room, '+') ? '' : '/pm ' + user.name + ', ';
		if (!database.researchMerch) return this.say(text + "The Scribe Shop does not exist! Perhaps funds should be given out first before trying to view a non-existent currency, hmm?");
		let targets = target.split(',');
		let item = Tools.toId(targets[0]);
		if (!item) return this.say(text + "Please provide the name or number of the item you wish to buy. Thank you. c:");
		let amount = 0;
		if (targets[1]) {
			amount = parseInt(targets[1]);
			if (amount === 0) return this.say(text + "Buying '0' of something is a waste of time!");
			if (isNaN(amount)) return this.say(text + "The second argument must be a number! It's to specify the amount of the first argument you want to buy! Example: " + Config.commandCharacter + "buy Cookie, 50");
		}
		let account;
		for (let i = 0; i < database.researchMerch.length; i++) {
			if (database.researchMerch[i].account === user.id) {
				if (database.researchMerch[i].bal <= 0) return this.say(text + "You don't exactly have any money to spend, do you?");
				account = database.researchMerch[i];
			}
		}
		if (!account) return this.say(text + "An account under your name does not exist! :o Perhaps you were never given any funds in the first place? Or perhaps you're just trying out the command after seeing someone else use it? Either way, use " + Config.commandCharacter + "shop to learn more!");

		let numBr = 0;

		//If the user specified a number instead of the actual name, substitute out the number of the item for the name of it.
		let itemNumber = parseInt(item);
		if (!isNaN(itemNumber)) {
			// @ts-ignore
			if (shopMerch[itemNumber]) item = shopMerch[itemNumber][0];
		}

		switch (item) {
		case "cookie": {
			//Locating the item in the shop, as it's ordered by price and I'd rather not have to go through and change these every time we add something. c:
			for (let j = 0; j < shopMerch.length; j++) {
				if (shopMerch[j][0] === "Cookie") {
					numBr = j;
					break;
				}
			}
			// @ts-ignore
			let price = shopMerch[numBr][3] * amount;
			if (account.bal < price) {
				if (amount === 1) {
					return this.say(text + "You can't afford to buy a Cookie! You must be very sad. :c");
				} else {
					return this.say(text + "You can't afford " + amount + " Cookies. You must be extremely sad. :c");
				}
			}
			account.bal -= price;
			if (!account.cookies) {
				account.cookies = 0;
			}
			account.cookies += Number(amount);
			this.say(text + "Cookie (x" + amount + ") bought!");
			break;
		}
		/* Formatting for item
		case "[item]":
			if (amount > 1) return this.say(text + "Sorry, but you can only buy one [item] at a time.");
			this.say(text + "Sorry, but this is disabled for now until we can get some more [item]s. Come back later! You have not been charged for this.");
			/ *
			for (let j = 0; j < shopMerch.length; j++) {
				if (shopMerch[j][0] === "Inspirational Quote") {
					numBr = j;
					break;
				}
			}
			if (account.bal < shopMerch[numBr][3]) return this.say(text + "You can't afford any quotes! You must be very disheartened. :c");
			account.bal -= shopMerch[numBr][3];
			let quote = "Don't let your dreams be dreams! (This is a placeholder. Sorry :c)";
			this.say(text + "Your inspirational quote is: " + quote);
			* /
			break;
			*/
		
	},
	cookies: 'cookie',
	cookie: function (target, room, user) {
		let text = room instanceof Users.User || user.hasRank(room, '+') ? '' : '/pm ' + user.name + ', ';
		if (!database.researchMerch) return this.say(text + "The Scribe Shop does not exist! Perhaps funds should be given out first before trying to view a non-existent currency, hmm?");
		for (let i = 0; i < database.researchMerch.length; i++) {
			if (database.researchMerch[i].account === user.id) {
				if (database.researchMerch[i].cookies) {
					return this.say(text + "You have " + database.researchMerch[i].cookies + " cookies!");
				} else {
					return this.say(text + "You haven't any cookies... Awh.");
				}
			}
		}
		return this.say(text + "Odd... You don't seem to even have an account! :c");
	},
	
	//End of Scribe Shop Commands
	
	groups: function (target, room, user) {
		if (room instanceof Users.User || !user.hasRank(room, '+')) return false;
		if (!database.groups) {
			database.groups = {};
			database.groups.teams = [];
			database.groups.singles = [];
			Storage.exportDatabase('writing');
		}
		if (!target) {
			let listSingles = [];
			let listGroups = [];
			let printSingles = "";
			let printGroups = "";
			if (database.groups.singles.length === 0) {
				printSingles = "Empty!";
			} else {
				for (let i = 0; i < database.groups.singles.length; i++) {
					listSingles.push("Name: " + database.groups.singles[i].name + "\nAdded: " + database.groups.singles[i].added + "\n");
				}
			}
			if (database.groups.teams.length === 0) {
				printGroups = "Empty!";
			} else {
				for (let i = 0; i < database.groups.teams.length; i++) {
					listGroups.push("Leader: " + database.groups.teams[i].leader + "\nOther Members: " + database.groups.teams[i].rest.join(', ') + "\nAdded: " + database.groups.singles[i].added + "\n");
				}
			}
			// Return list of groups...
			printSingles = "List of Solo Entries\n" + listSingles.join("\n" + "---\n");
			printGroups = "List of Team Entries\n" + listGroups.join("\n" + "---\n");
			Tools.uploadToHastebin(printSingles, /**@param {string} link*/ link => {
				if (link.startsWith('Error')) return this.say(link);
				this.say('Solo Entries: ' + link);
			});
			Tools.uploadToHastebin(printGroups, /**@param {string} link*/ link => {
				if (link.startsWith('Error')) return this.say(link);
				this.say('Team Entries: ' + link);
			});
		}
		let args = target.split(', ');
		if (args[0] === "add") {
			if (args.length > 2) {
				// Assume team...
				let groupToAdd = [];
				for (let i = 1; i < args.length; i++) {
					groupToAdd.push(args[i]);
				}
				let leader = groupToAdd[0];
				groupToAdd.shift();
				database.groups.teams.push({"leader": leader, rest:groupToAdd, added: new Date().toString()});
				Storage.exportDatabase('writing');
				return this.say("Added team to groups with " + args[1] + " as the leader.");
			} else {
				database.groups.singles.push({name:args[1], added: new Date().toString()});
				Storage.exportDatabase('writing');
				return this.say("Added " + args[1] + " to Singles group.");
			}
		} else if (args[0] === "remove") {
			if (args.length > 2) {
				if (args[1] === "team") {
					let search = Tools.toId(args[2]);
					for (let i = 0; i < database.groups.teams.length; i++) {
						if (search === Tools.toId(database.groups.teams[i].leader)) {
							database.groups.teams.splice(i, 1);
							Storage.exportDatabase('writing');
							return this.say("Removed Team with leader: " + search);
						}
					}
					return this.say("Cannot find team. Are you sure you're searching for the team leader's name?");
				} else {
					return this.say("When removing a whole team, please only specify the team's leader. Usage: " + Config.commandCharacter + "groups remove, team, [leader's name]");
				}
			} else {
				let search = Tools.toId(args[1]);
				for (let i = 0; i < database.groups.singles.length; i++) {
					if (search === Tools.toId(database.groups.singles[i].name)) {
						database.groups.singles.splice(i, 1);
						Storage.exportDatabase('writing');
						return this.say("Removed " + search + " from groups.");
					}
				}
				return this.say("Cannot find user " + search + ". Are you sure you're spelling their name correctly?");
			}
		} else if (args[0] === "clear") {
			if (args[1] === "singles") {
				database.groups.singles = [];
				Storage.exportDatabase('writing');
				return this.say("Cleared Singles");
			} else if (args[1] === "teams") {
				database.groups.teams = [];
				Storage.exportDatabase('writing');
				return this.say("Cleared Teams");
			} else if (args[1] === "all") {
				database.groups.singles = [];
				database.groups.teams = [];
				Storage.exportDatabase('writing');
				return this.say("Cleared ALL Users");
			}
		}
	},
};

exports.commands = commands;
