import { ManagerInterface } from '../Manager/Manager.interface';
import { EntityInterface } from '../Entity/EntityInterface.interface';
import { RepositoryStore } from '../Store/RepositoryStore.service';
import { ObjectRepositoryInterface } from './ObjectRepositoryInterface';
import { RepositoryInterface } from './RepositoryInterface.interface';

/**
 * @dynamic
 */
export class StaticEntityRepository {

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


    static mapResultsForInsert(
        object: EntityInterface,
        res: any,
        repository: ObjectRepositoryInterface,
        resolve,
        reject,
        options: any = {}
    ) {
        if (res.insertId && res.rowsAffected > 0) {
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
        } else {
            reject({
                message: 'mapResultsForInsert failed'
            });
        }
    }


    static mapResultsForUpdate(
        object: EntityInterface,
        res: any,
        repository: ObjectRepositoryInterface,
        resolve,
        reject,
        options: any = {}
    ) {
        if (res.rowsAffected > 0) {
            resolve(true);

        } else {
            reject({
                message: 'mapResultsForUpdate failed'
            });
        }
    }
}
