import { Injectable           } from '@angular/core';

//SQLite
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

//ORM
import { WebSqlObject         } from '../Adapters/WebSqlObject';
import { ObjectRepository     } from './ObjectRepository.service';
import { RepositoryInterface, UpdateOption, DeleteOption, SelectOption  } from './RepositoryInterface.interface';

import { Manager              } from '../Manager.service';
import { EntityInterface      } from '../Entity/EntityInterface.interface';

import { RepositoryStore      } from '../Store/RepositoryStore.service';
import { EntityStore          } from '../Store/EntityStore.service';


@Injectable()
export class EntityRepository extends ObjectRepository implements RepositoryInterface{

  static repositories = {};

  lastSql : string = '';

  constructor(manager : Manager){
    super(manager);

    this.classToken = RepositoryStore.getClassToken(this.constructor.name);

    this.manager.connect()
    .then((db:any) => {
      EntityRepository.db = db
    })
    .catch(e=> {
      console.log("CONNECTION FAILED", e)
    });
  }

  getSchema() : Array<any>{
    return EntityStore.columnAnnotations[this.classToken.name];
  }

  getJointures() : Array<any>{
    return EntityStore.jointureAnnotations[this.classToken.name];
  }

  mapArrayToObject(array:Array<any>): EntityInterface{
    throw "Not implemented yet";
  }

  // ----------------------------------------------------------------------------------
  // TRANSACTION
  // ----------------------------------------------------------------------------------

  use(transaction:any, customSqliteObject:any): RepositoryInterface{
    //copy the transaction object
    this.currentTransaction = transaction;

    if(Manager.UsingSQLiteDatabase){
      return this;
    }

    //copy the executeSql function
    let instanceOfCustomSQLiteObject = new customSqliteObject(this.manager.getConfiguration());
    this.currentTransaction.executeSql = instanceOfCustomSQLiteObject.executeSql;
    return this;
  }

  forget(){
    this.currentTransaction = null;
    return this;
  }

  private getTransaction(){
    return (this.currentTransaction != null) ? this.currentTransaction : EntityRepository.db;
  }

  // ----------------------------------------------------------------------------------
  // SELECT
  // ----------------------------------------------------------------------------------

  getSelectSql(options: SelectOption) : string{
    let sql: string = 'SELECT ';

    //fields
    if(options.fields){
      sql += options.fields;
    }else{
      sql += "*";
    }

    sql += ' FROM ' + this.classToken.name;

    // Add the WHERE clause if conditions exist
    sql += this.buildSqlWhereClause(options.conditions);

    // TODO: Add order
    if(options.order){
      sql += " ORDER BY "+ options.order;
    }

    // TODO: add limit
    if(options.limit){
      sql += " LIMIT "+ options.limit;
    }

    // TODO: add joins

    // TODO: ...

    return this.lastSql = sql;
  }

  executeSelectJoin(object, joinField, join, item, jointures)  : Promise<EntityInterface[]> {
    return EntityRepository.repositories[join].select({
      conditions: [jointures[join].field + " = '" + item[join] + "'"]
    }).then(data=>{
      object[joinField] = data.length > 0 ? data[0] : null;
      return object;
    }).catch(error=>{
      object[joinField] = null;
    })
  }

  static async mapResultsForSelect(res:any, repository:RepositoryInterface, jointures:Array<any>, manager: Manager) {
    let data:Array<EntityInterface> = [];
    jointures = jointures || [];

    for(let join in jointures){
      if(EntityRepository.repositories[join])
        continue;
      EntityRepository.repositories[join] = RepositoryStore.getRepositoryInstance(jointures[join].class, manager)
    }

    for(var i=0; i<res.rows.length; i++) {
      let item = res.rows.item(i);
      let object:EntityInterface = repository.mapArrayToObject(item);

      for(let join in jointures) {
        let joinField = '__join__' + join;

        try{
          object = await repository.executeSelectJoin (object, joinField, join, item, jointures);
        }catch(e){
          continue;
        }

        //define getter
        object[jointures[join].getter] = () => {
          return object[joinField];
        }
      }

      data.push(object);
    }

    return data;
  }

  select(options: any) : Promise<EntityInterface[]>{
    let sql:string = this.getSelectSql(options);
    let jointures:Array<any> = this.getJointures();

    return new Promise<EntityInterface[]>((resolve,reject) =>{
      //define callbacks
      let successCallback = (resultSet) => {
        // console.log("SELECT", resultSet)
        resolve(EntityRepository.mapResultsForSelect(resultSet.res || resultSet, this, jointures, this.manager));
      };
      let errorCallback = (e)=> {
        // console.log("SELECT FAILED", e)
        reject(e);
      };

      let t = this.getTransaction();

      //distingue le comportement des 2 databases
      if(Manager.UsingSQLiteDatabase){
        t.executeSql(sql, [], (resultSet) => {
          // console.log("SELECT SQL", sql, resultSet)
          successCallback(resultSet);
        }, errorCallback);
      }else{
        t.executeSql(sql, []).then(successCallback).catch(errorCallback);
      }
    })
  }

  // ----------------------------------------------------------------------------------
  // INSERT
  // ----------------------------------------------------------------------------------

  getInsertSql(object: EntityInterface) : string {
    let sql: string = 'INSERT INTO ' + this.classToken.name;

    let schema = this.getSchema();

    let fieldsArray: Array<string> = [];
    let valuesArray: Array<string> = [];

    for ( let key in schema ){
      let field = schema[key].name;
      fieldsArray.push(field);
      valuesArray.push(object[field]);
    }

    if(fieldsArray.length > 0){
      sql += ' (' + fieldsArray.join(", ")  + ') ' ;
      sql += " VALUES (" + valuesArray.map(item => this.valueCorrect(item)).join(", ")  + ")" ;
    }
    return this.lastSql = sql;
  }

  static mapResultsForInsert(res:any, repository:RepositoryInterface, resolve, reject, options:any = {}){
    if(res.insertId && res.rowsAffected > 0){
      repository.find(res.insertId).then(entity=>{
        entity.__hash__ = options.hash || ''
        // console.log("INSERT 2")
        resolve(entity);
      }).catch(error => {
        // console.log("INSERT 2 ++ ", error)
        reject(error)
      })
    }else{
      // console.log("INSERT 3")
      reject({
        message: "mapResultsForInsert failed"
      })
    }
  }

  async insert(object : EntityInterface, options:any = {}) : Promise<EntityInterface>{
    let sql = this.getInsertSql(object); 

    return new Promise<EntityInterface>((resolve, reject) => {

      if(EntityRepository.db){
        let t = this.getTransaction();

        //define callbacks
        let successCallback = (res) => {
          // console.log("INSERT 1", res)
          EntityRepository.mapResultsForInsert(res, this, resolve, reject, options);
        };
        let errorCallback = (e)=> {
          // console.log("INSERT FAILED")
          reject(e);
        };

        //distingue le comportement des 2 databases
        if(Manager.UsingSQLiteDatabase){
          t.executeSql(sql, [], (tx, resultSet) => {
            successCallback(resultSet);
          }, errorCallback);
        }else{
          t.executeSql(sql, []).then(successCallback).catch(errorCallback);
        }
      }else{
        reject({
          message: "Database object not found"
        });
      }
    })
  }


  /**
  * TODO: improve by Alexis
  */
  private valueCorrect(value:any){

    if(value === null || value === undefined){
      return 'NULL';
    }

    if(typeof(value) === "boolean"){
      return value ? 1 : 0;
    }

    if(value.constructor){
      if(value.constructor.name.toLowerCase() === 'date'){
        return "\"" + value.getMilliseconds() + "\"";
      }
    }

    let correctValue: any = parseFloat(value)
    if( isNaN(correctValue) ){
      correctValue = "\""+ value +"\"";
    }
      return correctValue;
  }


  // ----------------------------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------------------------

  getUpdateSql(options: UpdateOption) : string{
    // Add the SET clause
    let sql: string = 'UPDATE ' + this.classToken.name;


    //Don't update if we have no SET field
    options.affectations = options.affectations || [];
    if(options.affectations.length == 0){
      throw "Update requires a list of affectations";
    }


    let affectationsArray: Array<string> = [];
      for ( let affectation in options.affectations ){
        affectationsArray.push(options.affectations[affectation]);
      }

    if(affectationsArray.length > 0){

      sql += ' SET ' + affectationsArray.join(", ") ;
      //sql += ' SET ' + options.affectationsArray.map(item => this.valueCorrect(item)).join(", ");
    }

    // Add the WHERE clause if conditions exist
    sql += this.buildSqlWhereClause(options.conditions);

    return this.lastSql = sql;
  }

  update(options: UpdateOption): Promise<boolean> 
  update(entity: EntityInterface): Promise<boolean> 
  update(arg: any): Promise<boolean> {

    
    let sql: string;

    // arg == entity: EntityInterface
    if (arg.__interfacename__ === 'EntityInterface') {
      let options: UpdateOption = {
        id: arg.id,
        affectations:[],
        conditions:["id = " + arg.id]
      }

      let schema = this.getSchema();

      for(let key in schema){
        let field = schema[key].name;
        options.affectations.push(field + " = " + this.valueCorrect(arg[field]))
      }

      sql = this.getUpdateSql(options);
    } else { // arg == options: UpdateOption
      sql = this.getUpdateSql(arg);
    }

    //Promise
    return new Promise<boolean>((resolve,reject) =>{

      let t = this.getTransaction();

      //define callbacks
      let successCallback = (res) => {
        resolve(true);
      };
      let errorCallback = (e)=> {
        reject(e);
      };

      //distingue le comportement des 2 databases
      if(Manager.UsingSQLiteDatabase){
        t.executeSql(sql, [], (tx, resultSet) => {
          successCallback(resultSet);
        }, errorCallback);
      }else{
        t.executeSql(sql, []).then(successCallback).catch(errorCallback);
      }
    })
  }



  // ----------------------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------------------

  getDeleteSql(entity?: EntityInterface) : string {
    
    const options:DeleteOption = entity ? {
      conditions: ['id = ' + entity.id]
    } : {};

    let sql: string = 'DELETE ';

    sql += ' FROM ' + this.classToken.name;
    // Add the WHERE clause if conditions exist
    sql += this.buildSqlWhereClause(options.conditions);

    return this.lastSql = sql;
  }

  delete(entity?: EntityInterface) : Promise<boolean> {
    let sql = this.getDeleteSql(entity);
    let jointures:Array<any> = this.getJointures();

      return new Promise<boolean>((resolve,reject) =>{
        //define callbacks
        let successCallback = (resultSet) => {
          resolve(true);
        };
        let errorCallback = (e)=> {
          reject(e);
        };

      let t = this.getTransaction();
      //distingue le comportement des 2 databases
      if(Manager.UsingSQLiteDatabase){
        t.executeSql(sql, [], (tx, resultSet) => {
          successCallback(resultSet);
        }, errorCallback);
      }else{
        t.executeSql(sql, []).then(successCallback).catch(errorCallback);
      }
    })
  }


  //Build the 'WHERE' clause into the SQL request
  buildSqlWhereClause(conditions:Array<string> = []): string{
    let sql = '';

    if(conditions.length > 0){
      let conditionsArray: Array<string> = [];
      for ( let condition in conditions ){
        conditionsArray.push(conditions[condition]);
      }
      if(conditionsArray.length > 0){
        sql += ' WHERE ' + conditionsArray.join(" AND ") ;
      }
    }

    return sql;
  }



  // Facade functions

  find(id:number) : Promise<EntityInterface|null> {
    let options = {
      conditions : ['id = ' + id]
    };
    return this.findOneBy(options);
  }

  findBy(options:any) : Promise<EntityInterface[]>{
    return this.select(options);
  }

  findOneBy(options:any) : Promise<EntityInterface|null> {
    return new Promise<EntityInterface>((resolve, reject) => {
      // set limit to get only one element
      options.limit = "0,1";

      this.select(options).then((results:EntityInterface[]) => {

        let data:EntityInterface[] = results as Array<EntityInterface>;
        if(data.length > 0){
          resolve(data[0]);
        }else{
          reject(null);
        }

      }).catch(error => reject(error));
    });
  }

  findAll() : Promise<EntityInterface[]>{
    return this.select({});
  }


}
