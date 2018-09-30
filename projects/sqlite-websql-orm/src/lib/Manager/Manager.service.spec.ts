import { TestBed, async } from '@angular/core/testing';
import { ManagerInterface } from './Manager.interface';
import { Manager } from './Manager.service';
import { ConfigurationInterface } from '../Configuration';
import { ADAPTERS } from '../Adapters/AbstractAdapter';
import { ConnectionError } from '../Errors';
import { SQLite } from '@ionic-native/sqlite';

describe('Manager', () => {
  let manager: ManagerInterface;
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
  const sqliteConfiguration: ConfigurationInterface = {
    name: 'test-swo',
    location: 'default',
    options: {
      adapter: ADAPTERS.sqlite
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

  afterEach(async(() => {
    manager.reset();
  }));

  it('should check the connection on autodetect configuration', async(async () => {
    manager.setConfiguration(autoConfiguration);
    const connection = await manager.getConnection();
    expect(connection).not.toBeNull(connection);
    expect(connection.constructor.name).toBe(constantes.WebSQLAdapter); // since the test environment is a browser
  }));

  it('should check the connection on websql configuration', async(async () => {
    manager.setConfiguration(websqlConfiguration);
    const connection = await manager.getConnection();
    expect(connection).not.toBeNull(connection);
    expect(connection.constructor.name).toBe(constantes.WebSQLAdapter);
  }));

  it('should check the connection on sqlite configuration', async(async () => {
    manager.setConfiguration(sqliteConfiguration);
    let connection = null;
    try {
        connection = await manager.getConnection();
    } catch (error) {
        expect(connection).toBeNull();
    }

  }));

});
