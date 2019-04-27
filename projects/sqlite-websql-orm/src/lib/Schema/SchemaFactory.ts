import { Injectable } from '@angular/core';
import { forkJoin, from, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { SchemaError } from '../Errors';
import { Manager } from '../Manager/Manager.service';
import { EntityStore } from '../Store/EntityStore.service';
import { RepositoryStore } from '../Store/RepositoryStore.service';
import { SchemaInterface } from './SchemaInterface';
import { SQLFactory } from './SQL.service';
import { Notifier } from '../Notification/Notifier';

/**
 *  @dynamic
 */
@Injectable({
  providedIn: 'root'
})
export class SchemaFactory {
  constructor(
    protected manager: Manager,
    protected sqlFactory: SQLFactory,
    protected notifier: Notifier,
  ) { }

  /**
   * Generates the database using declared repositories
   */
  generateSchema(): Observable<SchemaInterface> {
    // get repositories informations
    const repositories: Array<any> = RepositoryStore.getSchemaSources();
    const schema: SchemaInterface = { tables: new Map<string, any>() };

    //   throw new SchemaError(ErrorUtils.getMessage(e, 'Schema factory was not able to get the connection handler'));
    return this.manager.getConnection()
      .pipe(
        switchMap(connection => {
          const observables: Observable<any>[] = [];

          repositories.forEach((repository) => {
            // get the entity class of the current repository
            const classToken = RepositoryStore.getClassToken(repository.name);
            // get the table schema of the entity
            const tableSchema = EntityStore.getTableSchema(classToken.name);
            // save the table schema
            schema.tables[classToken.name] = tableSchema;

            const createTableSql: string = this.sqlFactory.getCreateTableSql({
              tableName: classToken.name,
              tableSchema,
              erase: this.manager.getConfiguration().options.erase
            });

            observables.push(from(connection.executeSql(createTableSql, [])));
          });

          return observables.length > 0
            ? forkJoin(observables)
              .pipe(switchMap(() => {
                this.notifier.notifySchemaReady(schema);
                return of(schema);
              }))
            : of(schema);
        }),
        catchError(error => {
          return throwError(new SchemaError(error.message));
        })
      );
  }
}
