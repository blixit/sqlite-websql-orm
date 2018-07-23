import { EntityInterface } from '../Entity/EntityInterface.interface';
import { UpdateOption } from '../Schema/SQLQueriesInterfaces';
import { Type } from '@angular/core';
import { ObjectRepositoryInterface } from './ObjectRepositoryInterface';
import { SQLFactory } from '../Schema/SQL.service';

export interface RepositoryInterface {
  classToken: Type<any>;

  getRepositories(): any;

  getSqlService(): SQLFactory;

  mapArrayToObject(array: any): EntityInterface;

  use(transaction: any): RepositoryInterface;

  getSchema(): Array<any>;

  getJointures(): Array<any>;

  select(options: Selection): Promise<EntityInterface[]>;

  insert(object: EntityInterface, options: any): Promise<EntityInterface>;

  update(arg: UpdateOption|EntityInterface): Promise<boolean> ;

  // delete(entity?: EntityInterface): Promise<boolean> ;

  find(id: number);

  findBy(options: any);

  findOneBy(options: any);

  findAll();
}
