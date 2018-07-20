import { EntityInterface } from './EntityInterface.interface';

export abstract class AbstractEntity implements EntityInterface {

    /**
     * An array to store dynamic fields
     * @param key a dynamic key
     */
    [key: string]: any;

    /**
     * The default id field for each entity
     * @param id
     */
    public id: number;

    /**
     * A field to store the interface name
     * @param __interfacename__
     */
    public __interfacename__ = 'EntityInterface';
}
