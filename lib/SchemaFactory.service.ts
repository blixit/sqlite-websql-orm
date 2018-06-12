import { Injectable } from '@angular/core';

//SQLite
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

import { Manager              } from './Manager.service';
import { EntityStore          } from './Store/EntityStore.service';
import { RepositoryStore      } from './Store/RepositoryStore.service';

Injectable()
export class SchemaFactory{

    constructor(
        protected manager: Manager
    ){ }

     generateSchema(repositories: Array<any> = []){
        return new Promise(async (resolve, reject) => {
          let db:any;

          try{
            db = await this.manager.connect();
          }catch(e){
            reject(e);
            return;
          }

          let promises:Promise<any>[] = [];
          repositories.forEach((repository) => {

            // let repositoryInstance = new repository(this.manager);

            let classToken = RepositoryStore.getClassToken(repository.name);
            let schema = EntityStore.columnAnnotations[classToken.name]

            let createTableSql:string = this.manager.createTable( {
              tableName: classToken.name, //repositoryInstance.schema.token.name,
              // fields: repositoryInstance.schema.fields,
              schema: schema,
              erase:false
            } );

            // console.log("SQL-CREATE-TABLE : \n", createTableSql)

            promises.push(db.executeSql(createTableSql, []));

            // delete window['repositoryInstance'];
          })

          Promise.all(promises).then(values => {
            // console.log("schema values", values)
            resolve(db);
          }).catch(errors => {
            // console.error('schema errors',errors)
            reject();
          })
        })
    }
}
