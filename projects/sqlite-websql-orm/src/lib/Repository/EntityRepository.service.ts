import { Injectable, Type } from '@angular/core';

// ORM
import { Manager } from '../Manager/Manager.service';
import { SQLFactory } from '../Schema/SQL.service';

import { UpdateOption, DeleteOption, SelectOption, InsertOption } from '../Schema/SQLQueriesInterfaces';

import { EntityInterface } from '../Entity/EntityInterface.interface';
import { RepositoryInterface } from '../Repository/RepositoryInterface.interface';

import { RepositoryStore } from '../Store/RepositoryStore.service';

import { RepositoryError } from '../Errors';
import { ADAPTERS } from '../Adapters/AbstractAdapter';

// import { SQLiteRepository as SQLiteRepository } from '../Adapters/SQLite/SQLiteRepository';
import { WebSQLRepository as WebSqlRepository } from '../Adapters/WebSQL/WebSQLRepository';
import { AdapterRepositoryInterface } from '../Adapters/AdapterRepositoryInterface';
import { EntityStore } from '../Store/EntityStore.service';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { of, throwError, Observable, from } from 'rxjs';

/**
 *  @dynamic
 */
// @Injectable({
//   providedIn: 'root'
// })
export class EntityRepository implements RepositoryInterface {

  static repositories = {};

  protected sqlTransactionObject = null;

  /**
   * A token to store the class managed by this repository
   */
  public classToken: Type<any> = null;

  /**
   * Connection object to handle queries
   */
  private connection: any;

  /**
   * Sql service
   */
  protected sqlService: SQLFactory = new SQLFactory();

  /**
   * Repository loaded from the current adapter
   */
  private internalRepository: AdapterRepositoryInterface;

  // lastSql : string = '';

  constructor(public manager: Manager) {
    this.classToken = RepositoryStore.getClassToken(this.constructor.name);
  }

  /**
   * Get the internal repository based on the internal repository guesser
   */
  private getInternalRepository(): Observable<AdapterRepositoryInterface> {
    return this.manager.getConnection()
      .pipe(
        switchMap((connection) => {
          // this.connection = connection;
          return of(this.guessInternalRepository());
        }),
        catchError(error => {
          return throwError(new RepositoryError(error.message || 'Connection failed'));
        })
      );
  }

  private guessInternalRepository(): AdapterRepositoryInterface {
    if (this.internalRepository) {
      return this.internalRepository;
    }

    switch (this.manager.getAdapter()) {
      case ADAPTERS.sqlite: {
        throw new Error('Sqlite repository not implemented');
        // this.internalRepository = new SQLiteRepository(this.manager);
        break;
      }
      case ADAPTERS.websql: {
        this.internalRepository = new WebSqlRepository(this.manager);
        break;
      }
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
   * Convert a database object to an entity instance
   * @param array the array within the database format
   */
  mapArrayToObject(array: any): EntityInterface {

    const instance = new (this.getClassToken())();

    const schema = this.getSchema();

    for (const key in schema) {
      if (key) {
        const fieldMetadata = schema[key];
        instance[fieldMetadata.propertyKey] = array[fieldMetadata.name];
      }
    }

    return instance as EntityInterface;
  }

  // ----------------------------------------------------------------------------------
  // SELECT
  // ----------------------------------------------------------------------------------
  select(options: SelectOption): Observable<EntityInterface[]> {
    return this.getInternalRepository().pipe(
      switchMap(repository => {
        return repository.select(options);
      })
    );
  }

  // ----------------------------------------------------------------------------------
  // INSERT
  // ----------------------------------------------------------------------------------
  insert(object: EntityInterface, options: InsertOption = {}): Observable<EntityInterface> {
    return this.getInternalRepository().pipe(
      switchMap(repository => {
        return repository.insert(object, options);
      })
    );
  }

  // ----------------------------------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------------------------------
  update(arg: EntityInterface, options?: UpdateOption): Observable<boolean> {
    return this.getInternalRepository().pipe(
      switchMap(repository => {
        return repository.update(arg, options);
      })
    );
  }

  // ----------------------------------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------------------------------
  delete(entity?: EntityInterface, options?: DeleteOption): Observable<boolean> {
    return this.getInternalRepository().pipe(
      switchMap(repository => {
        return repository.delete(entity, options);
      })
    );
  }

  // Facade functions

  /**
   * Find by id
   */
  find(id: number): Observable<EntityInterface | null> {
    return this.getInternalRepository().pipe(
      switchMap(repository => {
        return repository.find(id);
      })
    );
  }

  /**
   * Find by criteria
   */
  findBy(options: any): Observable<EntityInterface[]> {
    return this.getInternalRepository().pipe(
      switchMap(repository => {
        return repository.findBy(options);
      })
    );
  }

  /**
   * Find one result following the search criteria
   */
  findOneBy(options: any): Observable<EntityInterface | null> {
    return this.getInternalRepository().pipe(
      switchMap(repository => {
        return repository.findOneBy(options);
      })
    );
  }

  /**
   * Find all the results in this table
   */
  findAll(): Observable<EntityInterface[]> {
    return this.getInternalRepository().pipe(
      switchMap(repository => {
        return repository.findAll();
      })
    );
  }
}
