import { EntityStore } from '../Store/EntityStore.service';

export interface JoinOptionsInterface {
    /**
     * @property The class name that will be joined
     */
    class: string;

    /**
     * @property The field in the joined class that maps the current field
     */
    field?: string;

    /**
     * @property Getter function to get lazyloaded joined field
     */
    getter: string;
}

export class JoinOptions {
    class: string;
    field?: string;
    readonly defaultField: string = 'id';
    getter: string;
    setterField: string;

    constructor(options: any) {
        this.class = options.class;
        this.field = options.field || this.defaultField;
        this.getter = options.getter;
        this.setterField = '__' + this.field + '__';
    }
}

/**
 * The Join annotation allows to decorate a class field to describe how it is joined to another class
 *
 * @param options
 */
export function Join (options: JoinOptionsInterface): any {
    return function (target, propertyKey?: string, descriptor?: PropertyDescriptor): any {
        const joinOptions: JoinOptions = new JoinOptions(options);

        if (target.constructor) {

            const targettedClass = target.constructor.name;

            EntityStore
            .initJointureAnnotations(targettedClass)
            .setJointureAnnotations(targettedClass, propertyKey, joinOptions);
        }
    };
}
