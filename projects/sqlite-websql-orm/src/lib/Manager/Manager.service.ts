import { ConnectionError } from './../Errors';
import { Injectable, Type, Injector } from '@angular/core';

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
// import { SQLite } from '@ionic-native/sqlite';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { Observable, of, throwError, from, forkJoin } from 'rxjs';
import { catchError, tap, switchMap, map } from 'rxjs/operators';
import { Notifier } from '../Notification/Notifier';
import { ObjectRepositoryInterface } from '../Repository/ObjectRepositoryInterface';

/**
 * @dynamic
 */
@Injectable({
  providedIn: 'root',
})
export class Manager implements ManagerInterface {
  constructor(private sqlite: SQLite, private notifier: Notifier) {
    Manager.worker = Manager.worker || new SwoWorker();
  }

  static injector: Injector;
  static connector: ConnectorInterface;
  static worker: SwoWorker;

  protected _connector: ConnectorInterface;
  protected configuration: ConfigurationInterface;
  protected currentAdapter: string;

  /**
   * Retrieve the connector
   */
  getConnector(): ConnectorInterface {
    // return Manager.connector;
    return this._connector;
  }

  /**
   * Set the connector
   */
  setConnector(connector: ConnectorInterface) {
    // Manager.connector = connector;
    this._connector = connector;
    this.notifier.notifyConnectorChanged();
  }

  /**
   * Singleton factory method for connection object generation
   */
  getConnection(): Observable<any> {
    const connection = this.getConnector() != null ? this.getConnector().connection : null;
    return connection != null ? of(connection) : this.connect();
  }

  /**
   * Sets and returns the connection handler following the user configuration
   */
  connect(): Observable<any> {
    const adapter = this.getConfiguration().options.adapter;

    switch (adapter) {
      case ADAPTERS.sqlite: {
        return this.sqliteConnect();
      }
      case ADAPTERS.websql: {
        return this.webSqlConnect();
      }
      case ADAPTERS.auto: {
        return this.autoConnect();
      }
      default: {
        return throwError(
          new AdapterError('Adapter % was not found'.replace('%', adapter))
        );
      }
    }
  }

  private webSqlConnect() {
    return WebSqlConnector.load(this).pipe(
      switchMap((connector: ConnectorInterface) => {
        this.setConnector(connector);
        this.currentAdapter = ADAPTERS.websql;
        return of(this.getConnector().connection);
      }),
      catchError(error => {
        throw new ConnectionError(error.message);
      })
    );
  }

  private sqliteConnect() {
    // Manager.connector = await SQLiteConnector.load(this, this.sqlite);
    // this.currentAdapter = ADAPTERS.sqlite;
    // return this.getConnector().connection;
    // this.setConnector();
    return throwError(
      new ConnectionError('Adapter sqlite is not implemented yet')
    );
  }

  private autoConnect() {
    return this.sqliteConnect().pipe(
      catchError(error => {
        return this.webSqlConnect();
      })
    );
  }

  /**
   * Resets the connection and the worker
   */
  reset() {
    this.setConnector(null);
    Manager.worker = null;
  }

  /**
   * Set configuration
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
   */
  persist(entityInstance: EntityInterface): ManagerInterface {
    Manager.worker.addTask(entityInstance, 'persist');
    return this;
  }

  /**
   * Add an obect to the queue for update
   */
  merge(entityInstance: EntityInterface): ManagerInterface {
    Manager.worker.addTask(entityInstance, 'merge');
    return this;
  }

  /**
   * Add an obect to the queue for remove
   */
  remove(entityInstance: EntityInterface): ManagerInterface {
    Manager.worker.addTask(entityInstance, 'remove');
    return this;
  }

  /**
   * Add to the queue a request to remove a whole table
   */
  removeAll(constructorObject: Type<any>): ManagerInterface {
    const entityInstance = new constructorObject();
    Manager.worker.addTask(entityInstance, 'removeAll');
    return this;
  }

  /**
   * Returns the right repository
   *
   * @param entityType a element that will help to guess the right repository
   * Usage:
   *
   * console.log('GET', this.manager.getRepository(User));
   * console.log('GET', this.manager.getRepository(new User()));
   * console.log('GET', this.manager.getRepository('User' as any));
   */
  getRepository(entityType: string | Type<EntityInterface> | EntityInterface): ObjectRepositoryInterface | RepositoryInterface {
    // get entity name
    let entityName = null;
    switch (true) {
      case typeof entityType === 'string': entityName = entityType; break;
      case typeof entityType === 'object': entityName = entityType.constructor.name; break;
      case typeof entityType === 'function': entityName = (entityType as Type<EntityInterface>).name; break;
    }
    // check repository classname existence
    if (Object.keys(RepositoryStore.store).find(item => item === entityName) == null) {
      throw new ManagerError(
        'No repository found for the entity \'' + entityName + '\''
      );
    }
    return Manager.injector.get<ObjectRepositoryInterface | RepositoryInterface>(
      RepositoryStore.getRepositoryConstructor(entityName)
    );
  }

  /**
   * Converts tasks of the current queue into a list of observables
   * @param transactionObject the database trasaction object
   */
  private getObservablesTasks(currentTaskQueue: TaskInterface[], transactionObject: any) {
    const actionsAsObservables = []; // : Observable<object>[] = [];
    currentTaskQueue.forEach(async (action: TaskInterface) => {
      // instantiate repository
      const repositoryInstance: RepositoryInterface = this.getRepository(action.entity) as RepositoryInterface;
      switch (action.type) {
        case 'persist':
          actionsAsObservables.push({
            observable: repositoryInstance.insert(action.entity, {
              hash: action.hash,
              transactionObject,
            }),
          });
          break;
        case 'merge':
          actionsAsObservables.push({
            observable: repositoryInstance.update(action.entity, {
              affectations: null,
              transactionObject,
            }),
          });
          break;
        case 'remove':
          actionsAsObservables.push({
            observable: repositoryInstance.delete(action.entity, {
              transactionObject,
            }),
          });
          break;
        case 'removeAll':
          actionsAsObservables.push({
            observable: repositoryInstance.delete(null, {
              transactionObject,
            }),
          });
          break;
        default:
          break;
      }
    });
    return actionsAsObservables;
  }

  /**
   * Asynchrone flush. Executes all the operations saved into the queue
   *
   * Usage:
   * this.manager.flush()
   */
  flush(entityInstance?: EntityInterface): Observable<any> {
    // persist the entity if it's not persisted
    if (entityInstance != null && !Manager.worker.isScheduled(entityInstance)) {
      this.persist(entityInstance);
    }
    // get the list of tasks
    const currentTaskQueue = Manager.worker.getCurrentQueue();
    // ignore if the queue is empty
    if (currentTaskQueue.length === 0) {
      return of();
    }
    // reset only the current hash
    const taskSetId = Manager.worker.getCurrentTaskSetId();
    Manager.worker.setCurrentTaskSetId('');

    return new Observable(observer => {
      this.getConnector().connection.transaction(async transactionObject => {
        // get real observable objects
        const realObservables = this
          .getObservablesTasks(currentTaskQueue, transactionObject)
          .map(q => q.observable);
        // subscribe to execute tasks
        forkJoin(realObservables)
          .subscribe(
            responses => {
              Manager.worker.resetQueue(taskSetId);
              observer.next(responses);
              observer.complete();
            },
            error => {
              Manager.worker.resetQueue(taskSetId);
              observer.error(error);
            }
          );
      });
    });
  }

  /**
   * Synchrone version of flush.
   * Usage:
   * try {
   *   await this.manager.asyncFlush()
   * } catch(e) {
   *   // handle error
   * }
   */
  async asyncFlush(entityInstance?: EntityInterface): Promise<any> {
    return await this.flush(entityInstance).toPromise();
  }
}
