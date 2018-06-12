import { RepositoryStore } from '../Store/RepositoryStore.service';
import { Type } from '@angular/core';

export function Repository(entity:Type<any>) : any{
    if( ! entity)
        return;

    return function (target, propertyKey: string, descriptor: PropertyDescriptor) :any {
        //linking a repository to its name
        RepositoryStore.repositoriesSources[target.name] = target ;

        // console.log('Attaching Entity '+entity.name + ' to repository ' + target.name)
        RepositoryStore.repositories[entity.name] = {
            repository: target.name,
            entityToken: entity
        } ;
    }
}