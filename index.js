var player_data = {};
var channelList = [];
var channelIds = [''];

var playerInfo = {};




const countryTimes = {
	"Argentina": 167 * 60000,
	"Canada": 41 * 60000,
	"Cayman Islands": 35 * 60000,
	"China": 242 * 60000,
	"Hawaii": 134 * 60000,
	"Japan": 225 * 60000,
	"Mexico": 26 * 60000,
	"South Africa": 297 * 60000,
	"Switzerland": 175 * 60000,
	"UAE": 271 * 60000,
	"United Kingdom": 159 * 60000,
};

const flightModifier = {
	"standard": 1.0,
	"airstrip": 0.7,
	"private": 0.5,
	"business": 0.3,
};

let factions = [8336, 13784, 27370, 22781, 25874, 14365, 10174, 7835, 14078, 27223, 16282, 8422, 8384, 20747, 8989, 33007, 2013, 7709, 6731, 18569, 8085, 8954, 9100, 27312, 11796, 8520, 8151, 22492, 9032, 9055, 937, 366, 8938, 9036, 8803, 33783, 35507, 8500, 9176, 33241, 14821, 8836, 36891, 14760, 8400, 7049, 10820, 9953, 11428, 5431, 2095, 30085, 1149, 15120, 9201, 12893, 41419, 9412, 7986, 30820, 10610, 10856, 26437, 16040, 6974, 8819, 6924, 22295, 6984, 10818, 14686, 9305, 15222, 21716, 478, 355, 7197, 8076, 25025, 13851, 9517, 21526, 16335, 35776, 10140, 8867, 7282, 17133, 36134, 35423, 8317, 27902, 9357, 9745, 33458, 8537, 8510, 1117, 15046, 7227];



// Require Sequelize
const Sequelize = require('sequelize');
const { request } = require('undici');
const { EmbedBuilder } = require('discord.js');
const fetch = (url) => import('node-fetch').then(({ default: fetch }) => fetch(url));

var apiKeys = [
	// Examples
	"YErIZVXywHE2duBk",
	"T8bdKR4mWsaHeqay"
];
var apiIndex = 0;










const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const { token } = require('./config.json');
const { send } = require('node:process');
const { channel } = require('node:diagnostics_channel');
const { get } = require('node:http');
const { count } = require('node:console');
const { Statement } = require('sqlite3');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async c => {



	console.log(`Ready! Logged in as ${c.user.tag}`);

	for (var channelId of channelIds) {
		await client.channels.fetch(channelId)
			.then(channel => {
				console.log(channel.name);
				channelList.push(channel)

			}
			);
	}

	await checkTravel();


});

// Log in to Discord with your client's token
client.login(token);




client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);
	const { commandName } = interaction;

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {

		if (commandName === 'addapi') {

			await interaction.deferReply({ ephemeral: true });
			var api = interaction.options.getString('api');
			var response = await fetch(`https://api.torn.com/user/?selections=&key=${api}`)
			var responseJ = await response.json();


			if (responseJ.error) {
				await interaction.followUp({ content: responseJ.error.error, ephemeral: true });
				return;
			}



			apiTable.create({
				api: api
			});
			await readApi();


			await interaction.followUp({ content: `Added API Key belonging to ${responseJ.name}`, ephemeral: true });




		}
		else if (commandName === 'travel') {
			await interaction.deferReply();
			let targetId = interaction.options.getString('targetid');

			if (playerInfo[targetId]) {
				if (playerInfo[targetId].timestamp != "") {
					let timestamp = playerInfo[targetId].timestamp;
					let country = getCountry(playerInfo[targetId].description);
					//	console.log("FOUND:: "+country);
					if (country == "Unknown") {

						await interaction.followUp({ content: `${targetId} is travelling to/from ${country}` });
						return;
					}
					//console.log(timestamp + " " +countryTimes[country]);
					let time = parseInt(timestamp);
					let addtionalStandard = parseInt(countryTimes[country] * flightModifier['standard']);
					let addtionalAirstrip = parseInt(countryTimes[country] * flightModifier['airstrip']);
					let addtionalPrivate = parseInt(countryTimes[country] * flightModifier['private']);
					let addtionalBusiness = parseInt(countryTimes[country] * flightModifier['business']);
					//console.log("TIME:: "+time);
					let standard = new Date(time + addtionalStandard).toUTCString();
					let airstrip = new Date(time + addtionalAirstrip).toUTCString();
					let private = new Date(time + addtionalPrivate).toUTCString();
					let business = new Date(time + addtionalBusiness).toUTCString();

					//console.log(standard);

					let embed = new EmbedBuilder().setTitle(`${targetId} is ${playerInfo[targetId].description}`)
						.setURL(`https://www.torn.com/profiles.php?XID=${targetId}`)
						.setDescription(`
					Standard: ${standard}
					Airstrip: ${airstrip}
					Private: ${private}
					Business: ${business}`)
						.setColor(0x800080)
						.setTimestamp();

					await interaction.followUp({ embeds: [embed] });
				}
				else {
					await interaction.followUp({ content: `${targetId} Time not Found!` });
				}
			}
			else {
				await interaction.followUp({ content: `${targetId} Data not Found!` });
			}

		}



	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

function getCountry(desc) {
	//	console.log(desc);
	for (let country in countryTimes) {
		//console.log(country);
		if (desc.includes(country)) {
			return country;
		}
	}
	return "Unknown";
}



async function sendAlert(id, name, lvl, last_action, desc) {
	let embed = new EmbedBuilder().setTitle(`${name} is ${desc}`)
	.setURL(`https://www.torn.com/profiles.php?XID=${id}`)
		.setDescription(`
		Name: ${name} [${id}]
		Link: https://www.torn.com/profiles.php?XID=${id}
		Level: ${lvl}
		Last Action: ${last_action}
		Description: ${desc}`)
		.setColor(0xFF0000)
		.setTimestamp();

	for (var channel of channelList) {
		await channel.send({ embeds: [embed] });
	}


}
function getApiKey() {
	if (apiKeys.length > 0) {
		apiIndex++;
		apiIndex = apiIndex % apiKeys.length;
		return apiKeys[apiIndex];
	}
	return -1;
}

async function initialize() {

}

async function checkTravel() {
	//console.log(playerInfo);
	for (let factionId of factions) {
		let apiKey = getApiKey();
		if (apiKey == -1) {
			console.log("No API Keys");
			return;
		}
		await fetch(`https://api.torn.com/faction/${factionId}?selections=&key=${apiKey}`).then(async response => response.json()).then(async data => {

			if (data.error) {
				console.log(apiKey + " :: " + JSON.stringify(data.error));
				return;
			}
			for (let memberId in data.members) {
				let state = data.members[memberId].status.state;
				let desc = data.members[memberId].status.description;
				let lvl = data.members[memberId].level;
				let last_action = data.members[memberId].last_action.relative;
				let name = data.members[memberId].name;

				if (playerInfo[memberId]) {
					if (state == "Traveling") {
						if (playerInfo[memberId].state == "Traveling") { // if traveling
							if (desc != playerInfo[memberId].description) { // if description changes
								playerInfo[memberId].timestamp = Date.now();
								if (desc.includes("Cayman")) {
									//console.log(memberId + " " + name + " " + lvl + " " + last_action + " " + desc);
									await sendAlert(memberId, name, lvl, last_action, desc);
								}
							}
						}
						else {
							playerInfo[memberId].timestamp = Date.now();
							if (desc.includes("Cayman")) {
								//console.log(memberId + " " + name + " " + lvl + " " + last_action + " " + desc);
								await sendAlert(memberId, name, lvl, last_action, desc);
							}
						}
					}
					else {
						playerInfo[memberId].timestamp = "";


					}
					playerInfo[memberId].state = state;
					playerInfo[memberId].description = desc;

				}
				else {
					playerInfo[memberId] = {
						state: state,
						description: desc,
						timestamp: ""
					};


				}
			}
		});

	}

	setTimeout(checkTravel, 1000);
}

// async function readApi() {
// 	var apiList = await apiTable.findAll({ attributes: ['api'] });
// 	var apiL = apiList.map(t => t.api);

// 	for (var api of apiL) {
// 		if (!apiKeys.includes(api)) {
// 			apiKeys.push(api);
// 		}

// 	}
// }






