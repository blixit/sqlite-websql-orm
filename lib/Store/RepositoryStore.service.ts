import { Injectable } from "@angular/core";


@Injectable()
export class RepositoryStore {

    static repositories = {} ;

    /**
     * This array links entities with their repositories
     * Ex :
     * {
     *  EntityName: RepositoryName,
     *  User: UserRepository
     * }
     */
    static repositoriesSources = {};

    static getRepositoryByEntity(entityName:string) {
        return RepositoryStore.repositories[entityName].repository;
    }

    static getRepositoryInstance(entityName:string, manager:any) {
        let repository = RepositoryStore.repositoriesSources[RepositoryStore.getRepositoryByEntity(entityName)];

        return new (repository)(manager);   
    }

    static getSchemaSources(){
        let values = [];
        for(let v in RepositoryStore.repositoriesSources){
            values.push(RepositoryStore.repositoriesSources[v])
        }

        return values;
    }

    static getClassToken(RepositoryName:string){
        let classToken = null;
        let found = false;

        for(let v in RepositoryStore.repositories){
            if(RepositoryStore.repositories[v].repository === RepositoryName){
                found = true;
                classToken = RepositoryStore.repositories[v].entityToken;
                break;
            }
        }

        if( ! found ){
            throw "The current repository '" + RepositoryName + "' is not attached to any entity";
        }

        return classToken;
    }
}
