import { Injectable, Type           } from '@angular/core';

// ORM
import { Manager              } from '../Manager/Manager.service';
import { SQLFactory           } from '../Schema/SQL.service';

import { UpdateOption, DeleteOption, SelectOption, InsertOption  } from '../Schema/SQLQueriesInterfaces';

import { EntityInterface      } from '../Entity/EntityInterface.interface';
import { RepositoryInterface  } from '../Repository/RepositoryInterface.interface';

import { RepositoryStore      } from '../Store/RepositoryStore.service';

import { RepositoryError } from '../Errors';
import { ADAPTERS } from '../Adapters/AbstractAdapter';

import { Repository as SQLiteRepository } from '../Adapters/SQLite/Repository';
import { Repository as WebSqlRepository } from '../Adapters/WebSQL/Repository';
import { AdapterRepositoryInterface } from '../Adapters/AdapterRepositoryInterface';
import { EntityStore } from '../Store/EntityStore.service';

/**
 *  @dynamic
 */
@Injectable()
export class EntityRepository implements RepositoryInterface {

  static repositories = {};

  protected sqlTransactionObject = null;

  /**
   * A token to store the class managed by this repository
   * @property classToken
   */
  public classToken: Type<any> = null;

  /**
   * Connection object to handle queries
   * @property connection
   */
  private connection: any;

  /**
   * Sql service
   * @property sqlService
   */
  protected sqlService: SQLFactory = new SQLFactory();

  /**
   * Repository loaded from the current adapter
   * @property internalRepository
   */
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

      this.getInternalRepository();

    })
    .catch(error => {
      throw new RepositoryError(error.message || 'Connection failed');
    });
  }

  private getInternalRepository() {
    if (this.internalRepository) {
      return this.internalRepository;
    }

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

    return this.internalRepository;
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

  /**
   * Convert a database array to an entity instance
   * @param array
   */
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
  // SELECT
  // ----------------------------------------------------------------------------------

  select(options: SelectOption): Promise<EntityInterface[]> {
    const repository = this.getInternalRepository();

    return repository.select(options);
  }

  // ----------------------------------------------------------------------------------
  // INSERT
  // ----------------------------------------------------------------------------------
  insert(object: EntityInterface, options: InsertOption = {}): Promise<EntityInterface> {
    const repository = this.getInternalRepository();

    if (! repository) {
      throw new RepositoryError('not found repository object');
    }

    return repository.insert(object, options);

  }

  // ----------------------------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------------------------

  update(arg: EntityInterface, options?: UpdateOption): Promise<boolean> {
    const repository = this.getInternalRepository();

    return repository.update(arg, options);
  }



  // ----------------------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------------------
  delete(entity?: EntityInterface, options?: DeleteOption): Promise<boolean> {
    const repository = this.getInternalRepository();

    return repository.delete(entity, options);
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
