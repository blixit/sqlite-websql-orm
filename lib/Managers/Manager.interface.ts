import { EntityInterface } from "../orm";
import { Type } from "@angular/core";

export interface ManagerInterface {
    flush();
    persist(entityInstance: EntityInterface): ManagerInterface;
    merge(entityInstance: EntityInterface): ManagerInterface;
    remove(entityInstance: EntityInterface): ManagerInterface;
    removeAll(constructorObject: Type<any>): ManagerInterface;
    flush(entityInstance: EntityInterface);
    asyncFlush(entityInstance: EntityInterface);
}

export interface FlushTransactionObject {
    entity: EntityInterface;
    type: string;
    hash?: string;
  }