import { Column, AbstractEntity } from 'sqlite-websql-orm';

export class User extends AbstractEntity {
  @Column('INTEGER PRIMARY KEY')
  public id: number;

  @Column('TEXT')
  public name: string;
}
