import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { member } from '@infrastructure/types';
import { DepartmentEntity } from '@domain/department/department.entity';
import { CommonEntity } from '../common.abstract';
import { StudentEntity } from '@domain/student/student.entity';
import { InstructorEntity } from '@domain/instructor/instructor.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('Member')
export class MemberEntity extends CommonEntity {
  @Column({
    type: String,
    nullable: false,
  })
  @ApiProperty()
  password: string;

  @Column({
    type: String,
    nullable: false,
    unique: true,
  })
  @ApiProperty()
  email: string;

  // 학번 혹은 교직원 번호
  @Column({
    type: String,
    nullable: false,
    unique: true,
  })
  groupId: string;

  @Column({
    type: 'enum',
    enum: member.Sex,
    nullable: false,
  })
  @ApiProperty()
  sex: member.Sex;

  /**
   * 교직원에 대해서는 Approve를 최초 Pending으로 설정한다.
   */
  @Column({
    type: 'enum',
    enum: member.Approve,
    nullable: false,
  })
  @ApiProperty()
  approved: member.Approve;

  @Column({
    type: 'datetime',
    nullable: false,
  })
  @ApiProperty()
  birth: Date;

  @Column({
    type: String,
    nullable: true,
  })
  @ApiProperty()
  profileImgURL: string;

  @Column({
    type: 'enum',
    enum: member.Role,
    nullable: false,
  })
  @ApiProperty()
  memberRole: member.Role;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @OneToOne(() => StudentEntity, {
    cascade: true,
  })
  @JoinColumn({
    name: 'student_profile',
  })
  @ApiProperty()
  studentProfile: StudentEntity;

  @OneToOne(() => InstructorEntity, {
    cascade: true,
  })
  @JoinColumn({
    name: 'instructor_profile',
  })
  @ApiProperty()
  instructorProfile: InstructorEntity;
}
