import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
// import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { ErrorUtils, ConnectionError, AdapterError } from '../../Errors';
import { ManagerInterface } from '../../Manager/Manager.interface';
import { ConnectorInterface } from '../ConnectorInterface';
import { Manager } from '../../Manager/Manager.service';
import { ConfigurationInterface } from '../../Configuration';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/**
 * This class provides functions to get connection handlers
 *
 * The below annotation is required when a class contains only static methods.
 * See https://github.com/angular/angular/issues/18867
 * @dynamic
 */
@Injectable({
  providedIn: 'root'
})
export class Connector implements ConnectorInterface {

  static sqlite;

  public connection;

  constructor(sqlite: SQLite) {
    Connector.sqlite = sqlite;

    if (!Connector.sqlite) {
      throw new AdapterError('Failed to load Sqlite Connector');
    }
  }

  static load(manager: Manager, sqlite: SQLite): Observable<ConnectorInterface> {
    const connector = new Connector(sqlite);

    return connector.connect(manager.getConfiguration())
      .pipe<ConnectorInterface>(
        switchMap(connetion => {
          connector.connection = connetion;
          return of(connector);
        })
      );
  }

  connect(configuration: ConfigurationInterface): Observable<any> {
    return Connector.sqlite.create(configuration)
      .catch(error => {
        return throwError(new ConnectionError(ErrorUtils.getMessage(error, 'Connection using Sqlite failed')));
      });
  }

  // /**
  //  * Get connection handler for the sqlite adapter
  //  */
  // getConnection(manager: ManagerInterface): Promise<SQLiteObject> {
  //   const configuration = manager.getConfiguration();

  //   return Connector.sqlite.create(configuration)
  //     .catch(error => {
  //       throw new ConnectionError(ErrorUtils.getMessage(error, 'Connection using Sqlite failed'));
  //     });
  // }

}
