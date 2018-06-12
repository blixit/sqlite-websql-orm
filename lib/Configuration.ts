
export interface ConfigurationOption {
    useFakeDatabase: boolean; // true,
    webname: string; // 'pivot',
    description: string; // "Pivot SQLite database for browser",
    version: string; // "1.0",
    maxsize: number; // 2 * 1024 * 1024
}

export interface Configuration {
    name: string; // 'pivot_malnut.db',
    location: string ; // 'default',
    options: ConfigurationOption
  };