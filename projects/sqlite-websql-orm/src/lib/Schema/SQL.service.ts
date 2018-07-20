import { Injectable } from '@angular/core';
import { EntityInterface } from '../Entity/EntityInterface.interface';
import { DeleteOption, UpdateOption, SelectOption } from './SQLQueriesInterfaces';
import { RepositoryStore } from 'sqlite-websql-orm/public_api';
import { EntityStore } from '../Store/EntityStore.service';

@Injectable()
export class SQLFactory {

    /**
     * @property lastQuery The last query done on the server
     */
    private lastQuery: string;

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
    getCreateTableSql(options: any): string {
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

        return this.lastQuery = sql;
    }


    getSelectSql(classname: string, options: SelectOption): string {
        let sql = 'SELECT ';

        // fields
        if (options.fields) {
            sql += options.fields;
        } else {
            sql += '*';
        }

        sql += ' FROM ' + classname;

        // Add the WHERE clause if conditions exist
        sql += this.buildSqlWhereClause(options.conditions);

        // TODO: Add order
        if (options.order) {
            sql += ' ORDER BY ' + options.order;
        }

        // TODO: add limit
        if (options.limit) {
            sql += ' LIMIT ' + options.limit;
        }

        // TODO: add joins

        // TODO: ...

        return this.lastQuery = sql;
    }

    getInsertSql(classname: string, object: EntityInterface): string {
        let sql: string = 'INSERT INTO ' + classname;

        const schema = EntityStore.getTableSchema(classname);

        const fieldsArray: Array<string> = [];
        const valuesArray: Array<string> = [];

        for ( const key in schema ) {
          if (key) {
            const field = schema[key].name;
            fieldsArray.push(field);
            valuesArray.push(object[field]);
          }
        }

        if (fieldsArray.length > 0) {
          sql += ' (' + fieldsArray.join(', ')  + ') ' ;
          sql += ' VALUES (' + valuesArray.map(item => this.valueCorrect(item)).join(', ')  + ')' ;
        }
        return this.lastQuery = sql;
    }

    getUpdateSql(classname: string, options: UpdateOption): string {
        // Add the SET clause
        let sql: string = 'UPDATE ' + classname;

        // Don't update if we have no SET field
        options.affectations = options.affectations || [];
        if (options.affectations.length === 0) {
            throw new Error('Update requires a list of affectations');
        }

        const affectationsArray: Array<string> = [];
            for ( const affectation in options.affectations ) {
                if (affectation) {
                    affectationsArray.push(options.affectations[affectation]);
                }
            }

        if (affectationsArray.length > 0) {

            sql += ' SET ' + affectationsArray.join(', ') ;
        }

        // Add the WHERE clause if conditions exist
        sql += this.buildSqlWhereClause(options.conditions);

        return this.lastQuery = sql;
    }

    getDeleteSql(classname: string, entity?: EntityInterface): string {

        const options: DeleteOption = entity ? {
            conditions: ['id = ' + entity.id]
        } : {};

        let sql = 'DELETE ';

        sql += ' FROM ' + classname;
        // Add the WHERE clause if conditions exist
        sql += this.buildSqlWhereClause(options.conditions);

        return this.lastQuery = sql;
    }

    /**
    * TODO: improve by Alexis
    */
    private valueCorrect(value: any) {

        if (value === null || value === undefined) {
            return 'NULL';
        }

        if (typeof(value) === 'boolean') {
            return value ? 1 : 0;
        }

        if (value.constructor) {
            if (value.constructor.name.toLowerCase() === 'date') {
                return '"' + value.getMilliseconds() + '"';
            }
        }

        let correctValue: any = parseFloat(value);
        if ( isNaN(correctValue) ) {
            correctValue = '"' + value + '"';
        }

        return correctValue;
    }

    /**
     * Build the 'WHERE' clause into the SQL request
     * @param conditions
     */
    buildSqlWhereClause(conditions: Array<string> = []): string {
        let sql = '';

        if (conditions.length > 0) {
            const conditionsArray: Array<string> = [];
            for ( const condition in conditions ) {
                if (condition) {
                    conditionsArray.push(conditions[condition]);
                }
            }

            if (conditionsArray.length > 0) {
                sql += ' WHERE ' + conditionsArray.join(' AND ') ;
            }
        }

        return sql;
    }
}
