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

  /**
   * Retrieve the connector
   */
  getConnector(): ConnectorInterface {
    return Manager.connector;
  }

  /**
   * Set the connector
   * @param connector
   */
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

  /**
   * Resets the connection and the worker
   */
  reset() {
    Manager.connector = null;
    Manager.worker = null;
  }

  /**
   * Set configuration
   * @param configuration
   */
  setConfiguration(configuration: ConfigurationInterface): ManagerInterface {
    this.configuration = configuration;

    Configuration.merge(this.configuration);

    return this;
  }

  /**
   * Get configuration
   */
  getConfiguration(): ConfigurationInterface {
    return this.configuration;
  }

  /**
   * Returns the current adapter
   */
  getAdapter(): string {
    return this.currentAdapter;
  }

  /**
   * Add an obect to the queue for save
   * @param entityInstance
   */
  persist(entityInstance: EntityInterface): ManagerInterface {

    Manager.worker.addTask(entityInstance, 'persist');

    return this;
  }

  /**
   * Add an obect to the queue for update
   * @param entityInstance
   */
  merge(entityInstance: EntityInterface): ManagerInterface {

    Manager.worker.addTask(entityInstance, 'merge');

    return this;
  }

  /**
   * Add an obect to the queue for remove
   * @param entityInstance
   */
  remove(entityInstance: EntityInterface): ManagerInterface {

    Manager.worker.addTask(entityInstance, 'remove');

    return this;
  }

  /**
   * Add to the queue a request to remove a whole table
   * @param constructorObject
   */
  removeAll(constructorObject: Type<any>): ManagerInterface {
    const entityInstance = new constructorObject();

    Manager.worker.addTask(entityInstance, 'removeAll');

    return this;
  }

  /**
   * Asynchrone flush. Executes all the operations saved into the queue
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

            // when promises are handled, then reset the queue
            Promise.all(realPromises).then(values => {
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
