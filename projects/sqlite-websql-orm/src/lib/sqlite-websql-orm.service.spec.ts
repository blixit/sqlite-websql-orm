import { TestBed, inject } from '@angular/core/testing';

import { SqliteWebsqlOrmService } from './sqlite-websql-orm.service';

describe('SqliteWebsqlOrmService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SqliteWebsqlOrmService]
    });
  });

  it('should be created', inject([SqliteWebsqlOrmService], (service: SqliteWebsqlOrmService) => {
    expect(service).toBeTruthy();
  }));
});
