import { MemberEntity } from '@src/domain/member/member.abstract';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { DepartmentEntity } from '@domain/department/department.entity';
import { ClassEntity } from '@domain/class/class.entity';

@Entity('student')
export class StudentEntity extends MemberEntity {
  @Column({
    type: String,
    nullable: false,
  })
  studentId: string;

  @ManyToOne(() => DepartmentEntity, (department) => department.students)
  @JoinColumn({
    name: 'department_id',
  })
  department: DepartmentEntity;

  @ManyToMany(() => ClassEntity)
  @JoinTable()
  classes: ClassEntity[];
}
