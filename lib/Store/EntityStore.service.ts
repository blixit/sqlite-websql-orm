import { Injectable } from "@angular/core";


@Injectable()
export class EntityStore {
    
    static repositories = {} ;

    /**
     * This array links entities with their repositories
     * Ex : 
     * {
     *  EntityName: RepositoryName,
     *  User: UserRepository
     * }
     */
    static columnAnnotations = {};
    static jointureAnnotations = {};

    
}