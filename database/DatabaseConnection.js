const sqlite = require('sqlite-sync');
const path = require('path');

require('dotenv').config();

function openDatabase(){
    const dbPath = path.join(__dirname, process.env.Database);
    sqlite.connect(dbPath);
}

function closeDatabase(){
    sqlite.close();
}
async function updateValues(updates, table, where){
    openDatabase();
    try {
        let query = 'UPDATE ' + table + ' SET ';
        let setValues = [];
        for (const [key, value] of Object.entries(updates)) {
            setValues.push(`${key} = '${value}'`);
        }
        query += setValues.join(', ') + ' WHERE ' + where;
        sqlite.run(query);
        closeDatabase();
        console.log(`Updated ${setValues} in table ${table} where ${where}`);
    } catch(error){
        console.log(`Error updating values in ${table}: ${error.message}`)
    }
}


async function insertIntoValue(columns, table, values){
    openDatabase();
    try{
        await sqlite.run('INSERT INTO ' + table + ' (' + columns + ') VALUES (' + values + ')');
        closeDatabase();
        console.log(`Inserted ${values} into ${columns} at table ${table}`);
    } catch(error){
        console.log(`Error inserting ${values} in ${table}, ${columns}: ${error.message}`)
    }
}
module.exports = {
    openDatabase: openDatabase,
    closeDatabase: closeDatabase,
    updateValues: updateValues,
    insertIntoValue: insertIntoValue
}