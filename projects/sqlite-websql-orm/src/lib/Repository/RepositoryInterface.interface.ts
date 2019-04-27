import { EntityInterface } from '../Entity/EntityInterface.interface';
import { UpdateOption, SelectOption, DeleteOption, InsertOption } from '../Schema/SQLQueriesInterfaces';
import { Type } from '@angular/core';
import { SQLFactory } from '../Schema/SQL.service';
import { Observable } from 'rxjs';

export interface RepositoryInterface {
  classToken: Type<any>;

  getRepositories(): any;

  getSqlService(): SQLFactory;

  mapArrayToObject(array: any): EntityInterface;

  getSchema(): Array<any>;

  getJointures(): Array<any>;

  select(options?: SelectOption): Observable<EntityInterface[]>;

  insert(object: EntityInterface, options?: InsertOption): Observable<EntityInterface>;

  update(arg: EntityInterface, options?: UpdateOption): Observable<boolean>;

  delete(entity?: EntityInterface, options?: DeleteOption): Observable<boolean>;

  find(id: number): Observable<EntityInterface | null>;

  findBy(options: any): Observable<EntityInterface[]>;

  findOneBy(options: any): Observable<EntityInterface | null>;

  findAll(): Observable<EntityInterface[]>;
}
