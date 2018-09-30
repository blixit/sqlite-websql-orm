import { TestBed, async } from '@angular/core/testing';
import { ManagerInterface } from '../../Manager/Manager.interface';
import { Manager } from '../../Manager/Manager.service';
import { ADAPTERS } from '../AbstractAdapter';
import { ConfigurationInterface, Configuration } from '../../Configuration';
import { Connector } from './Connector';
import { ConnectorInterface } from '../ConnectorInterface';
import { SQLite } from '@ionic-native/sqlite';

describe('WebSQL Connector', () => {
  let manager: ManagerInterface; // = new Manager(sqlite);
  const autoConfiguration: ConfigurationInterface = {
    name: 'test-swo',
    location: 'default',
    options: {
      adapter: ADAPTERS.auto
    }
  };
  const websqlConfiguration: ConfigurationInterface = {
    name: 'test-swo',
    location: 'default',
    options: {
      adapter: ADAPTERS.websql
    }
  };
  const constantes = {
    WebSQLAdapter: 'WebSQLAdapter',
    Connector: 'Connector',
    Database: 'Database'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [SQLite]
    });

    manager = new Manager( TestBed.get(SQLite) );
  }));

  it('should check the load function', async(async () => {
    manager.setConfiguration(websqlConfiguration);

    const connector: ConnectorInterface = await Connector.load(<Manager>manager);

    expect(connector).not.toBeNull('connector is null');
    expect(connector.constructor.name).toBe(constantes.Connector);
  }));

  it('should check the getConnection function', async(async () => {
    manager.setConfiguration(websqlConfiguration);

    const connector = new Connector();

    connector.connection = await connector.getConnection(manager);

    expect(connector.connection).not.toBeNull();
    expect(connector.connection.constructor.name).toBe(constantes.WebSQLAdapter);
  }));

//   it('should check the connection on autodetect configuration', async(async () => {
//     manager.setConfiguration(autoConfiguration);
//     const connection = await manager.getConnection();
//     expect(connection).not.toBeNull(connection);
//     expect(connection.constructor.name).toBe(constantes.WebSQLAdapter);
//   }));

//   it('should check the connection on websql configuration', async(async () => {
//     manager.setConfiguration(websqlConfiguration);
//     const connection = await manager.getConnection();
//     expect(connection).not.toBeNull(connection);
//     expect(connection.constructor.name).toBe(constantes.WebSQLAdapter);
//   }));

});
