import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { SqliteWebsqlOrmModule } from 'sqlite-websql-orm';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SqliteWebsqlOrmModule.init({
      name: 'test-swo',
      location: 'default',
      options: {
        adapter: 'websql'
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
