const {openDatabase: open, closeDatabase:close, openDatabase} = require('./DatabaseConnection');
const sqlite = require('sqlite-sync');
require('dotenv').config();

async function getUserId(guildId, userId){
    const { client } = require('../index');
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);

    return member;
}

async function getDisplayName(userId) {
    try {
      const { client } = require('../index');
      const user = await client.users.fetch(`${userId}`);
      return `${user.username}#${user.discriminator}`;
    } catch (error) {
      console.error(error);
    }
  }
  

function getUserLevel(userId){
    open();

    const objectArray = sqlite.run(`SELECT Current_Level FROM User WHERE DiscordId Like ` + userId);
    if (objectArray.length > 0) {
        const currentLevel = objectArray[0]['Current_Level'];
        close();
        return currentLevel;
    } else {
        // handle case where no results were found
        close();
        return null;
    }
}

function getUserExperience(userId){
    open();
    const objectArray = sqlite.run(`SELECT Current_Exp FROM User WHERE DiscordId Like ` + userId)
    if (objectArray.length > 0) {
        const currentExp = objectArray[0]['Current_Exp'];
        close();
        return currentExp;
    } else {
        // handle case where no results were found
        close();
        return null;
    }
}

function getLeaderboard(){
    open();
    const objectArray = sqlite.run(`SELECT Current_Level, DiscordId FROM User ORDER BY Current_Exp DESC LIMIT 10`);
    close();
    if(objectArray.length > 0){
        return objectArray;
    } else  {
        return null;
    }  
}

module.exports = {
    getUserLevel: getUserLevel,
    getUserExperience: getUserExperience,
    getUserId: getUserId,
    getLeaderboard: getLeaderboard,
    getDisplayName: getDisplayName
}