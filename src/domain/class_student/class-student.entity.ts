import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StudentEntity } from '@domain/student/student.entity';
import { ClassEntity } from '@domain/class/class.entity';

@Entity('student_class')
export class ClassStudentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StudentEntity, (student) => student.classstudent)
  @JoinColumn({
    name: 'student_id',
  })
  students: StudentEntity;

  @ManyToOne(() => ClassEntity, (cls) => cls.classstudent)
  @JoinColumn([
    {
      name: 'class_name',
      referencedColumnName: 'name',
    },
    {
      name: 'division_number',
      referencedColumnName: 'divisionNumber',
    },
  ])
  classes: ClassEntity;
}
