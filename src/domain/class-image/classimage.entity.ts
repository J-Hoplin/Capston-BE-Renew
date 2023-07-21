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
  UpdateDateColumn,
} from 'typeorm';
import { ClassEntity } from '../class/class.entity';
import { classImg } from '@src/infrastructure/types';

@Entity('class-image')
export class ClassImageEntiy extends CommonEntity {
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

  @ApiProperty()
  @Column({
    type: String,
    nullable: false,
  })
  instructor_id: string;

  @OneToMany(() => ClassEntity, (cls) => cls.class_image)
  @ApiProperty()
  classes: ClassEntity[];

  constructor(data: Partial<ClassImageEntiy>) {
    super();
    Object.assign(this, data);
  }
}
