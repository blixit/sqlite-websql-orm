/*
 * Public API Surface of sqlite-websql-orm
 */

// Adapters
export * from './lib/Adapters/AbstractAdapter';
// export * from './lib/Adapters/WebSQL/WebSQLAdapter';

// Annotations
export * from './lib/Annotations/Column';
export * from './lib/Annotations/Join';
export * from './lib/Annotations/Repository';

// Configuration
export * from './lib/Configuration';

// Errors
export * from './lib/Errors';

// Entity
export * from './lib/Entity/AbstractEntity.class';
export * from './lib/Entity/EntityInterface.interface';

// Repository
export * from './lib/Repository/RepositoryInterface.interface';
export * from './lib/Repository/EntityRepository.service';

// Manager
export * from './lib/Manager/Manager.interface';
export * from './lib/Manager/Manager.service';

// Schema
export * from './lib/Schema/SchemaFactory';
export * from './lib/Schema/SchemaInterface';
export * from './lib/Schema/SQL.service';
export * from './lib/Schema/SQLQueriesInterfaces';
export * from './lib/Schema/Type';

// Store
export * from './lib/Store/EntityStore.service';
export * from './lib/Store/RepositoryStore.service';

// Notification
export * from './lib/Notification/Notifier';

export * from './lib/sqlite-websql-orm.module';
