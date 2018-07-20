import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqliteWebsqlOrmComponent } from './sqlite-websql-orm.component';

describe('SqliteWebsqlOrmComponent', () => {
  let component: SqliteWebsqlOrmComponent;
  let fixture: ComponentFixture<SqliteWebsqlOrmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SqliteWebsqlOrmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqliteWebsqlOrmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
