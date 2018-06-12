import { RepositoryStore } from '../Store/RepositoryStore.service';

export function Entity(repository:string) : any{
// export const Entity = function (repository:string) : any{
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) :any {
        //setting repository of className
        // console.log('Attaching Entity '+target.name+' to repository ' + repository)
        // RepositoryStore.repositories[target.name] = {
        //     repository: repository,
        //     entityToken: target
        // } ;
    }
}