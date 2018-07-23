import { Injectable, Type           } from '@angular/core';

// ORM
import { Manager              } from '../Manager/Manager.service';
import { SQLFactory           } from '../Schema/SQL.service';

import { UpdateOption, DeleteOption, SelectOption  } from '../Schema/SQLQueriesInterfaces';

import { EntityInterface      } from '../Entity/EntityInterface.interface';
import { RepositoryInterface  } from '../Repository/RepositoryInterface.interface';

import { RepositoryStore      } from '../Store/RepositoryStore.service';

import { RepositoryError } from '../Errors';
import { ADAPTERS } from '../Adapters/AbstractAdapter';
import { StaticEntityRepository } from './StaticEntityRepository';

import { Repository as SQLiteRepository } from '../Adapters/SQLite/Repository';
import { Repository as WebSqlRepository } from '../Adapters/WebSQL/Repository';
import { AdapterRepositoryInterface } from '../Adapters/AdapterRepositoryInterface';
import { EntityStore } from '../Store/EntityStore.service';

@Injectable()
export class EntityRepository implements RepositoryInterface {

  static repositories = {};

  protected sqlTransactionObject = null;

  /**
   * A token to store the current managed class
   * @property classToken
   */
  public classToken: Type<any> = null;

  private connection: any;

  protected sqlService: SQLFactory = new SQLFactory();

  private internalRepository: AdapterRepositoryInterface;

  // lastSql : string = '';

  constructor(
    public manager: Manager
  ) {
    this.classToken = RepositoryStore.getClassToken(this.constructor.name);

    // get the connection for the current repository
    this.manager.getConnection()
    .then((connection) => {
      this.connection = connection;

      switch (this.manager.getAdapter()) {
        case ADAPTERS.sqlite : {
          this.internalRepository = new SQLiteRepository(this.manager);
        } break;
        case ADAPTERS.websql : {
          this.internalRepository = new WebSqlRepository(this.manager);
        } break;
        default: {
          throw new RepositoryError('The entity repository requires an explicit adapter to load internal repository');
        }
      }

      this.internalRepository.setParent(this);
    })
    .catch(error => {
      throw new RepositoryError(error.message || 'Connection failed');
    });
  }

  getManager(): Manager {
    return this.manager;
  }

  getSqlService(): SQLFactory {
    return this.sqlService;
  }

  getRepositories(): any {
    return EntityRepository.repositories;
  }

  getSchema(): Array<any> {
    return EntityStore.getTableSchema(this.classToken.name);
  }

  getJointures(): Array<any> {
    return EntityStore.getJointureAnnotations(this.classToken.name);
  }

  getClassToken(): Type<any> {
    return this.classToken;
  }

  mapArrayToObject(array: Array<any>): EntityInterface {

    const instance = new (this.getClassToken());

    const schema = this.getSchema();

    for (const key in schema) {
      if (key) {
        const fieldMetadata = schema[key];
        instance[fieldMetadata.propertyKey] = array[fieldMetadata.name];
      }
    }

    return instance;
  }

  // ----------------------------------------------------------------------------------
  // TRANSACTION
  // ----------------------------------------------------------------------------------

  use(sqlTransactionObject: any): RepositoryInterface {
    this.sqlTransactionObject = sqlTransactionObject;
    return this;
  }

  forget() {
    this.sqlTransactionObject = null;
    return this;
  }

  private getTransaction() {
    return (this.sqlTransactionObject != null) ? this.sqlTransactionObject : this.connection.transaction;
  }

  // ----------------------------------------------------------------------------------
  // SELECT
  // ----------------------------------------------------------------------------------

  async select(options: any): Promise<EntityInterface[]> {
    const repository = this.internalRepository;

    return repository.select(options);
  }

  // ----------------------------------------------------------------------------------
  // INSERT
  // ----------------------------------------------------------------------------------
  async insert(object: EntityInterface, options: any = {}): Promise<EntityInterface> {
    const repository = this.internalRepository;

    return repository.insert(object, options);

  }

  // ----------------------------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------------------------

  update(arg: EntityInterface|UpdateOption): Promise<boolean> {
    const repository = this.internalRepository;

    return repository.update(arg);
  }



  // ----------------------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------------------

  delete(entity?: EntityInterface): Promise<boolean> {

    const repository = this.internalRepository;

    return repository.delete(entity);
  }

  // Facade functions

  /**
   * Find by id
   * @param id
   */
  find(id: number): Promise<EntityInterface|null> {
    return this.internalRepository.find(id);
  }

  /**
   * Find by criteria
   * @param options
   */
  findBy(options: any): Promise<EntityInterface[]> {
    return this.internalRepository.findBy(options);
  }

  /**
   * Find one result following the search criteria
   * @param options
   */
  findOneBy(options: any): Promise<EntityInterface|null> {
    return this.internalRepository.findOneBy(options);
  }

  /**
   * Find all the results in this table
   */
  findAll(): Promise<EntityInterface[]> {
    return this.internalRepository.findAll();
  }
}
