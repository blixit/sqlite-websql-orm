import { StaticEntityRepository } from '../../Repository/StaticEntityRepository';
import { EntityInterface } from '../../Entity/EntityInterface.interface';
import { AdapterRepositoryInterface } from '../AdapterRepositoryInterface';
import { Manager } from '../../Manager/Manager.service';
import { UpdateOption } from '../../Schema/SQLQueriesInterfaces';
import { RepositoryError } from '../../Errors';
import { AbstractRepository } from '../AbstractRepository';

export class Repository extends AbstractRepository implements AdapterRepositoryInterface {



    constructor(public manager: Manager) {
        super();
    }


  // ----------------------------------------------------------------------------------
  // SELECT
  // ----------------------------------------------------------------------------------

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


    async select(options: any): Promise<EntityInterface[]> {
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
            const errorCallback = (e) => {
                reject(e);
            };

            const t = this.manager.getConnector().connection;
            t.executeSql(sql, []).then(successCallback).catch(errorCallback);
        });
    }

    async insert(object: EntityInterface, options: any = {}): Promise<EntityInterface> {
        const sql = this.getSqlService().getInsertSql(this.getClassToken().name, object);

        return new Promise<EntityInterface>((resolve, reject) => {
        const t = this.manager.getConnector().connection;

        // define callbacks
        const successCallback = (res) => {
            StaticEntityRepository.mapResultsForInsert(object, res, this, resolve, reject, options);
        };
        const errorCallback = (e) => {
            reject(e);
        };

        t.executeSql(sql, []).then(successCallback).catch(errorCallback);

        });
    }

    async update(arg: EntityInterface|UpdateOption): Promise<boolean> {

        let sql: string;
        let argIsEntity = false;

        if (arg['__interfacename__'] && arg['__interfacename__'] === 'EntityInterface') {
            // arg == entity: EntityInterface
            argIsEntity = true;

            if ( ! arg['id']) {
                throw new RepositoryError('Can not update an entity without an id');
            }

            const options: UpdateOption = {
                id: arg.id,
                affectations: [],
                conditions: ['id = ' + arg.id]
            };


            sql = this.getSqlService().getUpdateSql(this.getClassToken().name, options, <EntityInterface>arg);
        } else {
            // arg == options: UpdateOption
            sql = this.getSqlService().getUpdateSql(this.getClassToken().name, <UpdateOption>arg);
        }

        // Promise
        return new Promise<boolean>((resolve, reject) => {

            const t = this.manager.getConnector().connection;

            // define callbacks
            const successCallback = (res) => {
                if (argIsEntity) {
                    StaticEntityRepository.mapResultsForUpdate(<EntityInterface>arg, res, this, resolve, reject, {});
                }

                resolve(true);
            };
            const errorCallback = (e) => {
                reject(e);
            };

            t.executeSql(sql, []).then(successCallback).catch(errorCallback);
        });
    }

    async delete(entity?: EntityInterface): Promise<boolean> {
        const sql = this.getSqlService().getDeleteSql(this.getClassToken().name, entity);

        return new Promise<boolean>((resolve, reject) => {
            // define callbacks
            const successCallback = (resultSet) => {
                resolve(true);
            };
            const errorCallback = (e) => {
                reject(e);
            };

            const t = this.manager.getConnector().connection;

            t.executeSql(sql, []).then(successCallback).catch(errorCallback);
        });
    }

}
