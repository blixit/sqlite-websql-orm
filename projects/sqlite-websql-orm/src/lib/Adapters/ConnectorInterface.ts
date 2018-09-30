import { ManagerInterface } from '../Manager/Manager.interface';
import { AdapterRepositoryInterface } from './AdapterRepositoryInterface';

export interface ConnectorInterface {

    connection;


    getConnection(manager: ManagerInterface): Promise<any>;

}
