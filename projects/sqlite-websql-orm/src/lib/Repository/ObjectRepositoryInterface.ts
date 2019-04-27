import { ManagerInterface } from '../Manager/Manager.interface';
import { EntityInterface } from '../Entity/EntityInterface.interface';
import { Observable } from 'rxjs';

export interface ObjectRepositoryInterface {
  manager: ManagerInterface;

  mapArrayToObject?(array: any): EntityInterface;

  executeSelectJoin?(object, joinField, join, item, jointures): Observable<EntityInterface>;

  find?(id: number);
}
