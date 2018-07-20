import { Type } from '@angular/core';

import { EntityInterface } from '../Entity/EntityInterface.interface';

export interface ManagerInterface {
    fake();
    // persist(entityInstance: EntityInterface): ManagerInterface;
    // merge(entityInstance: EntityInterface): ManagerInterface;
    // remove(entityInstance: EntityInterface): ManagerInterface;
    // removeAll(constructorObject: Type<any>): ManagerInterface;
    // flush(entityInstance?: EntityInterface);
    // asyncFlush(entityInstance: EntityInterface);
}

export interface FlushTransactionObject {
    entity: EntityInterface;
    type: string;
    hash?: string;
}
