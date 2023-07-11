import { CommonEntity } from '@domain/common.abstract';
import { InstructorEntity } from '@domain/instructor/instructor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';

@Entity('class-image')
export class ClassImageEntiy extends CommonEntity {
  @Column({
    type: String,
    nullable: false,
  })
  repositoryEndpoit: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => InstructorEntity, (ins) => ins.images)
  @JoinColumn({
    name: 'instructor_id',
  })
  instructor: InstructorEntity;
}
