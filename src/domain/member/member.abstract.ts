import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { member } from '@infrastructure/types';
import { DepartmentEntity } from '@domain/department/department.entity';
import { CommonEntity } from '../common.abstract';

export abstract class MemberEntity extends CommonEntity {
  @Column({
    type: 'datetime',
    nullable: false,
  })
  password: string;

  @Column({
    type: String,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'enum',
    enum: member.Sex,
    nullable: false,
  })
  sex: member.Sex;

  /**
   * 교직원에 대해서는 Approve를 최초 Pending으로 설정한다.
   */
  @Column({
    type: 'enum',
    enum: member.Approve,
    nullable: false,
  })
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
