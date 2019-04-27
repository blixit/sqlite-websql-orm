import { AdapterRepositoryInterface } from './../Adapters/AdapterRepositoryInterface';
import { ManagerInterface } from '../Manager/Manager.interface';
import { EntityInterface } from '../Entity/EntityInterface.interface';
import { RepositoryStore } from '../Store/RepositoryStore.service';
import { ObjectRepositoryInterface } from './ObjectRepositoryInterface';
import { RepositoryInterface } from './RepositoryInterface.interface';
import { Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * @dynamic
 */
export class StaticEntityRepository {

  /**
   * Lazy loads joined fields
   */
  static async mapResultsForSelect(
    res: any,
    repository: ObjectRepositoryInterface | RepositoryInterface,
    jointures: Array<any>,
    manager: ManagerInterface,
    repositories: any
  ) {
    const data: Array<EntityInterface> = [];
    jointures = jointures || [];

    for (const join in jointures) {
      if (repositories[join]) {
        continue;
      }
      repositories[join] = RepositoryStore.getRepositoryInstanceOLD(jointures[join].class, null, manager);
    }

    for (let i = 0; i < res.rows.length; i++) {
      const item = res.rows.item(i);
      let object: EntityInterface = repository.mapArrayToObject(item);

      for (const join in jointures) {
        if (join) {
          const joinField = '__join__' + join;

          try {
            object = await (repository as ObjectRepositoryInterface)
              .executeSelectJoin(object, joinField, join, item, jointures).toPromise();
          } catch (e) {
            console.error('Joining failed in map select');
            continue;
          }

          // define getter
          object[jointures[join].getter] = () => {
            return object[joinField];
          };
        }
      }

      data.push(object);
    }

    return data;
  }

  /**
   * Handle the database insert query.
   * On success the object is updated
   */
  static mapResultsForInsert(
    object: EntityInterface,
    res: any,
    repository: ObjectRepositoryInterface | RepositoryInterface,
    options: any = {}
  ): Observable<any> {
    if (res.insertId && res.rowsAffected > 0) {
      return StaticEntityRepository.updateObject(object, res, repository, options);
    }
    return throwError(new Error('Internal Error : mapResultsForInsert failed'));
  }

  /**
   * Handle the database update query.
   * On success the object is updated
   */
  static mapResultsForUpdate(
    object: EntityInterface,
    res: any,
    repository: AdapterRepositoryInterface | ObjectRepositoryInterface | RepositoryInterface, // TODO: remove ObjectRepositoryInterface
    options: any = {}
  ): Observable<any> {
    if (res.rowsAffected >= 0) {
      if (object) {
        return StaticEntityRepository.updateObject(object, res, repository, options);
      } else {
        return of(true);
      }
    }
    return throwError(new Error('Internal Error : mapResultsForUpdate failed'));
  }

  /**
   * Update the given object. Since this function calls the 'find' method, then the lazyload will occurs.
   * TODO: add a ttl option to the function 'executeSelectJoin' to let it know how to decremente it in order
   * to avoid cycle references while lazyloading
   */
  static updateObject(
    object: EntityInterface,
    res: any,
    repository: AdapterRepositoryInterface | ObjectRepositoryInterface | RepositoryInterface,
    options: any = {}
  ): Observable<any> {
    return repository.find(res.insertId)
      .pipe(
        tap((entity: EntityInterface) => {
          if (entity == null) {
            return;
          }
          entity.__hash__ = options.hash || '';
          for (const p in entity) {
            if (p) {
              // to keep the reference on object, we just set fields
              object[p] = entity[p];
            }
          }
        })
      );
  }
}
