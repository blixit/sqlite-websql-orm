import { Injectable } from '@angular/core';
import { ErrorUtils, ConnectionError } from '../../Errors';
import { WebSQLAdapter } from './WebSQLAdapter';
import { ManagerInterface } from '../../Manager/Manager.interface';
import { ConnectorInterface } from '../ConnectorInterface';
import { Manager } from '../../Manager/Manager.service';
import { Observable, of, from } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ConfigurationInterface } from '../../Configuration';

/**
 * @dynamic
 */
@Injectable({
  providedIn: 'root'
})
export class Connector implements ConnectorInterface {

  public connection;

  constructor() { }

  static load(manager: Manager): Observable<ConnectorInterface> {
    const connector = new Connector();
    return connector.connect(manager.getConfiguration())
      .pipe<ConnectorInterface>(map(data => {
        connector.connection = data;
        return connector;
      }));
  }

  connect(configuration: ConfigurationInterface): Observable<any> {
    let database = null;
    const WINDOW = window as any;
    return from(new Promise<any>((resolve, reject) => {
      if (!WINDOW.openDatabase) {
        throw new ConnectionError(ErrorUtils.getMessage('No Websql database found'));
      }
      database = WINDOW.openDatabase(
        configuration.options.webname,
        configuration.options.version,
        configuration.options.description,
        configuration.options.maxsize
      );

      resolve(new WebSQLAdapter(database));
    }));
  }

  // /**
  //  * Get connection handler for the websql adapter
  //  */
  // getConnection(manager: ManagerInterface): Promise<any> {

  //   const configuration = manager.getConfiguration();

  //   return new Promise<any>((resolve, reject) => {
  //     let database = null;
  //     const WINDOW = window as any;
  //     if (WINDOW.openDatabase) {
  //       database = WINDOW.openDatabase(
  //         configuration.options.webname,
  //         configuration.options.version,
  //         configuration.options.description,
  //         configuration.options.maxsize
  //       );
  //     } else {
  //       throw new ConnectionError(ErrorUtils.getMessage('No Websql database found'));
  //     }

  //     const connection = new WebSQLAdapter(database);

  //     resolve(connection);
  //   }).catch(error => {
  //     throw new ConnectionError(ErrorUtils.getMessage(error, 'Connection using Websql failed'));
  //   });
  // }
}
