import { RepositoryInterface } from '../Repository/RepositoryInterface.interface';
import { EntityInterface } from '../Entity/EntityInterface.interface';
import { ObjectRepositoryInterface } from '../Repository/ObjectRepositoryInterface';
import { Type } from '@angular/core';
import { SQLFactory } from '../Schema/SQL.service';
import { UpdateOption, SelectOption, InsertOption, DeleteOption } from '../Schema/SQLQueriesInterfaces';

export interface AdapterRepositoryInterface extends ObjectRepositoryInterface {
    setParent(repository: RepositoryInterface);

    getClassToken(): Type<any>;

    setParent(repository: RepositoryInterface) ;

    getSqlService(): SQLFactory ;

    getClassToken(): Type<any> ;

    mapArrayToObject(a) ;

    getJointures() ;


    select(options?: SelectOption): Promise<EntityInterface[]>;

    insert(object: EntityInterface, options?: InsertOption): Promise<EntityInterface>;

    update(arg: EntityInterface, options?: UpdateOption): Promise<boolean> ;

    delete(entity?: EntityInterface, options?: DeleteOption): Promise<boolean> ;


    find(id: number);

    findBy(options: any);

    findOneBy(options: any);

    findAll();

}
