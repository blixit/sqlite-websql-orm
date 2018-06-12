import { NgModule           } from '@angular/core';
import { SQLite             } from '@ionic-native/sqlite';  //SQLite


import { Manager            } from './Manager.service';
import { SchemaFactory      } from './SchemaFactory.service';

import { RepositoryStore    } from './Store/RepositoryStore.service';
import { EntityStore        } from './Store/EntityStore.service';

import { EntityRepository   } from './Repository/EntityRepository.service';
import { ObjectRepository   } from './Repository/ObjectRepository.service';
import { RepositoryInterface } from './Repository/RepositoryInterface.interface'; 

import { Configuration        } from './Configuration';

export function getSchemaFactory(manager : Manager){

    // let eraseDatabase = process.env.IONIC_ENV === 'prod' ? false : true;
    //https://forum.ionicframework.com/t/injecting-environment-variables-into-the-build/111875/2

    return new SchemaFactory(manager);
}

@NgModule({
    providers: [
        SQLite,

        {provide: Manager, useClass: Manager, deps:[SQLite]},

        {provide: SchemaFactory, useFactory: getSchemaFactory, deps:[Manager]},

        RepositoryStore, EntityStore,

        ObjectRepository, EntityRepository, 
    ],
    exports:[
    ]
})
export class OrmModule{
    static configuration: Configuration;

    constructor(
        public manager: Manager
    ) {
        console.log('Building the module...', this.manager);
        this.manager.setConfiguration(OrmModule.configuration);
    }

    static init(configuration: Configuration) {
        console.log('Initializing the module...', configuration);

        OrmModule.configuration = configuration;
        return OrmModule;
    }
}