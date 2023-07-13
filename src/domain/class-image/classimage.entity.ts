import { CommonEntity } from '@domain/common.abstract';
import { InstructorEntity } from '@domain/instructor/instructor.entity';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  repositoryEndpoit: string;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @ManyToOne(() => InstructorEntity, (ins) => ins.images, {
    cascade: true,
  })
  @JoinColumn({
    name: 'instructor_id',
  })
  @ApiProperty()
  instructor: InstructorEntity;
}
