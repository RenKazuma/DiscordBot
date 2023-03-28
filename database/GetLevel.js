const sqlite = require('sqlite-sync');
const {openDatabase: open, closeDatabase:close} = require('./DatabaseConnection');

function getLevel(){
open();
// Run the SQL statement to select all level
const result = sqlite.run("SELECT * FROM Level");
close();

return result;
}

function getLevelRange(level){
    open();
    const query = sqlite.run(`SELECT startAt, endAt FROM Level WHERE LevelId LIKE ` + level);
console.log(sqlite.run(`SELECT startAt, endAt FROM Level WHERE LevelId LIKE ` + level))
    if (query.length > 0) {
        return {startAt: query[0]['startAt'], endAt: query[0]['endAt']};
    } else {
        return null;
    }    
}

module.exports = {
    getLevel: getLevel,
    getLevelRange: getLevelRange
};