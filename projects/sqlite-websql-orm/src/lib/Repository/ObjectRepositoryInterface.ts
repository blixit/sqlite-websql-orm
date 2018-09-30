import { ManagerInterface } from '../Manager/Manager.interface';
import { EntityInterface } from '../Entity/EntityInterface.interface';

export interface ObjectRepositoryInterface {
    manager: ManagerInterface;

    mapArrayToObject?(array: any): EntityInterface;

    executeSelectJoin?(object, joinField, join, item, jointures);

    find?(id: number);

}
