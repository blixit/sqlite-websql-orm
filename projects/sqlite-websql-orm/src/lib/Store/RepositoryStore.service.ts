import { Type, Injectable } from '@angular/core';
import { ManagerInterface } from '../Manager/Manager.interface';

export interface RepositoryStoreInfo {
    repository: string;

    entityToken: Type<any>;
}

/**
 *  @dynamic
 */
@Injectable()
export class RepositoryStore {

    /**
     * Stores the mapping between an entity and its repository.
     * It's usefull to get Repository name or entity constructor from entity name
     *
     * {
     *   entityname: {
     *      repository: sting, // repositoryName,
     *      entityToken: Type, // entity constructor
     *      instance: RepositoryInterface // instantiated object
     *   }
     * }
     */
    static store = {} ;

    /**
     * This array links repositories name to their construtor
     * Ex :
     * {
     *  repositoryName: repositoryType
     *
     *  EntityName: RepositoryName,    // OLD
     *  User: UserRepository           // OLD
     * }
     */
    static mapNamesConstructors = {};

    /**
     * Get repository by entity name
     * @param entityName
     */
    static getRepositoryByEntity(entityName: string) {
        return RepositoryStore.store[entityName].repository;
    }

    /**
     * Set repository by entity name
     * @param entityName
     * @param repositoryStoreInfo
     */
    static setRepositoryByEntity(entityName: string, repositoryStoreInfo: RepositoryStoreInfo) {
        RepositoryStore.store[entityName] = repositoryStoreInfo;
        return RepositoryStore;
    }

    /**
     * Add mapped repository
     * @param repositoryName
     * @param repositoryType
     */
    static addMappedRepository(repositoryName: string, repositoryType: Type<any>) {
        RepositoryStore.mapNamesConstructors[repositoryName] = repositoryType;
        return RepositoryStore;
    }

    /**
     * Instantiate the repository of the given the entity name
     * @param entityName
     * @param manager Manager instance which implements ManagerInterface
     */
    static getRepositoryInstance(entityName: string, manager: ManagerInterface) {
        const repository = RepositoryStore.mapNamesConstructors[RepositoryStore.getRepositoryByEntity(entityName)];

        let instance = RepositoryStore.store[entityName]['instance'];

        if (instance === undefined) {
            instance = new (repository)(manager);
            RepositoryStore.store[entityName]['instance'] = instance;
        }

        return instance;
    }

    /**
     * Get the list of associations between entities name and repositories name
     */
    static getSchemaSources() {
        const values = [];

        for (const v in RepositoryStore.mapNamesConstructors) {
            if (v) {
                values.push(RepositoryStore.mapNamesConstructors[v]);
            }
        }

        return values;
    }

    static getClassToken(RepositoryName: string) {
        let classToken = null;
        let found = false;

        for (const v in RepositoryStore.store) {
            if (v && RepositoryStore.store[v].repository === RepositoryName) {
                found = true;
                classToken = RepositoryStore.store[v].entityToken;
                break;
            }
        }

        if ( ! found ) {
            throw new Error('The current repository \'' + RepositoryName + '\' is not attached to any entity');
        }

        return classToken;
    }
}
