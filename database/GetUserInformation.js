const {openDatabase: open, closeDatabase:close, openDatabase} = require('./DatabaseConnection');
const sqlite = require('sqlite-sync');
require('dotenv').config();
const http = require('http');

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

    const apiUrl = process.env.Api +  'User/Current_Level';
    const urlWithQuery = apiUrl + `?userId=${userId}`;
    http.get(urlWithQuery, (response) => {
        let data = '';
      
        // Receive data in chunks
        response.on('data', (chunk) => {
          data += chunk;
        });
      
        // When all data has been received
        response.on('end', () => {
          // Parse the received JSON data
          const userData = JSON.parse(data);

          return userData.current_Level;
        });
      }).on('error', (error) => {
        console.error(error);
      });
 
}

async function getUserLevelAndExperience(userId) {
  return await new Promise((resolve, reject) => {
    const apiUrl = process.env.Api +  'User/Current_Level_And_Exp';
    const urlWithQuery = apiUrl + `?userId=${userId}`;;
    http.get(urlWithQuery, (response) => {
      let data = '';

      // Receive data in chunks
      response.on('data', (chunk) => {
        data += chunk;
      });

      // When all data has been received
      response.on('end', () => {
        // Parse the received JSON data
        const userData = JSON.parse(data);

        resolve(userData);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
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
    getUserLevelAndExperience: getUserLevelAndExperience,
    getUserId: getUserId,
    getLeaderboard: getLeaderboard,
    getDisplayName: getDisplayName
}