import { AdapterError } from '../../Errors';

/**
 * @dynamic()
 */
export class WebSQLAdapter {

  constructor(private websqlDatabase: any) {

  }

  /**
   * Execute SQL on the opened database. Note, you must call `create` first, and
   * ensure it resolved and successfully opened the database.
   */
  executeSql(statement: string, params: any): Promise<any> {
    let type = '';
    statement = statement.toLowerCase();

    if (statement.match('insert')) {
      type = 'insert';
    } else if (statement.match('update ')) {
      type = 'update';
    } else if (statement.match('delete ')) {
      type = 'delete';
    } else if (statement.match('select ')) {
      type = 'select';
    } else if (statement.match('create ')) {
      type = 'create';
    } else if (statement.match('alter ')) {
      type = 'alter';
    } else if (statement.match('drop ')) {
      type = 'drop';
    } else {
      throw new AdapterError('Statement not supported on browser');
    }

    return new Promise((resolve, reject) => {
      if (this.websqlDatabase && this.websqlDatabase.transaction) {
        this.websqlDatabase.transaction(tx => {
          tx.executeSql(statement, params, (transaction, results) => {
            resolve(results);
          }, (transaction, results) => {
            reject(results);
          });
        });
      } else {
        reject();
      }
    });
  }

  transaction(callback) {

    return new Promise((resolve, reject) => {
      if (this.websqlDatabase && this.websqlDatabase.transaction) {
        this.websqlDatabase.transaction(tx => {
          resolve(callback(tx));
        });
      } else {
        reject();
      }
    });
  }
}
