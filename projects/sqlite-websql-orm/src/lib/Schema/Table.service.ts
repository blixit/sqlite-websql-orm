import { Injectable } from '@angular/core';

@Injectable()
export class TableFactory {

     /**
    * The function creates a SQL query that creates a table
    * @param options : contains many parameters required for the table creation
    * {
    * fields : object which keys are column names and values are column types. Ex : { name : TEXT, age : INTEGER }
    * schema : ... { name: 'firstname', type: 'TEXT'}
    * erase : boolean to tell if we override the previous table
    * tableName : table name == entity class name
    * }
    */
    createTable(options: any): string {
        let sql = 'CREATE TABLE';

        if ( ! options.erase) {
        sql += ' IF NOT EXISTS ';
        }

        sql += options.tableName;

        const fieldsArray: Array<string> = [];

        for ( const item in options.schema ) {
        if (item) {
            const field = options.schema[item].name;
            const type = options.schema[item].type;
            fieldsArray.push(field + ' ' + type);
        }
        }

        if (fieldsArray.length > 0) {
        sql += '(' + fieldsArray.join(',') + ')';
        }

        return sql;
    }
}
