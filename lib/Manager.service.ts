import { Injectable, Type           } from '@angular/core';
import { RepositoryStore      } from './Store/RepositoryStore.service';

import { Configuration        } from './Configuration';
//SQLite
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { RepositoryInterface  } from './Repository/RepositoryInterface.interface';
import { WebSqlObject         } from './Adapters/WebSqlObject';
import { EntityInterface      } from './Entity/EntityInterface.interface';
import { ManagerInterface, FlushTransactionObject     } from './Managers/Manager.interface';

Injectable()
export class Manager implements ManagerInterface {

    static db = null;

    static managedEntities : Array<EntityInterface> = [];

    static UsingSQLiteDatabase = false;

    protected configuration: Configuration;

    protected flushTransactions: Map<string, Array<FlushTransactionObject>> = new Map<string, Array<FlushTransactionObject>>() ;
    protected currentFlushHash:string = '' ;

    constructor(
        protected sqlite: SQLite
    ){
    }

    setConfiguration(configuration: Configuration): ManagerInterface {
      this.configuration = configuration;

      return this;
    }

    getConfiguration(): Configuration {
      return this.configuration;
    }

    createConnection(){
      return new Promise((resolve, reject) => {

            this.sqlite.create(this.configuration)
            .then((db: SQLiteObject) => {
                Manager.db = db;
                resolve(db);
            })
            .catch(e => reject(e) );

      });
    }

    async connect(): Promise<any> {
      let db:any = null;

      try{
        db = await this.createConnection() as SQLiteObject;
        // if(Manager.db == null){
        //   console.log("DB renewed", db)
        //   db = await this.createConnection() as SQLiteObject;
        // }else{
        //   console.log("DB reused", db)
        //   db = Manager.db;
        // }
      }catch(e){}


      return new Promise((resolve,reject) =>{
        if(db)  {
          Manager.db = db;
          Manager.UsingSQLiteDatabase = true;
          resolve(db);
        }
        else {
          if(this.configuration.options.useFakeDatabase){
            let customdb = new WebSqlObject(this.configuration);
            Manager.db = customdb.getDb();
            Manager.UsingSQLiteDatabase = false;
            resolve(customdb);
          }else{
            reject({
              message: "Impossible to connect to the browser database"
            })
          }
        };
      })
    }

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
    let sql: string = 'CREATE TABLE';

    if( ! options.erase){
      sql += ' IF NOT EXISTS ';
    }

    sql += options.tableName; //this.classToken.name;

    let fieldsArray: Array<string> = [];

    for ( let item in options.schema ){
      let field = options.schema[item].name;
      let type = options.schema[item].type;
      fieldsArray.push(field + " " + type);
    }

    if(fieldsArray.length > 0){
      sql += '(' + fieldsArray.join(",") + ')';
    }

    return sql;
  }

  //Transactions

  private transaction(db, callback){
    switch(db.constructor.name){
      case "SQLiteObject" :
        db.transaction(callback)
      break;
      case "Database" :
        db.transaction(callback)
      break;
      default:
        throw "[ObjectRepository] The SQLite object doesn't define any method for transaction.";
    }
  }

  //------------------------------------------------------------------------//
  //-------------------------------- Manage transactions--------------------//
  //------------------------------------------------------------------------//

  
  isManaged(entityInstance: EntityInterface): boolean{
    for(let hash in this.flushTransactions){
      if(this.flushTransactions[hash].find(entity => entity == entityInstance) != null){
        return true;
      }
    }

    return false; 
    //this.currentTransaction.find(entity => entity == entityInstance) != null;
  }

  /**
   * 
   * @param toAdd 
   * @param type Ex : persist, merge, remove
   */
  addToTransactions(toAdd:EntityInterface, type:string): ManagerInterface{

    this.flushTransactions[this.currentFlushHash] = this.flushTransactions[this.currentFlushHash] || [];

    this.flushTransactions[this.currentFlushHash].push(<FlushTransactionObject>{
      entity: toAdd,
      type: type
    });

    return this;
  }

  getCurrentFlushTransaction() : Array<FlushTransactionObject>{
    return this.flushTransactions[this.currentFlushHash] || [];
  }

  resetCurrentFlushTransaction(hash: string): ManagerInterface {
    delete this.flushTransactions[hash];
    return this;
  }

  checkHash(): ManagerInterface {
    // console.log("FLUSH Transactions", this.flushTransactions);

    if(this.currentFlushHash.length == 0){
      this.currentFlushHash = this.guid();
    }

    return this;
  }

  persist(entityInstance: EntityInterface): ManagerInterface{
    
    this.checkHash();
    
    if( ! this.isManaged(entityInstance)){
      this.addToTransactions(entityInstance,'persist');
    }

    return this;
  }

  merge(entityInstance: EntityInterface): ManagerInterface {
    
    this.checkHash();

    // if( ! this.isManaged(entityInstance)){
      this.addToTransactions(entityInstance,'merge');
    // }

    return this;
  }

  remove(entityInstance: EntityInterface): ManagerInterface {
    
    this.checkHash();
    
    if( ! this.isManaged(entityInstance)){
      this.addToTransactions(entityInstance,'remove');
    }

    return this;
  }

  removeAll(constructorObject: Type<any>): ManagerInterface {
    const entityInstance = new constructorObject();

    this.checkHash();

    this.addToTransactions(entityInstance,'removeAll');

    return this;
  }

  // /**
  //  * Variante de la fonction flush
  //  * @param entityInstance
  //  */
  // async flushWithSQLQueries(entityInstance:any = null){
    // if(entityInstance != null && this.isManaged(entityInstance)){
    //   console.log("persisting from flush");
    //   this.persist(entityInstance)
    // }

    // let queries:any[] = [];

    // return new Promise((resolve, reject) => {

    //     console.log("reading transactions ... ")
    //     this.getCurrentFlushTransaction().forEach(async action => {

    //       //get entity name
    //       let entityName = action.entity.constructor.name;

    //       //check repository classname existence
    //       if( null == Object.keys(RepositoryStore.repositories).find(item => item == entityName) ){
    //         throw "No repository found for the entity '" + entityName + "'";
    //       }

    //       //instantiate repository
    //       let repositoryName = RepositoryStore.repositories[entityName].repository;
    //       let repositoryClassToken = RepositoryStore.repositoriesSources[repositoryName];

    //       let repositoryInstance = new repositoryClassToken(this);

    //       switch(action.type){
    //         case 'persist': queries.push({
    //           promise: repositoryInstance.insert(action.entity),
    //           type: action.type
    //         });
    //         break;
    //         case 'remove': queries.push({
    //           promise: repositoryInstance.delete({
    //               conditions: ['id = ' + action.entity.id]
    //             }),
    //           type: action.type
    //         });
    //         break;
    //         default: break;
    //       }

    //     })
    //     console.log("transactions executed ... ")

    //     if(queries.length > 0){
    //         // queries.forEach((query)=>{

    //         // })
    //         let promises = queries.map(q => q.promise);
    //         console.log("reading "+ queries.length +" queries ... ", promises)
    //         Promise.all(promises).then(values=>{
    //           console.log("DONE with ... ", values)
    //           resolve(values)
    //         }).catch(errors=>{
    //           console.log("FAILED with ... ", errors)
    //           reject(errors)
    //         });
    //     }

    //     this.resetCurrentFlushTransaction() ;
    //   })
    // })
  // }

  private guid(): string {
    
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  /**
   * Synchrone flush
   * @param entityInstance EntityInterface
   */
  async flush(entityInstance: EntityInterface = null){
    try {
      await this.asyncFlush()
    } catch (errors) {
      throw errors;
    }
  }

  /**
   * Asynchrone flush
   * @param entityInstance EntityInterface 
   */
  async asyncFlush(entityInstance: EntityInterface = null){
    if(entityInstance != null && this.isManaged(entityInstance)){
      this.persist(entityInstance)
    }

    const currentFlushTransaction = this.getCurrentFlushTransaction();
    
    if(currentFlushTransaction.length == 0){
      return ;
    }

    //reset only the current hash
    const hash = this.currentFlushHash;
    this.currentFlushHash = '';

    return new Promise((resolve, reject) => {
      this.transaction(Manager.db, async (transactionObject)=>{

        let promises:any[] = [];

        currentFlushTransaction.forEach(async (action:FlushTransactionObject) => {

          //get entity name
          let entityName = action.entity.constructor.name;

          //check repository classname existence
          if( null == Object.keys(RepositoryStore.repositories).find(item => item == entityName) ){
            throw new Error('No repository found for the entity \'' + entityName + '\'');
          }

          //instantiate repository
          let repositoryName = RepositoryStore.repositories[entityName].repository;
          let repositoryClassToken:Type<any> = RepositoryStore.repositoriesSources[repositoryName];

          // let repositoryInstance:RepositoryInterface = new repositoryClassToken(this);
          let repositoryInstance = new repositoryClassToken(this);

          switch(action.type){
            case 'persist':
              promises.push({
                promise: repositoryInstance.use(transactionObject, WebSqlObject).insert(action.entity, {hash: action.hash}),
              });
            break;
            case 'merge':
              promises.push({
                promise: repositoryInstance.use(transactionObject, WebSqlObject).update(action.entity),
              });
            break;
            case 'remove':
              promises.push({
                promise: repositoryInstance.use(transactionObject, WebSqlObject).delete(action.entity)
            })
            break;
            case 'removeAll':
              promises.push({
                promise: repositoryInstance.use(transactionObject, WebSqlObject).delete()
              })
            break;
            default: break;
          }

          repositoryInstance.forget();
        })

        if(promises.length > 0){

          if(promises.length != currentFlushTransaction.length){
            this.resetCurrentFlushTransaction(hash) ;
            reject({
              message: "one transaction failed. For now, we dont know how to solve this issue "
            })
          }else{
            //get real promise objects
            let realPromises = promises.map(q => q.promise);

            Promise.all(realPromises).then(values=>{
              values.forEach((value, i)=>{
                if(currentFlushTransaction[i] == null)
                  return ;
                switch(currentFlushTransaction[i]['type']){
                  case 'persist':
                  //you have to modify field one by one or you will lose object reference
                    for(let p in value){
                      currentFlushTransaction[i].entity[p] = value[p];
                    }
                  break;
                  case 'merge':
                  //you have to modify field one by one or you will lose object reference
                    for(let p in value){
                      currentFlushTransaction[i].entity[p] = value[p];
                    }
                  break;
                  case 'remove':
                  currentFlushTransaction[i].entity.id = null;
                  break;
                }
              })
              this.resetCurrentFlushTransaction(hash) ;
              resolve(values)
            }).catch(errors=>{
              this.resetCurrentFlushTransaction(hash) ;
              reject(errors)
            });
          }
        }else{
          this.resetCurrentFlushTransaction(hash) ;
          resolve();
        }
      })
    })
  }


}
