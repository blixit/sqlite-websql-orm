import { Injectable, Injector, Type } from '@angular/core';

//SQLite
import { SQLiteObject         } from '@ionic-native/sqlite';
import { Manager              } from '../Manager.service';
import { WebSqlObject         } from '../Adapters/WebSqlObject';

@Injectable()
export class ObjectRepository {

  static db = null ;

  protected currentTransaction = null;

  protected classToken: Type<any> = null;

  constructor(
    protected manager: Manager
  ){
    ObjectRepository.db = Manager.db;
    
  }

  getManager(): Manager{
    return this.manager;
  }

}
