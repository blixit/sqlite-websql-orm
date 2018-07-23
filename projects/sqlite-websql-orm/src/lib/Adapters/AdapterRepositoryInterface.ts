import { RepositoryInterface } from '../Repository/RepositoryInterface.interface';
import { EntityInterface } from '../Entity/EntityInterface.interface';
import { ObjectRepositoryInterface } from '../Repository/ObjectRepositoryInterface';
import { Type } from '@angular/core';
import { SQLFactory } from '../Schema/SQL.service';
import { UpdateOption } from '../Schema/SQLQueriesInterfaces';

export interface AdapterRepositoryInterface extends ObjectRepositoryInterface {
    setParent(repository: RepositoryInterface);

    getClassToken(): Type<any>;

    setParent(repository: RepositoryInterface) ;

    getSqlService(): SQLFactory ;

    getClassToken(): Type<any> ;

    mapArrayToObject(a) ;

    getJointures() ;


    select(options: Selection): Promise<EntityInterface[]>;

    insert(object: EntityInterface, options?: any): Promise<EntityInterface>;

    update(arg: UpdateOption|EntityInterface): Promise<boolean> ;

    delete(entity?: EntityInterface): Promise<boolean> ;


    find(id: number);

    findBy(options: any);

    findOneBy(options: any);

    findAll();

}
