const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const getUserInformation = require('../database/GetUserInformation');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('Displays the Top 10 User'),

    async execute(interaction) {

        var leaderboardEmbed = new EmbedBuilder()
        .setTitle('🏆 Leaderboard')
        .setColor('#ff9900')
        .setThumbnail('https://i.imgur.com/RnATZDl.png')
        .setTimestamp();
  
      const leaderboardData = getUserInformation.getLeaderboard();
      
      if (leaderboardData) {
        for(var i = 0; i < leaderboardData.length; i++){
            var displayName = await getUserInformation.getDisplayName(leaderboardData[i]['DiscordId']);
                leaderboardEmbed.addFields([  
                {   
                    name: `Hi`,    
                    value: `#${i + 1} ${displayName}, Level: ${leaderboardData[i]['Current_Level']}`
                }
            ]);
        } 
    } else {
        leaderboardEmbed.setDescription('No data found.');
      }
  
      await interaction.reply({ embeds: [leaderboardEmbed] });
    },
  };

console.log("🏆 Leaderboard Command initialisiert!");