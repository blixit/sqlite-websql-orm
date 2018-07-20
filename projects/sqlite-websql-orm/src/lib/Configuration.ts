export interface ConfigurationOption {
    /**
     * The adapter to use. Sqlite or WebSql
     * @param adapter
     */
    adapter:        string;

    /**
     * The name of the project
     * @param webname
     */
    webname?:       string;

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

export interface ConfigurationInterface {
    /**
     * A name for your database. For instance, 'mydatabase'
     * @param name
     */
    name: string;

    /**
     * A file name for your database location. The default value is 'default'
     * @param location
     */
    location: string; // 'default';

    /**
     * Options to customize your project
     * @param options
     */
    options: ConfigurationOption;
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
                webname: configuration.options.webname || 'SWO Project',
                description: configuration.options.description || 'SWO database for browser and mobile storage',
                version: configuration.options.version || '1.0',
                maxsize: configuration.options.maxsize || 2097152, // 2 * 1024 * 1024,
            }
        );
    }
}
