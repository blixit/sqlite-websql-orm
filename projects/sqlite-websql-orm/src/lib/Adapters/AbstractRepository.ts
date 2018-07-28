import { EntityInterface } from '../Entity/EntityInterface.interface';
import { NotImplemented } from '../Errors';
import { RepositoryInterface } from '../Repository/RepositoryInterface.interface';
import { SQLFactory } from '../Schema/SQL.service';
import { Type } from '@angular/core';

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
     * Will be overrided
     * @param options
     */
    async select(options: any): Promise<EntityInterface[]> {
        throw new NotImplemented('Repository.select');
    }


    /**
     * Find by id
     * @param id
     */
    find(id: number): Promise<EntityInterface|null> {
        const options = {
        conditions : ['id = ' + id]
        };
        return this.findOneBy(options);
    }

    /**
     * Find by criteria
     * @param options
     */
    findBy(options: any): Promise<EntityInterface[]> {
        return this.select(options);
    }

    /**
     * Find one result following the search criteria
     * @param options
     */
    findOneBy(options: any): Promise<EntityInterface|null> {
        return new Promise<EntityInterface>((resolve, reject) => {
            // set limit to get only one element
            options.limit = '0,1';

            this.select(options).then((results: EntityInterface[]) => {

                const data: EntityInterface[] = results as Array<EntityInterface>;
                if (data.length > 0) {
                    resolve(data[0]);
                } else {
                    reject(null);
                }

            }).catch(error => {
                reject(error);
            });
        });
    }

    /**
     * Find all the results in this table
     */
    findAll(): Promise<EntityInterface[]> {
        return this.select({});
    }
}
