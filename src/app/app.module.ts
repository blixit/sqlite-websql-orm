import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ADAPTERS, SchemaFactory, SchemaInterface, SqliteWebsqlOrmModule } from 'sqlite-websql-orm';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    SqliteWebsqlOrmModule.init({
      name: 'my_custom_database.db',
      location: 'default',
      options: {
        adapter: ADAPTERS.auto,
        webname: 'my_custom_database',
        description: 'SQLite/WebSQL database for browser',
        version: '1.0',
        maxsize: 2 * 1024 * 1024,
      },
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(schemaFactory: SchemaFactory) {
    schemaFactory.generateSchema()
      .subscribe((schema: SchemaInterface) => {
        console.log('Schema generated', schema);
      });
  }
}
