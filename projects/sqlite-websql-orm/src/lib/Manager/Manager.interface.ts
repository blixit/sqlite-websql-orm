import { Type } from '@angular/core';
import { Observable } from 'rxjs';
import { ConnectorInterface } from '../Adapters/ConnectorInterface';
import { ConfigurationInterface } from '../Configuration';
import { EntityInterface } from '../Entity/EntityInterface.interface';
import { ObjectRepositoryInterface } from '../Repository/ObjectRepositoryInterface';
import { RepositoryInterface } from './../Repository/RepositoryInterface.interface';

export interface ManagerInterface {
  reset();
  connect();
  getConnection();
  getConnector(): ConnectorInterface;
  setConnector(connector: ConnectorInterface);

  getRepository(entityType: string | Type<EntityInterface> | EntityInterface): ObjectRepositoryInterface | RepositoryInterface;
  getConfiguration(): ConfigurationInterface;
  setConfiguration(configuration: ConfigurationInterface): ManagerInterface;
  getAdapter(): string;

  persist(entityInstance: EntityInterface): ManagerInterface;
  merge(entityInstance: EntityInterface): ManagerInterface;
  remove(entityInstance: EntityInterface): ManagerInterface;
  removeAll(constructorObject: Type<any>): ManagerInterface;
  flush(entityInstance?: EntityInterface): Observable<void>;
  asyncFlush(entityInstance?: EntityInterface): Promise<any>;
}

export interface TaskInterface {
  entity: EntityInterface;
  type: string;
  hash?: string;
}
