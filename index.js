require('dotenv').config();
const token = process.env.Token;
const prefix = "L!";
const getUserInformation = require('./database/GetUserInformation');
const databaseActions = require('./database/DatabaseConnection');
require("./deploy-commands");

const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("⚪ Ich bin online!");
  client.user.setPresence({
    activities: [{ name: "how to create a discord bot", type: "Playing" }],
    status: "idle",
  });

  console.log("💖 Status umgestellt");

  const GetLevelJs = require('./database/GetLevel.js');
  GetLevelJs.getLevel();

  //client.channels.fetch('438364905830219817').then(channel => {
  //channel.send("My Message");
  //});

  //client.users.fetch('261136853845934093').then(user => {
  //user.send("This is a test message. PS: I love you");
  //})
});

client.on("messageCreate", async function (message) {
  if (message.author.bot || message.channel.type != 0) {
    return;
  }

  //Give User Exp

  var userId = message.author.id;
  var currentUserLevel = await getUserInformation.getUserLevel(userId);
  var currentUserExp = await getUserInformation.getUserExperience(userId);
  var getExp = await require('./methods/Exp').getLevelExpierence();

  if(!currentUserExp){
    try{
    databaseActions.insertIntoValue('Current_Level, Current_Exp, DiscordId', 'User', ('1,' + getExp + ', ' + userId));
    } catch(error){
      throw(error);
    }
    return;
  }

  try {
    console.log(` <@${userId}> is Level ${currentUserLevel} with ${currentUserExp} Exp and gets ${getExp} Expierence`);

    const {startAt : startAt, endAt: endAt } = require('./database/GetLevel').getLevelRange(currentUserLevel);
    if(currentUserExp > endAt){

      const updates = {
        Current_Level: parseInt(currentUserLevel) + 1,
        Current_Exp: parseInt(currentUserExp) + parseInt(getExp),
      };
      await databaseActions.updateValues(updates, 'User', 'DiscordId = ' + userId);

      return;
    }

    const updates = {
      Current_Exp: parseInt(currentUserExp) + parseInt(getExp)
    }

    await databaseActions.updateValues(updates, 'User', 'DiscordId = ' + userId);
  } catch (error) {
    throw error;
  }
});

const deploy = require("./deploy-commands");
deploy.Intizialecommands(client, token);

//If slash command execute slash command
client.on(Events.InteractionCreate, async (interaction) => {
  console.log(
    `${interaction.commandName} was called by ${interaction.user.name} in ${interaction.guild.name}, ${interaction.channel.name}`
  );

  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  if (interaction.deferred || interaction.replied) {
    return;
  }

  try {
    await command.execute(interaction);
    return;
  } catch (error) {
    console.error(error);

    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
    return;
  }
})

console.log('Level verändert //was soll die msg bringen?')
client.login(token);

module.exports = { 
  client: client
};
