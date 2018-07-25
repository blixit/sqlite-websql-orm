import { ManagerInterface } from '../../Manager/Manager.interface';
import { SQLFactory } from '../../Schema/SQL.service';
import { AdapterRepositoryInterface } from '../AdapterRepositoryInterface';
import { EntityInterface } from '../../Entity/EntityInterface.interface';
import { UpdateOption, DeleteOption, InsertOption, SelectOption } from '../../Schema/SQLQueriesInterfaces';
import { AbstractRepository } from '../AbstractRepository';

export class Repository extends AbstractRepository implements AdapterRepositoryInterface {

    private sqlService: SQLFactory;

    constructor(public manager: ManagerInterface) {
      super();
      this.sqlService = new SQLFactory();
    }


    select(options?: SelectOption): Promise<EntityInterface[]> {
        return null;
    }


    insert(object: EntityInterface, options?: InsertOption): Promise<EntityInterface> {
        return null;
    // const sql = this.sqlService.getInsertSql(this.classToken.name, object);

    // return new Promise<EntityInterface>((resolve, reject) => {
    //   const t = this.getTransaction();

    //   // define callbacks
    //   const successCallback = (res) => {
    //     StaticEntityRepository.mapResultsForInsert(res, this, resolve, reject, options);
    //   };
    //   const errorCallback = (e) => {
    //     reject(e);
    //   };


    //   switch (this.getManager().getAdapter()) {
    //     case ADAPTERS.websql: {
    //       t.executeSql(sql, [], (tx, resultSet) => {
    //         successCallback(resultSet);
    //       }, errorCallback);
    //     }
    //     break;
    //     case ADAPTERS.sqlite: {
    //       t.executeSql(sql, []).then(successCallback).catch(errorCallback);
    //     }
    //     break;
    //   }
    // });
    }


    update(arg: EntityInterface, options?: UpdateOption): Promise<boolean> {
      return null;
      // let sql: string;

      // if (arg['__interfacename__'] && arg['__interfacename__'] === 'EntityInterface') {
      //     // arg == entity: EntityInterface

      //     const options: UpdateOption = {
      //         id: arg.id,
      //         affectations: [],
      //         conditions: ['id = ' + arg.id]
      //     };

      //     sql = this.getSqlService().getUpdateSql(this.getClassToken().name, options, <EntityInterface>arg);
      // } else {
      //     // arg == options: UpdateOption

      //     sql = this.getSqlService().getUpdateSql(this.getClassToken().name, <UpdateOption>arg);
      // }

      // // Promise
      // return new Promise<boolean>((resolve, reject) => {

      //   const t = this.manager.getConnector().connection;

      //     // define callbacks
      //     const successCallback = (res) => {
      //         resolve(true);
      //     };
      //     const errorCallback = (e) => {
      //         reject(e);
      //     };

      //     switch (this.getManager().getAdapter()) {
      //         case ADAPTERS.websql: {
      //             t.executeSql(sql, []).then(successCallback).catch(errorCallback);
      //         }
      //         break;
      //         case ADAPTERS.sqlite: {
      //             t.executeSql(sql, [], (tx, resultSet) => {
      //             successCallback(resultSet);
      //             }, errorCallback);
      //         }
      //         break;
      //     }
      // });
    }


    delete(entity?: EntityInterface, options?: DeleteOption): Promise<boolean> {
        return null;
    }


}
