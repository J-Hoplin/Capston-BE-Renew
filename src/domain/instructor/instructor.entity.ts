import { MemberEntity } from '@src/domain/member/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DepartmentEntity } from '@domain/department/department.entity';
import { ClassImageEntiy } from '@domain/class-image/classimage.entity';
import { ClassEntity } from '@domain/class/class.entity';
import { member } from '@src/infrastructure/types';
import { ApiProperty } from '@nestjs/swagger';

@Entity('instructor')
export class InstructorEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  // 교직원 고유번호
  @Column({
    type: String,
    nullable: false,
  })
  @ApiProperty()
  instructorNumber: string;

  // Static Role Binding
  @Column({
    type: String,
    default: member.Role.INSTRUCTOR,
  })
  @ApiProperty()
  role: member.Role.INSTRUCTOR;

  @ManyToOne(() => DepartmentEntity, (department) => department.instructors, {
    cascade: true,
  })
  @JoinColumn({
    name: 'department_id',
  })
  @ApiProperty()
  department: DepartmentEntity;

  @OneToMany(() => ClassEntity, (cls) => cls.instructor)
  @ApiProperty()
  classes: ClassEntity[];

  @OneToMany(() => ClassImageEntiy, (ci) => ci.instructor)
  @ApiProperty()
  images: ClassImageEntiy[];
}
