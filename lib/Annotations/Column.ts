import { EntityStore } from '../Store/EntityStore.service';
import { AbstractEntity } from '../Entity/AbstractEntity.class';


export function Column (type:string, name:string = null) : any {
// export const Column = function  (type:string, name:string = null) : any {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) : any {
  
        //setting sqlType of fieldname 
        if(target.constructor){
            let targettedClass = target.constructor.name;
            EntityStore.columnAnnotations[targettedClass] = EntityStore.columnAnnotations[targettedClass] || [];

            EntityStore.columnAnnotations[targettedClass].push({
                name: name || propertyKey,
                type: type,
                propertyKey: propertyKey,
            });
        }
    }
  }

  // ARCHIVED
  // export const Column = function(type:string, name:string = null){
  //     return function (target, propertyKey: string, descriptor: PropertyDescriptor) : any {
  //         //TypedPropertyDescriptor<any>
  
  //         function ff(){
  //             //setting sqlType of fieldname 
  //             if(target.constructor){
  //                 let targettedClass = target.constructor.name;
  //                 EntityStore.columnAnnotations[targettedClass] = EntityStore.columnAnnotations[targettedClass] || [];
  
  //                 EntityStore.columnAnnotations[targettedClass].push({
  //                     name: name || propertyKey,
  //                     type: type,
  //                     propertyKey: propertyKey,
  //                 });
  
  //                 return new target();
  //             }
  //         }
  
  //         return descriptor;// <typeof AbstractEntity><any>ff;
  //     }
  // }