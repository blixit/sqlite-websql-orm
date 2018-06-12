import { EntityStore } from '../Store/EntityStore.service';

export interface JoinOptionsInterface{
    class:string,
    field?:string,
    getter:string
}

export class JoinOptions {
    class: string;
    field?: string;
    readonly defaultField: string = 'id';
    getter: string;
    setterField: string;

    constructor(options:any){
        this.class = options.class;
        this.field = options.field || this.defaultField;
        this.getter = options.getter;
        this.setterField = '__'+this.field+'__';
    }
}

export function Join (options: JoinOptionsInterface) : any{
// export const Join = function (options: JoinOptionsInterface) : any{
    let joinOptions:JoinOptions = new JoinOptions(options);
    // let joinOptions:any = options;

    // console.log("Executing Join annotation", options)

    return function (target, propertyKey?: string, descriptor?: PropertyDescriptor) : any {
 
        if(target.constructor){
            let targettedClass = target.constructor.name;
            EntityStore.jointureAnnotations[targettedClass] = EntityStore.jointureAnnotations[targettedClass] || [];

            let index = EntityStore.jointureAnnotations[targettedClass].findIndex(element => {
                return element.propertyKey == propertyKey;
            } );

            if( index !== -1){
                EntityStore.jointureAnnotations[targettedClass][index][propertyKey] = joinOptions;
            }else{
                EntityStore.jointureAnnotations[targettedClass][propertyKey] = joinOptions ;
            }
        }
    }
}               