import { EntityInterface } from './EntityInterface.interface';

export abstract class AbstractEntity implements EntityInterface {
    //
    
    [key: string]: any;
    
    public id: number;
    public __interfacename__ = 'EntityInterface';
}