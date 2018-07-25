import { Type } from '@angular/core';

import { EntityInterface } from '../Entity/EntityInterface.interface';
import { ConfigurationInterface } from '../Configuration';
import { ConnectorInterface } from '../Adapters/ConnectorInterface';

export interface ManagerInterface {
    reset();

    getConnection();
    getConnector(): ConnectorInterface ;
    setConnector(connector: ConnectorInterface) ;

    persist(entityInstance: EntityInterface): ManagerInterface;
    merge(entityInstance: EntityInterface): ManagerInterface;
    remove(entityInstance: EntityInterface): ManagerInterface;
    removeAll(constructorObject: Type<any>): ManagerInterface;
    flush(entityInstance?: EntityInterface);
    getConfiguration(): ConfigurationInterface;
    setConfiguration(configuration: ConfigurationInterface): ManagerInterface;


}

export interface TaskInterface {
    entity: EntityInterface;
    type: string;
    hash?: string;
}
