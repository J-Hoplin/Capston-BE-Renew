import { MemberEntity } from '@src/domain/member/member.abstract';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { DepartmentEntity } from '@domain/department/department.entity';
import { ClassImageEntiy } from '@domain/class-image/classimage.entity';
import { ClassEntity } from '@domain/class/class.entity';

@Entity('instructor')
export class InstructorEntity extends MemberEntity {
  @Column({
    type: String,
    nullable: false,
  })
  lab: string;

  @ManyToOne(() => DepartmentEntity, (department) => department.instructors)
  @JoinColumn({
    name: 'department_id',
  })
  department: DepartmentEntity;

  @OneToMany(() => ClassEntity, (cls) => cls.instructor)
  classes: ClassEntity[];

  @OneToMany(() => ClassImageEntiy, (ci) => ci.instructor)
  images: ClassImageEntiy[];
}
