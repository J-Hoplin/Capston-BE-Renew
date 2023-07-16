import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  MemberNotFound,
  DepartmentNotFound,
  PasswordUnmatched,
} from '@infrastructure/exceptions';
import { CreateMemberDto } from './dto/create-member.dto';
import { ConfigType } from '@nestjs/config';
import defaultConfig from '@src/config/config/default.config';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import * as bcrypt from 'bcryptjs';
import { member } from '@src/infrastructure/types';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';
import { StudentEntity } from '@src/domain/student/student.entity';
import { UpdateMemberDto } from './dto/update-member.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';
import { UpdateMemberApprovalDto } from './dto/updateMemberApproval.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    private readonly dataSource: DataSource,
    @Inject(defaultConfig.KEY)
    private readonly config: ConfigType<typeof defaultConfig>,
  ) {}

  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, +this.config.hashCount);
  }

  public async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async getAllMembers(detail: boolean): Promise<MemberEntity[]> {
    const result = await this.memberRepository.find({
      relations: {
        studentProfile: detail,
        instructorProfile: detail,
      },
    });

    return result;
  }

  public async getMemberById(id: number): Promise<MemberEntity> {
    const result = await this.memberRepository.findOneBy({
      id,
    });
    if (!result) {
      throw new MemberNotFound(`Member with id ${id} not found`);
    }
    return result;
  }

  public async getMemberByGroupId(groupId: string): Promise<MemberEntity> {
    const result = await this.memberRepository.findOneBy({
      groupId,
    });
    if (!result) {
      throw new MemberNotFound(`Member with group id ${groupId} not found`);
    }
    return result;
  }

  public async createMember(
    body: CreateMemberDto,
    profileImage: Express.Multer.File,
  ): Promise<MemberEntity> {
    // Check department exist
    const findDepartmentById = await this.departmentRepository.findOneBy({
      id: body.departmentId,
    });

    // Make exception if not exist
    if (!findDepartmentById) {
      throw new DepartmentNotFound(
        `Department with id ${body.departmentId} not found`,
      );
    }

    // encrypt password
    body.password = await this.hashPassword(body.password);

    // Create new member with transaction
    const newMember = await this.dataSource.transaction(
      async (entitymanager: EntityManager) => {
        const memberRepository = entitymanager.getRepository(MemberEntity);
        const newMember = new MemberEntity(body);
        const groupId = body.groupId;
        const departmentId = body.departmentId;
        // Set profile picture destination
        newMember.profileImgURL = profileImage
          ? profileImage.destination
          : null;

        // Set member approval
        newMember.approvedReason = 'New Member';
        // If role is instructor
        if (body.memberRole === member.Role.INSTRUCTOR) {
          // Set Pending - for admin check if it's instructor
          newMember.approved = member.Approve.PENDING;
          // Generate Instructor entity
          const newInstructor = new InstructorEntity({
            id: groupId,
            department: departmentId,
          });
          // Set Instructor Profile
          newMember.instructorProfile = newInstructor;
        }
        // Role is student
        else {
          // Set Approved
          newMember.approved = member.Approve.APPROVE;
          // Generate Student Entity
          const newStudent = new StudentEntity({
            id: groupId,
            department: departmentId,
          });
          // Set student profile
          newMember.studentProfile = newStudent;
        }
        return await memberRepository.save(newMember);
      },
    );
    return newMember;
  }

  public async updateMember(body: UpdateMemberDto): Promise<MemberEntity> {
    const findMember = await this.memberRepository.findOneBy({
      id: body.id,
    });
    // Check member exist
    if (!findMember) {
      throw new MemberNotFound(`Member with ID ${body.id} not found`);
    }
    const checkPassword = await this.comparePassword(
      body.originalpassword,
      findMember.password,
    );
    // Check password match
    if (!checkPassword) {
      throw new PasswordUnmatched();
    }
    const updatedMember = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        const memberRepository = manager.getRepository(MemberEntity);
        findMember.name = body.name ? body.name : findMember.name;
        findMember.password = body.changedpassword
          ? await this.hashPassword(body.changedpassword)
          : findMember.password;
        findMember.birth = body.birth ? body.birth : findMember.birth;
        return await memberRepository.save(findMember);
      },
    );
    return updatedMember;
  }

  public async getMemberApproval(id: number): Promise<member.Approve> {
    const findMember = await this.memberRepository.findOneBy({
      id,
    });
    if (!findMember) {
      throw new MemberNotFound(`Member with ID ${id} not found`);
    }
    return findMember.approved;
  }

  public async updateMemberApproval(
    body: UpdateMemberApprovalDto,
  ): Promise<boolean> {
    const findMember = await this.memberRepository.findOneBy({
      id: body.id,
    });
    // Check memer exist
    if (!findMember) {
      throw new MemberNotFound(`Member with ID ${body.id} not found`);
    }
    findMember.approved = body.approved;
    findMember.approvedReason = body.approvedReason;
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const memberRepository = manager.getRepository(MemberEntity);
      await memberRepository.save(findMember);
    });
    return true;
  }

  public async deleteMember(body: DeleteMemberDto): Promise<boolean> {
    const findMember = await this.memberRepository.findOneBy({
      id: body.id,
    });
    // Check member exist
    if (!findMember) {
      throw new MemberNotFound(`Member with ID ${body.id} not found`);
    }
    const checkPassword = await this.comparePassword(
      body.password,
      findMember.password,
    );
    if (!checkPassword) {
      throw new PasswordUnmatched();
    }

    await this.dataSource.transaction(async (manager: EntityManager) => {
      const memberRepository = manager.getRepository(MemberEntity);
      await memberRepository.delete(findMember);
    });
    return true;
  }
}
