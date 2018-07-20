import { Injectable } from '@angular/core';

export interface ColumnAnnotationInfo {
    /**
     * storing the name of fieldname
     */
    name: string;

    /**
     * storing the sqlType of fieldname
     */
    type: string;

    /**
     * storing the property of fieldname
     */
    propertyKey: string;
}

@Injectable()
export class EntityStore {

    /**
     * This array links entities with their repositories
     *
     * {
     *  entityname:
     *   {
     *     name: string, // field name on the database table
     *     type: string, // sql type
     *     propertyKey: string // property name
     *   }
     * }
     */
    static columnAnnotations = {};

    /**
     * Stores the joins annotations by entity
     *
     * {
     *   entityname: [
     *     {JoinOptions, ...}
     *   ]
     * }
     */
    static jointureAnnotations = {};

    /**
     * Ensure the object that stores column informations is set
     * @param classname
     */
    static initTableSchema(classname: string) {
        EntityStore.columnAnnotations[classname] = EntityStore.columnAnnotations[classname] || [];
        return EntityStore;
    }

    static addColumnAnnotation(classname: string, columnAnnotationInfo: ColumnAnnotationInfo) {

        EntityStore.columnAnnotations[classname].push(columnAnnotationInfo);
        return EntityStore;
    }

    static getTableSchema(classname: string) {
        return EntityStore.columnAnnotations[classname];
    }

    static initJointureAnnotations(classname: string) {
        EntityStore.jointureAnnotations[classname] = EntityStore.jointureAnnotations[classname] || [];
        return EntityStore;
    }

    static setJointureAnnotations(classname: string, propertyKey: string, joinOptions: any) {

        const index = EntityStore.jointureAnnotations[classname].findIndex(element => {
            return element.propertyKey === propertyKey;
        } );

        if ( index !== -1) {
            EntityStore.jointureAnnotations[classname][index][propertyKey] = joinOptions;
        } else {
            EntityStore.jointureAnnotations[classname][propertyKey] = joinOptions ;
        }

        return EntityStore;
    }

    static getJointureAnnotations(classname: string) {
        return EntityStore.jointureAnnotations[classname];
    }

}
