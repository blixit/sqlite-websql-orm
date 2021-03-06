import { EntityStore } from '../Store/EntityStore.service';

/**
 * The Column annotation allows to decorate a class field to describe the column property
 *
 * @param type The SQL type of the field
 * @param name The table field to override the default class property.
 * If omitted, the class property will be used
 */
export function Column (type: string, name: string = null): any {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor): any {

        // ensure the target has a constructor before to continue
        if (target.constructor) {
            const targettedClass = target.constructor.name;

            // ensure the store is ready for the targetted class
            EntityStore.initTableSchema(targettedClass);

            // associate the column field to the targetted class
            EntityStore.addColumnAnnotation(targettedClass, {
                // storing the name of fieldname
                name: name || propertyKey,
                // storing the sqlType of fieldname
                type: type,
                // storing the property of fieldname
                propertyKey: propertyKey,
            });
        }
    };
}
