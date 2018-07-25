import { SQLiteDatabaseConfig } from '@ionic-native/sqlite';
import { ADAPTERS } from './Adapters/AbstractAdapter';

export interface ConfigurationOption {
    /**
     * The adapter to use. Sqlite or WebSql
     * @param adapter
     */
    adapter?:        string;

    /**
     * The name of the project
     * @param webname
     */
    webname?:       string;

    /**
     * Erases a table even if it exists
     * @param erase
     */
    erase?:         boolean;

    /**
     * The description of the project
     * @param description
     */
    description?:   string;

    /**
     * The version of Websql
     * @param version
     */
    version?:       string;

    /**
     * The database size
     * @param maxsize
     */
    maxsize?:       number;
}

export interface ConfigurationInterface extends SQLiteDatabaseConfig {
    // /**
    //  * A name for your database. For instance, 'mydatabase'
    //  * @param name
    //  */
    // name: string;

    // /**
    //  * A file name for your database location. The default value is 'default'
    //  * @param location
    //  */
    // location: string; // 'default';

    /**
     * Options to customize your project
     * @param options
     */
    options: ConfigurationOption;

    /**
     * Fill empty configuration field with defautl values
     * @param configuration
     */
    merge?(configuration: ConfigurationInterface): void ;
}

export class Configuration implements ConfigurationInterface {
    name: string;
    location: string;
    options: ConfigurationOption;

    /**
     * Fill empty configuration field with defautl values
     * @param configuration
     */
    static merge(configuration: ConfigurationInterface): void {

        configuration.options = Object.assign<ConfigurationOption, any>(
            configuration.options,
            {
                adapter: configuration.options.adapter || ADAPTERS.auto,
                webname: configuration.options.webname || 'SWO Project',
                erase: configuration.options.erase || false,
                description: configuration.options.description || 'SWO database for browser and mobile storage',
                version: configuration.options.version || '1.0',
                maxsize: configuration.options.maxsize || 2097152, // 2 * 1024 * 1024,
            }
        );
    }
}
