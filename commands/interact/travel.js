const { SlashCommandBuilder, InteractionResponse } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('travel')
        .setDescription('Get Travel Time')
        .addStringOption(option => 
            option.setName('targetid')
        .setDescription('Target Id')
        .setRequired(true)) 
        ,
        
    async execute(interaction) {
        interaction.reply('Added Channel to alert list');
    },
};
