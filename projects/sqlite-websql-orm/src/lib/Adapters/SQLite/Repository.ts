import { ManagerInterface } from '../../Manager/Manager.interface';
import { SQLFactory } from '../../Schema/SQL.service';
import { AdapterRepositoryInterface } from '../AdapterRepositoryInterface';
import { EntityInterface } from '../../Entity/EntityInterface.interface';
import { UpdateOption, DeleteOption, InsertOption, SelectOption } from '../../Schema/SQLQueriesInterfaces';
import { AbstractRepository } from '../AbstractRepository';
import { StaticEntityRepository } from '../../Repository/StaticEntityRepository';
import { RepositoryError } from '../../Errors';

export class Repository extends AbstractRepository implements AdapterRepositoryInterface {

    private sqlService: SQLFactory;

    constructor(public manager: ManagerInterface) {
      super();
      this.sqlService = new SQLFactory();
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
            const successCallback = (resultSet, tx) => {
                const data = StaticEntityRepository.mapResultsForSelect(
                    resultSet,
                    // resultSet.res || resultSet,
                    this,
                    jointures,
                    this.manager,
                    this.parentRepository.getRepositories()
                );
                resolve(data);
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
