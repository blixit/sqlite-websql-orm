import { ManagerInterface } from '../Manager/Manager.interface';
import { EntityInterface } from '../Entity/EntityInterface.interface';
import { RepositoryStore } from '../Store/RepositoryStore.service';
import { ObjectRepositoryInterface } from './ObjectRepositoryInterface';
import { RepositoryInterface } from './RepositoryInterface.interface';

/**
 * @dynamic
 */
export class StaticEntityRepository {

    /**
     * Lazy loads joined fields
     * @param res
     * @param repository
     * @param jointures
     * @param manager
     * @param repositories
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
            repositories[join] = RepositoryStore.getRepositoryInstance(jointures[join].class, manager);
        }

        for (let i = 0; i < res.rows.length; i++) {
            const item = res.rows.item(i);
            let object: EntityInterface = repository.mapArrayToObject(item);

            for (const join in jointures) {
                if (join) {
                    const joinField = '__join__' + join;

                    try {
                        object = await repository['executeSelectJoin'] (object, joinField, join, item, jointures);
                    } catch (e) {
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
     * @param object
     * @param res
     * @param repository
     * @param resolve
     * @param reject
     * @param options
     */
    static mapResultsForInsert(
        object: EntityInterface,
        res: any,
        repository: ObjectRepositoryInterface,
        resolve,
        reject,
        options: any = {}
    ) {
        if (res.insertId && res.rowsAffected > 0) {
            StaticEntityRepository.updateObject(object, res, repository, resolve, reject, options);
        } else {
            reject({
                message: 'Internal Error : mapResultsForInsert failed'
            });
        }
    }

    /**
     * Handle the database update query.
     * On success the object is updated
     * @param object
     * @param res
     * @param repository
     * @param resolve
     * @param reject
     * @param options
     */
    static mapResultsForUpdate(
        object: EntityInterface,
        res: any,
        repository: ObjectRepositoryInterface,
        resolve,
        reject,
        options: any = {}
    ) {
        if (res.rowsAffected >= 0) {
            if (object) {
                StaticEntityRepository.updateObject(object, res, repository, resolve, reject, options);
            } else {
                resolve(true);
            }
        } else {
            reject({
                message: 'Internal Error : mapResultsForUpdate failed'
            });
        }
    }

    /**
     * Update the given object. Since this function calls the 'find' method, then the lazyload will occurs.
     * TODO: add a ttl option to the function 'executeSelectJoin' to let it know how to decremente it in order
     * to avoid cycle references while lazyloading
     *
     * @param object
     * @param res
     * @param repository
     * @param resolve
     * @param reject
     * @param options
     */
    static updateObject(
        object: EntityInterface,
        res: any,
        repository: ObjectRepositoryInterface,
        resolve,
        reject,
        options: any = {}
    ) {
        repository.find(res.insertId).then(entity => {
            entity.__hash__ = options.hash || '';
            for (const p in entity) {
                if (p) {
                    object[p] = entity[p];
                }
            }
            resolve(entity);
        }).catch(error => {
            reject(error);
        });
    }
}
