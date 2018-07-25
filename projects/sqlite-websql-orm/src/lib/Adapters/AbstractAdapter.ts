
export const ADAPTERS = {
    sqlite: 'sqlite',
    websql: 'websql',
    auto: 'auto'
};

export abstract class AbstractAdapter {

    // 1. SQLite

    // addTransaction
    // transaction(fn): Promise
    // readTransaction(fn): Promise
    // startNextTransaction()
    // open(): Promise
    // close(): Promise
    // executeSql()
    // sqlBatch(sqlStatements): Promise
    // abortallPendingTransactions()

    // 2. WebSql

    // transaction(callback: SQLTransactionCallback, errorCallback?: SQLTransactionErrorCallback, successCallback?:SQLVoidCallback);
    // readTransaction(callback: SQLTransactionCallback, errorCallback?: SQLTransactionErrorCallback, successCallback?:SQLVoidCallback);
    // ...
    // executeSql(sqlStatement, arguments, callback, errorCallback)
    // ---> tx, resultSet

    // static db = null;

    // constructor(configuration: any) {
    //     //
    // }

    // getDb() {
    //     throw new Error('CustomSQLiteObject.getDb is a method of an abstract class');
    // }

    // /**
    //  * Execute SQL on the opened database. Note, you must call `create` first, and
    //  * ensure it resolved and successfully opened the database.
    //  */
    // executeSql(statement: string, params: any ): Promise<any> {
    //     throw new Error('CustomSQLiteObject.getDb is a method of an abstract class');
    // }

    // transaction(callback) {
    //     throw new Error('CustomSQLiteObject.getDb is a method of an abstract class');
    // }
}
