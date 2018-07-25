import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { ErrorUtils, ConnectionError, AdapterError } from '../../Errors';
import { ManagerInterface } from '../../Manager/Manager.interface';
import { ConnectorInterface } from '../ConnectorInterface';
import { Manager } from '../../Manager/Manager.service';

/**
 * This class provides functions to get connection handlers
 *
 * The below annotation is required when a class contains only static methods.
 * See https://github.com/angular/angular/issues/18867
 * @dynamic
 */
@Injectable()
export class Connector implements ConnectorInterface {

    static sqlite;

    public connection;

    constructor(
        sqlite?: SQLite
    ) {
        if (sqlite) {
            Connector.sqlite = sqlite;
        }

        if (!Connector.sqlite) {
            throw new AdapterError('Failed to load Sqlite adapter');
        }
    }

    static async load(manager: Manager): Promise<ConnectorInterface> {

        const connector = new Connector();

        connector.connection = await connector.getConnection(manager);

        manager.setConnector(connector);

        return connector;
    }

    /**
     * Get connection handler for the sqlite adapter
     * @param sqlite
     * @param configuration
     */
    getConnection(manager: ManagerInterface): Promise<SQLiteObject> {
        const configuration = manager.getConfiguration();

        return Connector.sqlite.create(configuration)
        .catch(error => {
            throw new ConnectionError(ErrorUtils.getMessage(error, 'Connection using Sqlite failed'));
        });
    }

}
