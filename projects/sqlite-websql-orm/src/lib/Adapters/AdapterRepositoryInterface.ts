import { RepositoryInterface } from '../Repository/RepositoryInterface.interface';
import { EntityInterface } from '../Entity/EntityInterface.interface';
import { ObjectRepositoryInterface } from '../Repository/ObjectRepositoryInterface';
import { Type } from '@angular/core';
import { SQLFactory } from '../Schema/SQL.service';
import { UpdateOption, SelectOption, InsertOption, DeleteOption } from '../Schema/SQLQueriesInterfaces';
import { Observable } from 'rxjs';

export interface AdapterRepositoryInterface extends ObjectRepositoryInterface {
  setParent(repository: RepositoryInterface);

  getClassToken(): Type<any>;

  getSqlService(): SQLFactory;

  mapArrayToObject(a);

  getJointures();

  select(options?: SelectOption): Observable<EntityInterface[]> | Promise<EntityInterface[]>;

  insert(object: EntityInterface, options?: InsertOption): Observable<EntityInterface>;

  update(arg: EntityInterface, options?: UpdateOption): Observable<boolean>;

  delete(entity?: EntityInterface, options?: DeleteOption): Observable<boolean>;

  find(id: number): Observable<EntityInterface | null>;

  findBy(options: any): Observable<EntityInterface[]>;

  findOneBy(options: any): Observable<EntityInterface | null>;

  findAll(): Observable<EntityInterface[]>;

}
