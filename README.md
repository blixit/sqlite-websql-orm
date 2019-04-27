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

## [2. Usage & API](docs/2.0.0/usage.md)

- You can access the usage documentation here [docs/usage.md](docs/2.0.0/usage.md). 
- The Api is also available here [docs/api.md](docs/2.0.0/api.md)

## [3. Known issues](docs/issues.md)

If you get an issue please look first to the know issue or add an issue to our repository.
[docs/issues.md](docs/issues.md).

## 4. Change logs

- [Changes from 1.2.1 to 2.0.0+](changes/1.2.1--2.0.0.md)
- [Changes from 0.2.2 to 1.0.0+](changes/0.2.2--1.0.0.md)
