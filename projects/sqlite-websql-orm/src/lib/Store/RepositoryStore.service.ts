import { Type, Injectable, Injector } from '@angular/core';
import { ManagerInterface } from '../Manager/Manager.interface';
import { RepositoryInterface } from '../Repository/RepositoryInterface.interface';
import { ObjectRepositoryInterface } from '../Repository/ObjectRepositoryInterface';

export interface RepositoryStoreInfo {
  repository: string;

  entityToken: Type<any>;
}

export interface MapNamesConstructorsInterface {
  [key: string]: Type<any>;
}

/**
 *  @dynamic
 */
@Injectable({
  providedIn: 'root'
})
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
  static store = {};

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
  static mapNamesConstructors: MapNamesConstructorsInterface = {};

  /**
   * Get repository by entity name
   */
  static getRepositoryNameByEntity(entityName: string) {
    return RepositoryStore.store[entityName].repository;
  }

  static getRepositoryConstructor(entityName: string): Type<ObjectRepositoryInterface | RepositoryInterface> {
    return RepositoryStore.mapNamesConstructors[RepositoryStore.getRepositoryNameByEntity(entityName)];
  }

  /**
   * Set repository by entity name
   */
  static setRepositoryByEntity(entityName: string, repositoryStoreInfo: RepositoryStoreInfo) {
    RepositoryStore.store[entityName] = repositoryStoreInfo;
    return RepositoryStore;
  }

  /**
   * Add mapped repository
   */
  static addMappedRepository(repositoryName: string, repositoryType: Type<any>) {
    RepositoryStore.mapNamesConstructors[repositoryName] = repositoryType;
    return RepositoryStore;
  }

  /**
   * Instantiate the repository of the given the entity name
   * @param manager Manager instance which implements ManagerInterface
   * @deprecated
   */
  static getRepositoryInstanceOLD(entityName: string, injector: Injector, manager?: ManagerInterface) {
    let instance = RepositoryStore.store[entityName].instance;

    if (instance === undefined) {
      const repository = RepositoryStore.getRepositoryConstructor(entityName);
      // RepositoryStore.mapNamesConstructors[RepositoryStore.getRepositoryNameByEntity(entityName)];
      instance = injector.get<any>(repository);
      RepositoryStore.store[entityName].instance = instance;
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

    if (!found) {
      throw new Error('The current repository \'' + RepositoryName + '\' is not attached to any entity');
    }

    return classToken;
  }
}
