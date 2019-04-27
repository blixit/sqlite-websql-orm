# SQLite-WebSQL-ORM

An orm for both sqlite and websql usable in Angular 2+ and Ionic 2+. 
[Follow us On Github](https://github.com/blixit/sqlite-websql-orm)

## [1. Installation]() 

```
npm i sqlite-websql-orm
``` 

:construction: This package is being updated to be compatible with angular 7. By the way many optimisations are done to improve the conceptual idea.


### For Angular 7, node >=11.14.0, npm 6.7.0  (In Progress):

- use versions above 2.0.0 : Not ready for npm 
- the data flow management has been changed. Promises have been replaced by Rxjs observables. To keep having the previous behavior add `.toPromise()` after your asynchronous functions.


### For Angular 6, node >=8.11, npm 6:

- use versions above 1.2.1 : `npm i sqlite-websql-orm@1.2.1` 
- the approach has been completely changed. Now you have different connectors (adapter) for each database (sqlite or websql). Using this approach, implementing IndexDb will be really easy


### For Angular 4, node <8.9:

- use the version 0.2.2 : `npm i sqlite-websql-orm@0.2.2` 


:warning: You will probably need to install manually some peer dependencies.

## [2. Usage & API](docs/usage.md)

- You can access the usage documentation here [docs/usage.md](docs/usage.md). 
- The Api is also available here [docs/api.md](docs/api.md)

## [3. Known issues](docs/issues.md)

If you get an issue please look first to the know issue or add an issue to our repository.
[docs/issues.md](docs/issues.md).

## [4. Changes from 0.2.2 to 1.0.0+]()

### 1. Configuration

- Module name has changed from **OrmModule** to **SqliteWebsqlOrmModule**
- UsefakeData has been replaced by adapter. Values of this configuration are define in **ADAPTERS** :
  - ADAPTERS.auto : let the module detect what connector/database use. The webSQL adapter will be tested before
  - ADAPTERS.sqlite : activate only the sqlite database
  - ADAPTERS.websql : activate only the websql database


```ts
// under vervion 0.2.2

imports: [
    // ...,
    OrmModule.init({
      name: 'my_custom_database.db',
      location: 'default',
      options: {
        useFakeDatabase: true,
        webname: 'my_custom_database',
        description: 'SQLite/WebSQL database for browser',
        version: '1.0',
        maxsize: 2 * 1024 * 1024
      }
    })
  ],

// above vervion 1.0.0, replace useFakeDatabase by adapter

import { SqliteWebsqlOrmModule, SchemaFactory, Manager, ADAPTERS } from 'sqlite-websql-orm';

imports: [
    // ...,
    SqliteWebsqlOrmModule.init({
      name: 'my_custom_database.db',
      location: 'default',
      options: {
        adapter: ADAPTERS.auto,
        webname: 'my_custom_database',
        description: 'SQLite/WebSQL database for browser',
        version: '1.0',
        maxsize: 2 * 1024 * 1024
      }
    })
  ],
``` 
### 2. Schema generation

- Dont need to explicitly call `RepositoryStore.getSchemaSources()` anymore 
```ts
// under vervion 0.2.2
export class AppModule {
  constructor(
    private schema: SchemaFactory,
    private platform: Platform,
  ) {
    if ( this.platform.is('mobile') ) {
      this.platform.ready().then(() => {
        this.generateSchema();
      }).catch(() => {
        console.log('mobile platform is not ready');
      });
    } else {
      this.generateSchema();
    }
  }

  generateSchema() {
    this.schema.generateSchema(RepositoryStore.getSchemaSources())   // <-- here 
    .then((db) => {
      console.log('Succeed to create the database');
      this.eventService.publish(EVENTS.database_schema_create);
    }).catch(() => {
      console.log('Failed to create the database');
      this.eventService.publish(EVENTS.database_schema_failure);
    });
  }
}

// above vervion 1.0.0, generateSchema doesnt take parameters anymore

generateSchema() {
    this.schema.generateSchema()  // <-- here 
    .then(async (connectionHandler) => {
      console.log('Succeed to create the database');
      this.events.publish('create');
    }).catch(() => {
      console.log('Failed to create the database');
      this.events.publish('failure');
    });
  }
```

###  3. Repository

- Defining the function `mapArrayToObject()` is not mandatory anymore.
- By implementing this funciton, you are overrding the internal feature.


```ts
@Injectable()
@Repository(Personne)
export class PersonneRepository extends EntityRepository {
    constructor(public manager: Manager) {
        super(manager);
    }

    /**
     * In versions above 1.0.0,
     * this functions overrides the internal one. 
     */   
    mapArrayToObject(array: any): Personne {
        const personne: Personne = new Personne();
        personne.id = array.id;
        personne.name = array.name;

        return personne;
    }
}
```

The internal function looks like the function below. An instance of the class managed by the repository is created and all the fields are copied from the database array to the instance.
```ts
mapArrayToObject(array: Array<any>): EntityInterface {

    const instance = new (this.getClassToken());

    const schema = this.getSchema();

    for (const key in schema) {
      if (key) {
        const fieldMetadata = schema[key];
        instance[fieldMetadata.propertyKey] = array[fieldMetadata.name];
      }
    }

    return instance;
  }
```

