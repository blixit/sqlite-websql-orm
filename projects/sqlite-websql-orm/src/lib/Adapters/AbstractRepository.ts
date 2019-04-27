import { EntityInterface } from '../Entity/EntityInterface.interface';
import { NotImplemented } from '../Errors';
import { RepositoryInterface } from '../Repository/RepositoryInterface.interface';
import { SQLFactory } from '../Schema/SQL.service';
import { Type } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';

export class AbstractRepository {

  protected parentRepository: RepositoryInterface;

  setParent(repository: RepositoryInterface) {
    this.parentRepository = repository;
    return this;
  }

  getSqlService(): SQLFactory {
    return this.parentRepository.getSqlService();
  }

  getClassToken(): Type<any> {
    return this.parentRepository.classToken;
  }

  mapArrayToObject(a) {
    return this.parentRepository.mapArrayToObject(a);
  }

  getJointures() {
    return this.parentRepository.getJointures();
  }

  /**
   * @warning
   * TODO: add a ttl option to the function 'executeSelectJoin' to let it know how to decremente it in order
   * to avoid cycle references while lazyloading
   */
  executeSelectJoin(object: EntityInterface, joinField, join, item, jointures): Observable<EntityInterface> {
    return (this.parentRepository.getRepositories()[join] as RepositoryInterface)
      .select({
        // we apply the join on the join-field defined into the entity
        conditions: [jointures[join].field + '= \'' + item[join] + '\'']
      })
      .pipe(
        switchMap((data: EntityInterface[]) => {
          object[joinField] = data.length > 0 ? data[0] : null;
          return of(object);
        }),
        catchError(error => {
          object[joinField] = null;
          return throwError(error);
        })
      );
  }

  /**
   * Will be overrided
   * @param options
   */
  select(options: any): Observable<EntityInterface[]> | Promise<EntityInterface[]> {
    return throwError(new NotImplemented('Repository.select'));
  }

  /**
   * Find by id
   * @param id
   */
  find(id: number): Observable<EntityInterface | null> {
    const options = {
      conditions: ['id = ' + id]
    };
    return this.findOneBy(options);
  }

  /**
   * Find by criteria
   * @param options
   */
  findBy(options: any): Observable<EntityInterface[]> {
    return from(this.select(options));
  }

  /**
   * Find one result following the search criteria
   * @param options
   */
  findOneBy(options: any): Observable<EntityInterface | null> {
    // set limit to get only one element
    options.limit = '0,1';
    return (this.select(options) as Observable<EntityInterface[]>)
      .pipe(
        switchMap((results: EntityInterface[]) => {
          const data: EntityInterface[] = results as Array<EntityInterface>;
          return of(data[0]);
        })
      );
  }

  /**
   * Find all the results in this table
   */
  findAll(): Observable<EntityInterface[]> {
    return this.select({}) as Observable<EntityInterface[]>;
  }
}
