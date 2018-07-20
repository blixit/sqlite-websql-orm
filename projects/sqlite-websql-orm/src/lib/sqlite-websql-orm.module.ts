import { NgModule           } from '@angular/core';
import { SQLite             } from '@ionic-native/sqlite';  // SQLite


import { Manager            } from './Manager/Manager.service';
import { SchemaFactory      } from './Schema/Factory.service';
import { TableFactory       } from './Schema/Table.service';

import { EntityStore        } from './Store/EntityStore.service';
import { RepositoryStore    } from './Store/RepositoryStore.service';

// import { EntityRepository   } from './Repository/EntityRepository.service';
// import { ObjectRepository   } from './Repository/ObjectRepository.service';
// import { RepositoryInterface } from './Repository/RepositoryInterface.interface';

import { Configuration        } from './Configuration';

export function getSchemaFactory(manager: Manager, tableFactory: TableFactory) {

    // let eraseDatabase = process.env.IONIC_ENV === 'prod' ? false : true;
    // https://forum.ionicframework.com/t/injecting-environment-variables-into-the-build/111875/2

    return new SchemaFactory(manager, tableFactory);
}

@NgModule({
  imports: [
  ],
  declarations: [],
  exports: [],
  providers: [

    SQLite,
    TableFactory,

    {provide: Manager, useClass: Manager, deps: [SQLite]},

    {provide: SchemaFactory, useFactory: getSchemaFactory, deps: [Manager, TableFactory]},

    RepositoryStore, EntityStore,

    // ObjectRepository, EntityRepository,

  ]
})
export class SqliteWebsqlOrmModule {
  static configuration: Configuration = new Configuration();

    constructor(
        public manager: Manager
    ) {
        this.manager.setConfiguration(SqliteWebsqlOrmModule.configuration);
    }

    static init(configuration: Configuration) {

      Configuration.merge(configuration);
      SqliteWebsqlOrmModule.configuration = configuration;

      return SqliteWebsqlOrmModule;
    }
}
