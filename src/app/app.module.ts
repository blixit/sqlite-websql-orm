import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Platform, Events } from '@ionic/angular';

import { SqliteWebsqlOrmModule, SchemaFactory, Manager, ADAPTERS } from 'sqlite-websql-orm';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserRepository } from '../model/user';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    SqliteWebsqlOrmModule.init({
      name: 'test-swo',
      location: 'default',
      options: {
        adapter: ADAPTERS.auto
      }
    })
  ],
  providers: [
    Platform,
    Events,
    Manager,
    UserRepository
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private schema: SchemaFactory,
    private platform: Platform,
    private events: Events,
    // private apiService: ApiService,
  ) {
    if ( this.platform.is('mobile') ) {
      this.platform.ready().then(() => {
        this.generateSchema();
      }).catch(() => {
        // console.log('mobile platform is not ready');
      });
    } else {
      this.generateSchema();
    }
  }

  generateSchema() {
    this.schema.generateSchema()
    .then(async (connectionHandler) => {
      // console.log('Succeed to create the database');
      this.events.publish('create');
    }).catch(() => {
      // console.log('Failed to create the database');
      this.events.publish('failure');
    });
  }
}
