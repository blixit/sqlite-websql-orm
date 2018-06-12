import { CustomSQLiteObject} from './CustomSQLiteObject';

export class WebSqlObject extends CustomSQLiteObject {
    
    constructor(configuration:any){
        super(configuration);

        if(window['openDatabase']){
            CustomSQLiteObject.db = window['openDatabase'](configuration.options.webname, configuration.options.version, configuration.options.description, configuration.options.maxsize);
        }
    }

    getDb(){
        return CustomSQLiteObject.db;
    }

    /**
     * Execute SQL on the opened database. Note, you must call `create` first, and
     * ensure it resolved and successfully opened the database.
     */
    executeSql(statement: string, params: any ): Promise<any>{
        let type = '';
        statement = statement.toLowerCase();

        if(statement.match('insert')){
            type = 'insert';
        }else if(statement.match('update ')){
            type = 'update';
        }else if(statement.match('delete ')){
            type = 'delete';
        }else if(statement.match('select ')){
            type = 'select';
        }else if(statement.match('create ')){
            type = 'create';
        }else if(statement.match('alter ')){
            type = 'alter';
        }else if(statement.match('drop ')){
            type = 'drop';
        }else{
            throw "[CustomSQLiteObject] Statement not supported on browser";
        }

        return new Promise((resolve, reject) => {
            if(CustomSQLiteObject.db && CustomSQLiteObject.db.transaction){
                CustomSQLiteObject.db.transaction(tx => {
                    tx.executeSql(statement, params, (tx, results) => {
                        resolve(results)
                    })
                })
            }else{
                reject()
            }
        })
    }

    transaction(callback){
        if(CustomSQLiteObject.db && CustomSQLiteObject.db.transaction){
            CustomSQLiteObject.db.transaction(callback);
        }
    }
}