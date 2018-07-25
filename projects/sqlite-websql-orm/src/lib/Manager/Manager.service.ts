import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Injectable, Type } from '@angular/core';

import { ManagerInterface, TaskInterface } from './Manager.interface';
import { ConfigurationInterface, Configuration } from '../Configuration';
import { ADAPTERS } from '../Adapters/AbstractAdapter';
import { AdapterError, ManagerError } from '../Errors';
import { SwoWorker } from './Worker';
import { EntityInterface } from '../Entity/EntityInterface.interface';
import { RepositoryStore } from '../Store/RepositoryStore.service';
import { Connector as SQLiteConnector } from '../Adapters/SQLite/Connector';
import { Connector as WebSqlConnector } from '../Adapters/WebSQL/Connector';
import { ConnectorInterface } from '../Adapters/ConnectorInterface';
import { RepositoryInterface } from '../Repository/RepositoryInterface.interface';

/**
 * @dynamic
 */
@Injectable()
export class Manager implements ManagerInterface {

  static connector: ConnectorInterface;

  static worker: SwoWorker;

  protected configuration: ConfigurationInterface;

  protected currentAdapter: string;

  constructor(
    // private sqlite: SQLite
  ) {

    Manager.worker = Manager.worker || new SwoWorker();
  }

  getConnector(): ConnectorInterface {
    return Manager.connector;
  }

  setConnector(connector: ConnectorInterface) {
    Manager.connector = connector;
  }

  /**
   * Sets and returns the connection handler following the user configuration
   */
  async getConnection() {
    if (this.getConnector() && this.getConnector().connection) {
      return this.getConnector().connection;
    }

    const adapter = this.getConfiguration().options.adapter;
    console.log('ADAPTER', adapter);

    switch (adapter) {
      case ADAPTERS.sqlite: {
        Manager.connector = await SQLiteConnector.load(this);
        this.currentAdapter = ADAPTERS.sqlite;
      }
      break;
      case ADAPTERS.websql: {
        Manager.connector = await WebSqlConnector.load(this);
        this.currentAdapter = ADAPTERS.websql;
      }
      break;
      case ADAPTERS.auto: {
        Manager.connector = await this.autoDetectConnection();
      }
      break;
      default:  {
        throw new AdapterError('Adapter % was not found'.replace('%', adapter));
      }
    }

    return this.getConnector().connection;
  }

  /**
   * Get connection handler by guessing adapter
   * @param sqlite
   * @param configuration
   */
  private autoDetectConnection(): Promise<ConnectorInterface> {
    let connectorPromise = null;

    try {
      this.currentAdapter = ADAPTERS.websql;
      return WebSqlConnector.load(this);
    } catch (error) {
      connectorPromise = SQLiteConnector.load(this);
      this.currentAdapter = ADAPTERS.sqlite;
      return connectorPromise;
    }
  }

  reset() {
    Manager.connector = null;
    Manager.worker = null;
  }

  setConfiguration(configuration: ConfigurationInterface): ManagerInterface {
    this.configuration = configuration;

    Configuration.merge(this.configuration);

    return this;
  }

  getConfiguration(): ConfigurationInterface {
    return this.configuration;
  }

  getAdapter(): string {
    return this.currentAdapter;
  }

  persist(entityInstance: EntityInterface): ManagerInterface {

    Manager.worker.addTask(entityInstance, 'persist');

    return this;
  }

  merge(entityInstance: EntityInterface): ManagerInterface {

    Manager.worker.addTask(entityInstance, 'merge');

    return this;
  }

  remove(entityInstance: EntityInterface): ManagerInterface {

    Manager.worker.addTask(entityInstance, 'remove');

    return this;
  }

  removeAll(constructorObject: Type<any>): ManagerInterface {
    const entityInstance = new constructorObject();

    Manager.worker.addTask(entityInstance, 'removeAll');

    return this;
  }

  // private transaction(db, callback) {
  //   switch (db.constructor.name) {
  //     case 'SQLiteObject' :
  //       db.transaction(callback);
  //     break;
  //     case 'WebSQLAdapter' :
  //       db.transaction(callback);
  //     break;
  //     default:
  //       throw new ManagerError('The transaction object used doesn\'t define any method \'transaction\'');
  //   }
  // }


  /**
   * Asynchrone flush
   * @param entityInstance EntityInterface
   */
  async flush(entityInstance: EntityInterface = null) {

    if (entityInstance != null &&  ! Manager.worker.isScheduled(entityInstance)) {
      this.persist(entityInstance);
    }

    const currentTaskQueue = Manager.worker.getCurrentQueue();

    if (currentTaskQueue.length === 0) {
      return ;
    }

    // reset only the current hash
    const taskSetId = Manager.worker.getCurrentTaskSetId();
    Manager.worker.setCurrentTaskSetId('');

    return new Promise((resolve, reject) => {
      this.getConnector().connection.transaction( async (transactionObject) => {
        const promises: any[] = [];

        currentTaskQueue.forEach(async (action: TaskInterface) => {

          // get entity name
          const entityName = action.entity.constructor.name;

          // check repository classname existence
          if ( null == Object.keys(RepositoryStore.store).find(item => item === entityName) ) {
            throw new ManagerError('No repository found for the entity \'' + entityName + '\'');
          }

          // instantiate repository
          const repositoryInstance: RepositoryInterface = RepositoryStore.getRepositoryInstance(entityName, this);

          switch (action.type) {
            case 'persist':
              promises.push({
                promise: repositoryInstance.insert(action.entity, {
                  hash: action.hash,
                  transactionObject: transactionObject
                }),
              });
            break;
            case 'merge':
              promises.push({
                promise: repositoryInstance.update(action.entity, {
                  affectations: null,
                  transactionObject: transactionObject
                }),
              });
            break;
            case 'remove':
              promises.push({
                promise: repositoryInstance.delete(action.entity, {
                  transactionObject: transactionObject
                }),
              });
            break;
            case 'removeAll':
              promises.push({
                promise: repositoryInstance.delete(null, {
                  transactionObject: transactionObject
                }),
              });
            break;
            default: break;
          }

          // repositoryInstance.forget();
        });

        if (promises.length > 0) {

          if (promises.length !== currentTaskQueue.length) {
            Manager.worker.resetQueue(taskSetId) ;
            reject({
              message: 'one transaction failed. For now, we dont know how to solve this issue '
            });
          } else {
            // get real promise objects
            const realPromises = promises.map(q => q.promise);

            Promise.all(realPromises).then(values => {
              values.forEach((value, i) => {
                if (currentTaskQueue[i] == null) {
                  return ;
                }
                switch (currentTaskQueue[i]['type']) {
                  case 'persist':
                  // you have to modify field one by one or you will lose object reference
                    // for (const p in value) {
                    //   if (p) {
                    //     currentTaskQueue[i].entity[p] = value[p];
                    //   }
                    // }
                  break;
                  case 'merge':
                  // you have to modify field one by one or you will lose object reference
                    // for (const p in value) {
                    //   if (p) {
                    //     currentTaskQueue[i].entity[p] = value[p];
                    //   }
                    // }
                  break;
                  case 'remove':
                  // currentTaskQueue[i].entity.id = null;
                  break;
                }
              });
              Manager.worker.resetQueue(taskSetId) ;
              resolve(values);
            }).catch(errors => {
              Manager.worker.resetQueue(taskSetId) ;
              reject(errors);
            });
          }
        } else {
          Manager.worker.resetQueue(taskSetId) ;
          resolve();
        }
      });
    });
  }

}
