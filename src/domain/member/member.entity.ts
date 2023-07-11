import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { member } from '@infrastructure/types';

export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: String,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'datetime',
    nullable: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: member.Sex,
    nullable: false,
  })
  sex: member.Sex;

  @Column({
    type: 'datetime',
    nullable: false,
  })
  birth: Date;

  @Column({
    type: String,
    nullable: true,
  })
  profileImgURL: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
