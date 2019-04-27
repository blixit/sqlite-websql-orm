import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SchemaInterface } from '../Schema/SchemaInterface';

@Injectable()
export class Notifier {
  protected schemaNotifier: BehaviorSubject<SchemaInterface> = new BehaviorSubject(null);
  protected connectorNotifier: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Wait for schema creation
   */
  onSchemaReady(): Observable<SchemaInterface> {
    return this.schemaNotifier.pipe(filter(x => x != null));
  }

  /**
   * Notify that the schema has been created
   */
  notifySchemaReady(schema: SchemaInterface) {
    this.schemaNotifier.next(schema);
  }

  /**
   * Wait for new connection
   */
  onConnectorChanged(): Observable<boolean> {
    return this.connectorNotifier.pipe(filter(x => x !== false));
  }

  /**
   * Notify that the schema has been created
   */
  notifyConnectorChanged() {
    this.connectorNotifier.next(true);
  }
}
