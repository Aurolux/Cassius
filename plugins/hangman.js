/**
 * Hangman database
 * Cassius - https://github.com/sirDonovan/Cassius
 *
 * Simple hangman database that allows for adding/deleting hangman words and hints,
 * as well as uploading the contents of the database to a hastebin for room staff.
 *
 * This is a port of Kid A's hangman system, coded by bumbadadabum.
 *
 * @author Mystifi
 * @license MIT
 */

'use strict';

// These are the valid ranks that a Room Owner can set when
// modifying the permissions.
const validRanks = ['+', '%', '@', '#'];

/**
 * Obtains the given room's database. If the hangman database
 * wasn't already initialised, then it is done here.
 * @param {Room | string} room
 * @return {AnyObject}
 */
function getDatabase() {
	let database = Storage.getDatabase("hangman");
	if (!database) database = {};
	if (!database.defaultRank) {
		database.defaultRank = '+';
	}
	return database;
}

/**@type {{[k: string]: Command | string}} */
let commands = {
	hangmanrank: 'setquotesrank',
	sethangmanrank: function (target, room, user) {
		if (!room instanceof Users.User || !user.hasRank(room, '#')) return;
		let database = getDatabase();
		target = target.trim();
		if (!target) return this.say("Users of rank " + database.defaultRank + " and higher can manage room quotes.");
		if (!validRanks.includes(target)) return this.say("Unknown option. Valid ranks: " + validRanks.join(", "));
		database.defaultRank = target;
		Storage.exportDatabase("hangman");
		this.say("Users of rank " + target + " and above can now manage hangmans.");
	},
	addhangman: function (target, room, user) {
		if (room instanceof Users.User) return;
		let database = getDatabase();
		if (!user.hasRank(room, database.defaultRank)) return;
		target = target.trim();
		if (!target) return this.say("Please use the following format: .addhangman solution, hint, category");
		let split = target.split(',');
		let solution = split[0];
		let cat = split[2].trim();
		if (!cat) return this.say("Please include a category.");
		// Copied from the hangman code from PS!:
		// https://github.com/Zarel/Pokemon-Showdown/blob/master/chat-plugins/hangman.js
		solution = solution.replace(/[^A-Za-z '-]/g, '').trim();
		if (solution.replace(/ /g, '').length < 1) return this.say("Please enter a valid word.");
		if (solution.length > 30) return this.say("The solution must be 30 characters or less.");
		if (solution.split(' ').some(w => w.length > 20)) {
			return this.say("Each word in the solution must be 20 characters or less.");
		}
		if (!/[a-zA-Z]/.test(solution)) return this.say("Your word must contain at least one letter.");
		// TODO: Add code for verifying whether or not the user wants to overwrite the word instead of telling them to delete it
		// first.
		solution = solution.split(' ').map((s, i) => {
        if (["a", "an", "the", "of"].includes(s) && i !== 0) {
                return s.toLowerCase();
        } else {
                return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        }
}).join(' ');
		let hint = split.slice(1).join(',').trim();
		if (hint.length > 150) return this.say("Your hint cannot exceed 150 characters. (" + hint.length + "/150)");
		database.hangmans[cat].push({hint: solution}); 
		this.say("Your hangman was successfully added.");
	},
	hangman(target, room, user) {
		if (!user.hasRank(room, databse.defaultRank)) return;
		let cat = target.split(',')[0]; 
		let database = getDatabase();
		let r = Math.floor(Math.random() * Object.keys(database.hangmans).length);
		let hangmanWords = database.hangmans[cat] || database.hangmans[Object.keys(database.hangmans)[r]];
		let randomSolution = Tools.sampleOne(hangmanWords);
		this.say("/hangman new " + Object.keys(randomSolution)[0] + ", " + randomSolution[Object.keys(randomSolution)[0]]);
		this.say("/wall Use ``/guess [word] or [letter]`` to guess.")
	},
	removehangman: function (target, room, user) {
		if (room instanceof Users.User) return;
		let database = getDatabase();
		if (!user.hasRank(room, database.defaultRank)) return;
		target = target.trim();
		if (!target) return this.say("Please use the following format: .removehangman {Hint: Solution}");
		let hangmans = database.hangmans;
		let index = hangmans.findIndex(/**@param {string} hangman */ hangman => Tools.toId(hangman) === Tools.toId(target));
		if (index < 0) return this.say("Your hangman doesn't exist in the database.");
		hangmans.splice(index, 1);
		Storage.exportDatabase();
		this.say("Your hangman was successfully removed.");
	},
};

exports.commands = commands;
