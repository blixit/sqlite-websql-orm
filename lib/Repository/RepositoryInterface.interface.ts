import { EntityInterface } from "../orm";

export interface SelectOption {
  conditions: Array<string>,
  fields?: string,
  limit?: string,
  order?: string,
}

export interface UpdateOption {
  id?: number,
  affectations: Array<string>,
  conditions?: Array<string>
}

export interface DeleteOption {
  id?: number,
  conditions?: Array<string>
}

export interface RepositoryInterface {

  mapArrayToObject(array:Array<any>): EntityInterface;

  // use(transaction:any, customSqliteObject:any): RepositoryInterface;

  getSchema() : Array<any>;

  executeSelectJoin(object, joinField, join, item, jointures);

  select(options: Selection): Promise<EntityInterface[]>;

  insert(object: EntityInterface, options:any): Promise<EntityInterface>;  

  update(options: UpdateOption): Promise<boolean> ;
  update(entity: EntityInterface): Promise<boolean> ;
  update(arg: any): Promise<boolean> ;

  delete(entity?: EntityInterface): Promise<boolean> ; 

  find(id:number);

  findBy(options:any);

  findOneBy(options:any);

  findAll();
}
