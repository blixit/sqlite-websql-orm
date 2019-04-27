import { Notifier } from './Notification/Notifier';
import { NgModule, Injector } from '@angular/core';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { Configuration } from './Configuration';
import { Manager } from './Manager/Manager.service';
import { EntityRepository } from './Repository/EntityRepository.service';
import { SchemaFactory } from './Schema/SchemaFactory';
import { SQLFactory } from './Schema/SQL.service';
import { EntityStore } from './Store/EntityStore.service';
import { RepositoryStore } from './Store/RepositoryStore.service';

export function getSchemaFactory(manager: Manager, sqlFactory: SQLFactory, notifier: Notifier) {

  // let eraseDatabase = process.env.IONIC_ENV === 'prod' ? false : true;
  // https://forum.ionicframework.com/t/injecting-environment-variables-into-the-build/111875/2

  return new SchemaFactory(manager, sqlFactory, notifier);
}

/**
 *  @dynamic
 */
@NgModule({
  providers: [
    Notifier,
    SQLite,
    { provide: Manager, useClass: Manager, deps: [SQLite, Notifier] },
    { provide: SQLFactory, useClass: SQLFactory, deps: [] },
    { provide: SchemaFactory, useFactory: getSchemaFactory, deps: [Manager, SQLFactory, Notifier] },
    RepositoryStore, EntityStore,
  ]
})
export class SqliteWebsqlOrmModule {
  static configuration: Configuration = new Configuration();

  constructor(public manager: Manager, private injector: Injector) {
    Manager.injector = injector;
    this.manager.setConfiguration(SqliteWebsqlOrmModule.configuration);
  }

  static init(configuration: Configuration) {
    Configuration.merge(configuration);
    SqliteWebsqlOrmModule.configuration = configuration;

    return SqliteWebsqlOrmModule;
  }
}
