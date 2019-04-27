import { Observable } from 'rxjs';
import { ConfigurationInterface } from '../Configuration';

export interface ConnectorInterface {

  connection;

  // getConnection(configuration: ConfigurationInterface): Promise<any>;

  connect(configuration: ConfigurationInterface): Observable<any>;
}
