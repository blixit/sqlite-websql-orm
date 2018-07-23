import { Injectable } from '@angular/core';
import { ErrorUtils, ConnectionError } from '../../Errors';
import { WebSQLAdapter } from './WebSQLAdapter';
import { ManagerInterface } from '../../Manager/Manager.interface';
import { ConnectorInterface } from '../ConnectorInterface';
import { Manager } from '../../Manager/Manager.service';

/**
 * @dynamic
 */
@Injectable()
export class Connector implements ConnectorInterface {

    public connection;


    constructor() {}


    static async load(manager: Manager): Promise<ConnectorInterface> {
        const connector = new Connector();

        connector.connection = await connector.getConnection(manager);

        manager.setConnector(connector);

        return connector;
    }

    /**
     * Get connection handler for the websql adapter
     * @param manager
     */
    getConnection(manager: ManagerInterface): Promise<any> {

        const configuration = manager.getConfiguration();

        return new Promise<any>((resolve, reject) => {
            let database = null;

            if (window['openDatabase']) {
                database = window['openDatabase'](
                    configuration.options.webname,
                    configuration.options.version,
                    configuration.options.description,
                    configuration.options.maxsize
                );
            } else {
                throw new ConnectionError(ErrorUtils.getMessage('No Websql database found'));
            }

            const connection = new WebSQLAdapter(database);

            resolve(connection);
        }).catch(error => {
            throw new ConnectionError(ErrorUtils.getMessage(error, 'Connection using Websql failed'));
        });
    }
}
