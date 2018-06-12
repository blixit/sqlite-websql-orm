
export abstract class CustomSQLiteObject{

    static db = null;

    constructor(configuration:any){
        
    }

    getDb(){
        throw new Error('CustomSQLiteObject.getDb is a method of an abstract class');
    }

    /**
     * Execute SQL on the opened database. Note, you must call `create` first, and
     * ensure it resolved and successfully opened the database.
     */
    executeSql(statement: string, params: any ): Promise<any>{
        throw new Error('CustomSQLiteObject.getDb is a method of an abstract class');
    }

    transaction(callback){
        throw new Error('CustomSQLiteObject.getDb is a method of an abstract class');
    }
}
