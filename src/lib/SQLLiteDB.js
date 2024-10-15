import * as SQLite from 'expo-sqlite';
import ArrayList from './ArrayList';

let db;
class SQLiteDB {

  static DB = this.open('oneportal.db');

  static open(DataBase) {
    db = SQLite.openDatabase(DataBase);
    return db;
  }

  static async runQuery(dbInstance, query, values) {
    try {
      if (query) {
        let returnValue;
        let valueList = values && values.length > 0 ? values : [];
        await new Promise((resolve, reject) => {
          dbInstance.exec([{ sql: query, args: valueList }], false, (error, result) => {
            if (result) {
              resolve();
              if (ArrayList.isNotEmpty(result) && result[0]) {
                if (result[0].insertId > 0) {
                  returnValue = result[0].insertId
                } else {
                  returnValue = result[0].rows;
                }
              }
            }
            if (error) {
              console.log("Error Execting the Query: ", error);
              reject();
            }
          });
        });
        return returnValue;
      }
    } catch (err) {
      console.log(err);
    }
  };

}


export default SQLiteDB;