# API

# Annotations

**@Column**

| Parameter | Description |
| --- | --- |
| type: **string** | The SQL type of the field |
| name: **string** = null | The table field to override the default class property. If omitted, the class property will be used |

For SQL types look at the Schema section.

**@Join**

| Parameter | Description |
| --- | --- |
| options: **JoinOptionsInterface** | The Join annotation allows to decorate a class field to describe how it is joined to another class |

**JoinOptionsInterface**
| Parameter | Description |
| --- | --- |
| class: **string** | The class name that will be joined |
| field?: **string** | The field in the joined class that maps the current field |
| getter: **string** | Getter function to get lazyloaded joined field |

**@Repository**

| Parameter | Description |
| --- | --- |
| classToken: **Type< EntityInterface >** | A class token that extends **AbstractEntity** |

# Configuration

**ConfigurationInterface**
| Parameter | Description |
| --- | --- |
| name: **string** | A name for your database. For instance, 'mydatabase' |
| location: **string** | A file name for your database location. The default value is 'default' |
| options: **ConfigurationOption** | Options to customize your project |

**ConfigurationOption**
| Parameter | Description |
| --- | --- |
| adapter?: string | The adapter to use. Sqlite or WebSql |
| webname?: string | The name of the project |
| erase?: boolean | Erases a table even if it exists |
| description?: string | The description of the project |
| version?: string | The version of Websql |
| maxsize?: number | The database size |

# Entity

**EntityInterface**
| Parameter | Description |
| --- | --- |
| id: number | The default id field for each entity |
| __ interfacename __: string | A field to store the interface name |
| __ hash __: number | Identifying field used by the worker |

**AbstractEntity** implements EntityInterface

# Manager

| Function | Role |
| --- | --- |
| reset() | Resets the connection and the worker |
| getConnection() | Sets and returns the connection handler following the user configuration |
| getConnector(): ConnectorInterface | Retrieve the connector |
| setConnector(connector: ConnectorInterface) | Set the connector |
| persist(entityInstance: EntityInterface): ManagerInterface | Add an obect to the queue for save |
| merge(entityInstance: EntityInterface): ManagerInterface | Add an obect to the queue for update |
| remove(entityInstance: EntityInterface): ManagerInterface | Add an obect to the queue for remove |
| removeAll(constructorObject: Type<any>): ManagerInterface | Add to the queue a request to remove a whole table |
| flush(entityInstance?: EntityInterface) | Asynchrone flush. Executes all the operations saved into the queue |
| getConfiguration(): ConfigurationInterface | Get configuration |
| setConfiguration(configuration: ConfigurationInterface): ManagerInterface | Set configuration |
| getAdapter(): string | Returns the current adapter |

# Repository
To complete

# Schema
To complete 

| SQL Type | SWO Constantes |
| --- | --- |
| NULL | Type.NULL |
| INTEGER | Type.INTEGER |
| REAL | Type.REAL |
| TEXT | Type.TEXT |
| BLOB | Type.BLOB |
| INTEGER PRIMARY KEY | Type.PKEY |

## Store
To complete