const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with Pong! Test'),

    async execute(interaction) {
      console.log(interaction);
      await interaction.reply('Pong! basic');
    },
  };

console.log("🧶 Ping Command initialisiert!");