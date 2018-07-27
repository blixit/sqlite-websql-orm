import { StaticEntityRepository } from '../../Repository/StaticEntityRepository';
import { EntityInterface } from '../../Entity/EntityInterface.interface';
import { AdapterRepositoryInterface } from '../AdapterRepositoryInterface';
import { Manager } from '../../Manager/Manager.service';
import { UpdateOption, SelectOption, InsertOption, DeleteOption } from '../../Schema/SQLQueriesInterfaces';
import { RepositoryError } from '../../Errors';
import { AbstractRepository } from '../AbstractRepository';

export class Repository extends AbstractRepository implements AdapterRepositoryInterface {



    constructor(public manager: Manager) {
        super();
    }


  // ----------------------------------------------------------------------------------
  // SELECT
  // ----------------------------------------------------------------------------------

  /**
   * @warning
   * TODO: add a ttl option to the function 'executeSelectJoin' to let it know how to decremente it in order
   * to avoid cycle references while lazyloading
   *
   * @param object
   * @param joinField
   * @param join
   * @param item
   * @param jointures
   */
    executeSelectJoin(object, joinField, join, item, jointures): Promise<EntityInterface[]> {
        return this.parentRepository.getRepositories()[join]
        .select({
            conditions: [jointures[join].field + '= \'' + item[join] + '\'']
        })
        .then(data => {
            object[joinField] = data.length > 0 ? data[0] : null;
            return object;
        })
        .catch(error => {
            object[joinField] = null;
        });
    }

    /**
     * Select results
     * @param options
     */
    async select(options?: SelectOption): Promise<EntityInterface[]> {
        const sql: string = this.getSqlService().getSelectSql(this.getClassToken().name, options);
        const jointures: Array<any> = this.getJointures();

        return new Promise<EntityInterface[]>((resolve, reject) => {
            // define callbacks
            const successCallback = (resultSet) => {
                resolve(StaticEntityRepository.mapResultsForSelect(
                    resultSet.res || resultSet,
                    this,
                    jointures,
                    this.manager,
                    this.parentRepository.getRepositories()
                ));
            };
            const errorCallback = (e, e2) => {
                if (options.transactionObject) {
                    reject(e2);
                } else {
                    reject(e);
                }
            };

            if (options && options.transactionObject) { // call from the manager
                options.transactionObject.executeSql(sql, [], successCallback, errorCallback);
            } else { // call from the repository
                const t = this.manager.getConnector().connection;
                t.executeSql(sql, []).then(successCallback).catch(errorCallback);
            }
        });
    }

    /**
     * Insert data
     * @param object
     * @param options
     */
    async insert(object: EntityInterface, options?: InsertOption): Promise<EntityInterface> {
        const sql = this.getSqlService().getInsertSql(this.getClassToken().name, object);

        return new Promise<EntityInterface>((resolve, reject) => {

            // define callbacks
            const successCallback = (res, tx) => {
                if (options.transactionObject) {
                    StaticEntityRepository.mapResultsForInsert(object, tx, this, resolve, reject, options);
                } else {
                    StaticEntityRepository.mapResultsForInsert(object, res, this, resolve, reject, options);
                }
            };
            const errorCallback = (e, e2) => {
                if (options.transactionObject) {
                    reject(e2);
                } else {
                    reject(e);
                }
            };

            if (options && options.transactionObject) { // call from the manager
                options.transactionObject.executeSql(sql, [], successCallback, errorCallback);
            } else {// call from the repository
                const t = this.manager.getConnector().connection;
                t.executeSql(sql, []).then(successCallback).catch(errorCallback);
            }
        });
    }

    /**
     * Update
     * @param arg
     * @param options
     */
    async update(arg: EntityInterface|UpdateOption): Promise<boolean>;
    async update(arg: EntityInterface, options: UpdateOption): Promise<boolean>;
    async update(arg: EntityInterface|UpdateOption, options?: UpdateOption): Promise<boolean> {

        let sql: string;
        let argIsEntity = false;

        if ( ! options) {
            if (arg['__interfacename__'] && arg['__interfacename__'] === 'EntityInterface') {
                // arg == entity: EntityInterface
                argIsEntity = true;

                if ( ! arg['id']) {
                    throw new RepositoryError('Can not update an entity without an id');
                }

                options = {
                    id: arg.id,
                    affectations: [],
                    conditions: ['id = ' + arg.id]
                };

                sql = this.getSqlService().getUpdateSql(this.getClassToken().name, options, <EntityInterface>arg);
            } else {
                // arg == options: UpdateOption
                sql = this.getSqlService().getUpdateSql(this.getClassToken().name, <UpdateOption>arg);
            }
        } else {
            options.id = arg.id; // avoid human errors by preventing to update an object with another id
            sql = this.getSqlService().getUpdateSql(this.getClassToken().name, options, <EntityInterface>arg);
        }

        // Promise
        return new Promise<boolean>((resolve, reject) => {

            // define callbacks
            const successCallback = (res, tx) => {
                if (argIsEntity) {
                    if (options.transactionObject) {
                        StaticEntityRepository.mapResultsForUpdate(<EntityInterface>arg, tx, this, resolve, reject, {});
                    } else {
                        StaticEntityRepository.mapResultsForUpdate(<EntityInterface>arg, res, this, resolve, reject, {});
                    }
                }

                resolve(true);
            };
            const errorCallback = (e, e2) => {
                if (options.transactionObject) {
                    reject(e2);
                } else {
                    reject(e);
                }
            };

            if (options && options.transactionObject) { // call from the manager
                options.transactionObject.executeSql(sql, [], successCallback, errorCallback);
            } else {// call from the repository
                const t = this.manager.getConnector().connection;
                t.executeSql(sql, []).then(successCallback).catch(errorCallback);
            }
        });
    }

    /**
     * Delete data
     * @param entity
     * @param options
     */
    async delete(entity?: EntityInterface, options?: DeleteOption): Promise<boolean> {
        const sql = this.getSqlService().getDeleteSql(this.getClassToken().name, entity, options);

        return new Promise<boolean>((resolve, reject) => {
            // define callbacks
            const successCallback = (res, tx) => {
                // remove id
                if (entity) {
                    entity.id = null;
                }

                resolve(true);
            };
            const errorCallback = (e, e2) => {
                if (options.transactionObject) {
                    reject(e2);
                } else {
                    reject(e);
                }
            };

            if (options && options.transactionObject) { // call from the manager
                options.transactionObject.executeSql(sql, [], successCallback, errorCallback);
            } else {// call from the repository
                const t = this.manager.getConnector().connection;
                t.executeSql(sql, []).then(successCallback).catch(errorCallback);
            }
        });
    }
}
