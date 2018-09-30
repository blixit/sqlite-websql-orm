import { EntityInterface } from '../Entity/EntityInterface.interface';
import { UpdateOption, SelectOption, DeleteOption, InsertOption } from '../Schema/SQLQueriesInterfaces';
import { Type } from '@angular/core';
import { SQLFactory } from '../Schema/SQL.service';

export interface RepositoryInterface {
  classToken: Type<any>;

  getRepositories(): any;

  getSqlService(): SQLFactory;

  mapArrayToObject(array: any): EntityInterface;

  getSchema(): Array<any>;

  getJointures(): Array<any>;

  select(options?: SelectOption): Promise<EntityInterface[]>;

  insert(object: EntityInterface, options?: InsertOption): Promise<EntityInterface>;

  update(arg: EntityInterface, options?: UpdateOption): Promise<boolean> ;

  delete(entity?: EntityInterface, options?: DeleteOption): Promise<boolean> ;

  find(id: number);

  findBy(options: any);

  findOneBy(options: any);

  findAll();
}
