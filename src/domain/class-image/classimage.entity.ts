import { CommonEntity } from '@domain/common.abstract';
import { InstructorEntity } from '@domain/instructor/instructor.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { ClassEntity } from '../class/class.entity';
import { classImg } from '@src/infrastructure/types';

@Entity('class-image')
export class ClassImageEntiy {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({
    type: String,
    nullable: true,
  })
  @ApiProperty()
  name: string;

  @Column({
    type: String,
    nullable: true,
  })
  @ApiProperty()
  repositoryEndpoint: string;

  @Column({
    type: 'enum',
    enum: classImg.status,
    default: classImg.status.PENDING,
  })
  @ApiProperty({
    enum: classImg.status,
  })
  status: classImg.status;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @OneToMany(() => ClassEntity, (cls) => cls.class_image)
  @ApiProperty()
  classes: ClassEntity[];

  @ManyToOne(() => InstructorEntity, (ins) => ins.images, {
    cascade: true,
  })
  @JoinColumn({
    name: 'instructor_id',
  })
  @ApiProperty()
  instructor: Relation<InstructorEntity>;

  constructor(data: Partial<ClassImageEntiy>) {
    Object.assign(this, data);
  }
}
