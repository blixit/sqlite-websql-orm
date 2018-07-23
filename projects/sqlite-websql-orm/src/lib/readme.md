# SQLite-WebSQL-ORM

An orm for both sqlite and websql usable in Angular 2+ and Ionic 2+. 
[Follow us On Github](https://github.com/blixit/sqlite-websql-orm)

## Installation 

```
npm i sqlite-websql-orm
``` 

:construction: This package is being updated to be compatible with angular 6. By the way many optimisations are done to improve the conceptual idea.



For Angular 4, node <8.9: 
- 

- use the version 0.2.0


For Angular 6, node >=8.11, npm 6 (upcoming):
- 

- use versions above the 1.0.0-beta
- the approach has been completely changed. Now you have different connectors (adapter) for each database (sqlite or websql). Using this approach, implementing IndexDb will be really easy
- the websql connector can be test
- the public API didn't change from 0.2.0 to 1.0.0-beta



# Usage

## 1. Define a entity


```ts
import { Column, Join, AbstractEntity } from 'sqlite-websql-orm';
import { Profession } from './profession';

export class Personne extends AbstractEntity {

    @Column('INTEGER PRIMARY KEY')
    public id: number;

    @Column('TEXT')
    public name: string; 
}

```

## 2. Join another entity

```ts
// Entity/profession.ts
import { Column, AbstractEntity } from 'sqlite-websql-orm';

export class Profession extends AbstractEntity {

    @Column('INTEGER PRIMARY KEY')
    public id: number;

    @Column('TEXT')
    public name: string = '';
}

```

```ts
// Entity/personne.ts
import { Column, Join, AbstractEntity } from 'sqlite-websql-orm';
import { Profession } from './profession';

export class Personne extends AbstractEntity {

    @Column('INTEGER PRIMARY KEY')
    public id: number;

    @Column('TEXT')
    public name: string; 

    @Join({
        class: 'Profession',
        field: 'id',
        getter: 'getProfession'
    })
    @Column('INTEGER')
    public profession: number;

    // this function returns a profession if the current instance of Personne has been retreived from the entity manager or a repository
    getProfession(): Profession {
        return null;
    }
}

```


## 3. Define repositories

Repositories need to be defined as angular services. 

1. That means the  `@Injectable()` annotation is required. 

2. Then to link a repository to its unique class, use the `@Repository` annotation.

3. A mapping function `mapArrayToObject()` is required to convert database data array into `EntityInterface` object.

```ts 
import { Repository, Manager, EntityRepository } from 'sqlite-websql-orm';
import { Injectable } from '@angular/core';
import { Personne } from '../Entity/personne';

@Injectable()
@Repository(Personne)
export class PersonneRepository extends EntityRepository {
    constructor(public manager: Manager) {
        super(manager);
    }

    mapArrayToObject(array: any): Personne {
        const personne: Personne = new Personne();
        personne.id = array.id;
        personne.name = array.name;

        return personne;
    }
}
```

## 4. Declare the module and your repositories

Now go to the module where you want to import our module and follow these steps :

### Import

```ts
import { OrmModule, RepositoryStore, SchemaFactory } from 'sqlite-websql-orm';
```

```ts
import { PersonneRepository } from './Repository/PersonneRepository';
import { ProfessionRepository } from './Repository/ProfessionRepository';
```

### Declaration

```ts
@NgModule({
  declarations: [
    AppComponent
  ],
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
  providers: [
    Platform,
    // custom service for emitting event when database is ready
    EventService,
    RepositoryStore,
    ProfessionRepository,
    PersonneRepository,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private schema: SchemaFactory,
    private platform: Platform,
    // private events: Events  //for ionic
    private eventService: EventService

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
    this.schema.generateSchema(RepositoryStore.getSchemaSources())
    .then((db) => {
      console.log('Succeed to create the database');
      this.eventService.publish(EVENTS.database_schema_create);
    }).catch(() => {
      console.log('Failed to create the database');
      this.eventService.publish(EVENTS.database_schema_failure);
    });
  }
}

```


## 5. Usage in component with Entity Manager


```ts
import { Component, OnInit  } from '@angular/core';

import { Manager as EntityManager } from 'sqlite-websql-orm';
// custom service to receive event when database is ready
import { EventService       } from '../services/event.service';
import { EVENTS             } from './app.constants';

import { Personne           } from './Entity/personne';
import { Profession         } from './Entity/profession';

import { PersonneRepository } from './Repository/PersonneRepository';
```

Component example :

```ts
export class AppComponent implements OnInit {

  constructor(
    public eventService: EventService,
    public personneRepository: PersonneRepository,
    public manager: EntityManager
  ) {

  }

  ngOnInit() {
      // this event is emitted only once. you can manage your code 
      // to avoid writing inside the callback
    this.eventService.subscribe(EVENTS.database_schema_create, async (data) => {
      // test insert
      const profession: Profession = new Profession();
      profession.id = 1;
      profession.name = 'Ingénieur';
      try {
        await this.manager.persist(profession).flush();
        console.log('profession saved', profession);
      } catch (e) {
        console.error('e', e);
      }

      // Test merge
      let profession2: Profession = new Profession();
      profession2 = Object.assign<Profession, Profession>(profession2, profession);
      profession2.name = profession.name + 'nouveau nom';

      try {
        await this.manager.merge(profession2).flush();
        console.log('profession updated', profession2);
      } catch (e) {
        console.error('e', e);
      }

      // Test remove
      try {
        await this.manager.remove(profession).flush();
        console.log('profession removed', profession);
      } catch (e) {
        console.error('e', e);
      }
 
    });
  }
}

```

You can use `await/async` to force synchronization but it is not mandatory. You can use `Promise` as well. 

```ts
this.manager.persist(profession).flush()
.then(() => {
    // use the same profession obejct
    console.log('Id = ', profession.id); // will show something like 'Id = 15'
})
.catch((error) => {
    // manage your error
})

```

## 6. Usage of repository


```ts
export class AppComponent implements OnInit {

  constructor(
    public eventService: EventService,
    public personneRepository: PersonneRepository,
    public manager: EntityManager
  ) {

  }

  ngOnInit(){
    this.personneRepository.findAll()
    .then((personnes: Personne[]) => {
        console.log('Personnes', personnes);
    })
    .cathc(error => {
        // manage your error
    })
  }
```