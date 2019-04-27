import { StaticEntityRepository } from '../../Repository/StaticEntityRepository';
import { EntityInterface } from '../../Entity/EntityInterface.interface';
import { AdapterRepositoryInterface } from '../AdapterRepositoryInterface';
import { Manager } from '../../Manager/Manager.service';
import { UpdateOption, SelectOption, InsertOption, DeleteOption } from '../../Schema/SQLQueriesInterfaces';
import { RepositoryError } from '../../Errors';
import { AbstractRepository } from '../AbstractRepository';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class WebSQLRepository extends AbstractRepository implements AdapterRepositoryInterface {
  constructor(public manager: Manager) {
    super();
  }

  /**
   * Select results
   */
  select(options?: SelectOption): Observable<EntityInterface[]> {
    const sql: string = this.getSqlService().getSelectSql(this.getClassToken().name, options);
    const jointures: Array<any> = this.getJointures();

    return new Observable(observer => {
      // define callbacks
      const successCallback = async (resultSet) => {
        // on success, apply joins
        const result = await StaticEntityRepository.mapResultsForSelect(
          resultSet.res || resultSet,
          this,
          jointures,
          this.manager,
          this.parentRepository.getRepositories()
        );
        observer.next(result as any);
        observer.complete();
      };
      const errorCallback = (e, e2) => {
        if (options.transactionObject) {
          observer.error(e2);
        } else {
          observer.error(e);
        }
      };

      if (options && options.transactionObject) { // call from the manager
        options.transactionObject.executeSql(sql, [], successCallback, errorCallback);
      } else { // call from the repository
        const t = this.manager.getConnector().connection;
        t.executeSql(sql, []).then(successCallback).catch(errorCallback);
      }
    });
  }

  /**
   * Insert data
   * TODO: replace promise by observable
   */
  insert(object: EntityInterface, options?: InsertOption): Observable<EntityInterface> {
    const sql = this.getSqlService().getInsertSql(this.getClassToken().name, object);

    return new Observable<EntityInterface>(observer => {

      // define callbacks
      const successCallback = (res, tx) => {
        if (options.transactionObject) {
          StaticEntityRepository.mapResultsForInsert(object, tx, this, options)
            .pipe(
              catchError(error => {
                observer.error(error);
                return null;
              })
            )
            .subscribe(data => {
              observer.next(data);
              observer.complete();
            });
        } else {
          StaticEntityRepository.mapResultsForInsert(object, res, this, options)
            .pipe(
              catchError(error => {
                observer.error(error);
                return null;
              })
            )
            .subscribe(data => {
              observer.next(data);
              observer.complete();
            });
        }
      };
      const errorCallback = (e, e2) => {
        if (options.transactionObject) {
          observer.error(e2);
        } else {
          observer.error(e);
        }
      };

      if (options && options.transactionObject) { // call from the manager
        options.transactionObject.executeSql(sql, [], successCallback, errorCallback);
      } else {// call from the repository
        const t = this.manager.getConnector().connection;
        t.executeSql(sql, []).then(successCallback).catch(errorCallback);
      }
    });
  }

  /**
   * Update
   */
  update(arg: EntityInterface | UpdateOption): Observable<boolean>;
  update(arg: EntityInterface, options: UpdateOption): Observable<boolean>;
  update(arg: EntityInterface | UpdateOption, options?: UpdateOption): Observable<boolean> {

    let sql: string;
    let argIsEntity = false;

    if (!options) {
      if ((arg as EntityInterface).__interfacename__ && (arg as EntityInterface).__interfacename__ === 'EntityInterface') {
        // arg == entity: EntityInterface
        argIsEntity = true;

        if (!arg.id) {
          throw new RepositoryError('Can not update an entity without an id');
        }

        options = {
          id: arg.id,
          affectations: [],
          conditions: ['id = ' + arg.id]
        };

        sql = this.getSqlService().getUpdateSql(this.getClassToken().name, options, arg as EntityInterface);
      } else {
        // arg == options: UpdateOption
        sql = this.getSqlService().getUpdateSql(this.getClassToken().name, arg as UpdateOption);
      }
    } else {
      options.id = arg.id; // avoid human errors by preventing to update an object with another id
      sql = this.getSqlService().getUpdateSql(this.getClassToken().name, options, arg as EntityInterface);
    }

    return new Observable<boolean>(observer => {
      // define callbacks
      const successCallback = (res, tx) => {
        if (argIsEntity) {
          if (options.transactionObject) {
            StaticEntityRepository.mapResultsForUpdate(arg as EntityInterface, tx, this, {})
              .pipe(
                catchError(error => {
                  observer.error(error);
                  return null;
                })
              )
              .subscribe(data => {
                observer.next(data);
                observer.complete();
              });
          } else {
            StaticEntityRepository.mapResultsForUpdate(arg as EntityInterface, res, this, {})
              .pipe(
                catchError(error => {
                  observer.error(error);
                  return null;
                })
              )
              .subscribe(data => {
                observer.next(data);
                observer.complete();
              });
          }
        }
        observer.next(true);
      };
      const errorCallback = (e, e2) => {
        observer.error(options.transactionObject ? e2 : e);
      };

      if (options && options.transactionObject) { // call from the manager
        options.transactionObject.executeSql(sql, [], successCallback, errorCallback);
      } else {// call from the repository
        const t = this.manager.getConnector().connection;
        t.executeSql(sql, []).then(successCallback).catch(errorCallback);
      }
    });
  }

  /**
   * Delete data
   */
  delete(entity?: EntityInterface, options?: DeleteOption): Observable<boolean> {
    const sql = this.getSqlService().getDeleteSql(this.getClassToken().name, entity, options);

    return new Observable<boolean>(observer => {
      const successCallback = (res, tx) => {
        // remove id
        if (entity) {
          entity.id = null;
        }
        observer.next(true);
      };
      const errorCallback = (e, e2) => {
        observer.error(options.transactionObject ? e2 : e);
      };

      if (options && options.transactionObject) { // call from the manager
        options.transactionObject.executeSql(sql, [], successCallback, errorCallback);
      } else {// call from the repository
        const t = this.manager.getConnector().connection;
        t.executeSql(sql, []).then(successCallback).catch(errorCallback);
      }
    });
  }
}
