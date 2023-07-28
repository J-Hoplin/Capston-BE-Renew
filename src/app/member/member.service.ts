import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberEntity } from '@src/domain/member/member.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  MemberNotFound,
  DepartmentNotFound,
  PasswordUnmatched,
  GroupIDAlreadyTaken,
  EmailAlreadyTaken,
  InvalidMemberApproval,
  EmailYetConfirmed,
  DepartmentIdNotGiven,
} from '@infrastructure/exceptions';
import { CreateMemberDto } from './dto/create-member.dto';
import { ConfigType } from '@nestjs/config';
import defaultConfig from '@src/config/config/default.config';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { member } from '@src/infrastructure/types';
import { InstructorEntity } from '@src/domain/instructor/instructor.entity';
import { StudentEntity } from '@src/domain/student/student.entity';
import { UpdateMemberDto } from './dto/update-member.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';
import { UpdateMemberApprovalDto } from './dto/updateMemberApproval.dto';
import * as fs from 'fs';
import { Logger, LoggerModule } from '@hoplin/nestjs-logger';
import * as bcrypt from 'bcryptjs';

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
    private readonly logger: Logger,
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

  public async getAllMembers(
    page: number,
    pagesize: number,
  ): Promise<MemberEntity[]> {
    const result = await this.memberRepository.find({
      skip: page - 1,
      take: pagesize,
      relations: {
        studentProfile: true,
        instructorProfile: true,
      },
    });

    return result;
  }

  public async save(member: MemberEntity): Promise<MemberEntity> {
    return await this.memberRepository.save(member);
  }

  public async getMemberById(id: number): Promise<MemberEntity> {
    const result = await this.memberRepository.findOneBy({
      id,
    });
    if (!result) {
      throw new MemberNotFound();
    }
    return result;
  }

  public async getMemberByEmail(email: string): Promise<MemberEntity> {
    const result = await this.memberRepository.findOneBy({
      email,
    });
    if (!result) {
      throw new MemberNotFound();
    }
    return result;
  }

  public async getMemberByGroupId(groupId: string): Promise<MemberEntity> {
    const result = await this.memberRepository.findOneBy({
      groupId,
    });
    if (!result) {
      throw new MemberNotFound();
    }
    return result;
  }

  public async createMember(
    body: CreateMemberDto,
    profileImage?: Express.Multer.File,
  ): Promise<MemberEntity> {
    // Check group id exist
    await this.checkGidTaken(body.groupId);
    // Check email taken
    await this.checkEmailTaken(body.email);
    // encrypt password
    body.password = await this.hashPassword(body.password);
    // Create new member with transaction
    const newMember = await this.dataSource.transaction(
      async (entitymanager: EntityManager) => {
        const memberRepository = entitymanager.getRepository(MemberEntity);
        const newMember = new MemberEntity(body);
        const groupId = body.groupId;
        const departmentId = body?.departmentId;
        // Set profile picture destination
        newMember.profileImgURL = profileImage
          ? profileImage.destination
          : null;

        // Set member approval
        newMember.approvedReason = 'New Member';
        let memberSaved = await memberRepository.save(newMember);
        // If role is instructor
        if (
          body.memberRole === member.Role.INSTRUCTOR ||
          body.memberRole === member.Role.STUDENT
        ) {
          // Check department exist
          const dept = await this.departmentRepository.findOneBy({
            id: body.departmentId,
          });
          if (!dept) {
            throw new DepartmentNotFound();
          }
          switch (body.memberRole) {
            case member.Role.INSTRUCTOR:
              // Set Pending - for admin check if it's instructor
              memberSaved.approved = member.Approve.PENDING;
              // Generate Instructor entity
              const newInstructor = new InstructorEntity({
                id: memberSaved.id,
                groupId: body.groupId,
                department: dept,
              });
              // Set Instructor Profile
              memberSaved.instructorProfile = newInstructor;
              break;
            case member.Role.STUDENT:
              // Set Approved
              memberSaved.approved = member.Approve.APPROVE;
              // Generate Student Entity
              const newStudent = new StudentEntity({
                id: memberSaved.id,
                groupId: body.groupId,
                department: dept,
              });
              // Set student profile
              memberSaved.studentProfile = newStudent;
              break;
          }
          memberSaved = await memberRepository.save(memberSaved);
        }
        return memberSaved;
      },
    );
    return newMember;
  }

  public async updateMember(
    body: UpdateMemberDto,
    findMember: MemberEntity,
    file?: Express.Multer.File,
  ): Promise<MemberEntity> {
    // Check member exist
    if (!findMember) {
      throw new MemberNotFound();
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

        // Change profile image url
        if (file) {
          // Delete previous file
          fs.unlink(findMember.profileImgURL, (err) => {
            if (err) {
              this.logger.error(err);
            }
          });
          findMember.profileImgURL = file.destination;
        }

        const result = await memberRepository.save(findMember);
        this.logger.log(
          `Update member : ${findMember.name}(${findMember.groupId})`,
        );
        return result;
      },
    );
    return updatedMember;
  }

  public async checkEmailTaken(email: string) {
    const findMember = await this.memberRepository.findOneBy({
      email,
    });
    if (findMember) {
      throw new EmailAlreadyTaken();
    }
    return true;
  }

  public async checkGidTaken(gid: string) {
    const findMember = await this.memberRepository.findOneBy({
      groupId: gid,
    });
    if (findMember) {
      throw new GroupIDAlreadyTaken();
    }
    return true;
  }

  public async getMemberApproval(id: number): Promise<member.Approve> {
    const findMember = await this.memberRepository.findOneBy({
      id,
    });
    if (!findMember) {
      throw new MemberNotFound();
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
      throw new MemberNotFound();
    }
    const originalApproval = findMember.approved;
    findMember.approved = body.approved;
    findMember.approvedReason = body.approvedReason;
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const memberRepository = manager.getRepository(MemberEntity);
      await memberRepository.save(findMember);
      this.logger.log(
        `Update member's approval : ${findMember.name}(${findMember.groupId}), (${originalApproval} -> ${body.approved}, ${body.approvedReason})`,
      );
    });
    return true;
  }

  public async deleteMember(
    body: DeleteMemberDto,
    findMember: MemberEntity,
  ): Promise<boolean> {
    const checkPassword = await this.comparePassword(
      body.password,
      findMember.password,
    );
    if (!checkPassword) {
      throw new PasswordUnmatched();
    }

    await this.dataSource.transaction(async (manager: EntityManager) => {
      const memberRepository = manager.getRepository(MemberEntity);
      await memberRepository.remove(findMember);
      this.logger.log(
        `Delete member : ${findMember.name}(${findMember.groupId})`,
      );
    });
    return true;
  }

  public async checkApprovedStudent(id: number) {
    const findMember = await this.memberRepository.findOne({
      where: {
        memberRole: member.Role.STUDENT,
        id,
      },
      relations: {
        studentProfile: {
          department: true,
        },
      },
    });
    return this.memberValidate(findMember);
  }

  public async checkApprovedInstructor(id: number) {
    const findMember = await this.memberRepository.findOne({
      where: {
        memberRole: member.Role.INSTRUCTOR,
        id,
      },
      relations: {
        instructorProfile: {
          department: true,
        },
      },
    });
    return this.memberValidate(findMember);
  }

  private memberValidate(findMember: MemberEntity) {
    if (!findMember) {
      throw new MemberNotFound();
    }
    if (findMember.approved !== member.Approve.APPROVE) {
      throw new InvalidMemberApproval();
    }
    if (!findMember.emailConfirmed) {
      throw new EmailYetConfirmed();
    }
    return findMember;
  }
}
