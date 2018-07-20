import { RepositoryStore } from '../Store/RepositoryStore.service';
import { Type } from '@angular/core';

export function Repository(entity: Type<any>): any {
    if ( ! entity) {
        return;
    }

    return function (target, propertyKey: string, descriptor: PropertyDescriptor): any {

        // linking a repository to its name
        RepositoryStore.addMappedRepository(target.name, target);

        RepositoryStore.setRepositoryByEntity(entity.name, {
            repository: target.name,
            entityToken: entity
        });
    };
}
