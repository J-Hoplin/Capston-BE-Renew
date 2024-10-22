import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import {
  DepartmentNameAlreadyTaken,
  DepartmentNotFound,
  MemberStillBelongsToDepartment,
} from '@src/infrastructure/exceptions';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import * as fs from 'fs';
import { Logger } from '@hoplin/nestjs-logger';
import { DeleteDepartmentDto } from './dto/delete-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  public async getAllDepartments(
    page: number,
    pagesize: number,
  ): Promise<DepartmentEntity[]> {
    const result = await this.departmentRepository.find({
      skip: page - 1,
      take: pagesize,
      relations: {
        students: true,
        instructors: true,
      },
    });
    return result;
  }

  public async getDepartmentById(
    id: number,
    detail: boolean,
  ): Promise<DepartmentEntity> {
    const result = await this.departmentRepository.findOne({
      where: {
        id,
      },
      relations: {
        students: detail,
        instructors: detail,
      },
    });
    if (!result) {
      throw new DepartmentNotFound();
    }
    return result;
  }

  public async checkDepartmentNameTaken(name: string) {
    const result = await this.departmentRepository.findOneBy({
      name,
    });
    if (result) {
      throw new DepartmentNameAlreadyTaken();
    }
    return true;
  }

  public async createDepartment(
    body: CreateDepartmentDto,
    profile?: Express.Multer.File,
  ) {
    // Deparment Name should be unique
    const checkNameTaken = await this.departmentRepository.findOneBy({
      name: body.name,
    });
    if (checkNameTaken) {
      throw new DepartmentNameAlreadyTaken();
    }
    const newDepartment = await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        // Get department repository
        const departmentRepository =
          entityManager.getRepository(DepartmentEntity);
        // New department entity
        const newDepartment = new DepartmentEntity(body);

        // Set department's profile URL
        newDepartment.departmentProfileURL = profile
          ? profile.destination
          : null;

        const result = await departmentRepository.save(newDepartment);
        this.logger.log(`Department created : ${newDepartment.name}`);
        return result;
      },
    );
    return newDepartment;
  }

  public async updateDepartment(
    body: UpdateDepartmentDto,
    profile?: Express.Multer.File,
  ): Promise<DepartmentEntity> {
    // Find department with ID
    const checkDepartmentExist = await this.departmentRepository.findOneBy({
      id: body.id,
    });
    if (!checkDepartmentExist) {
      throw new DepartmentNotFound();
    }
    // If user try to change department's name
    // Ignore if same name with previous
    if (!(checkDepartmentExist.name === body.name)) {
      if (body.name) {
        const checkNameTaken = await this.departmentRepository.findOneBy({
          name: body.name,
        });
        if (checkNameTaken) {
          throw new DepartmentNameAlreadyTaken();
        }
      }
    }
    // Update
    const updatedDepartment = await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        // Get department repository
        const departmentRepository =
          entityManager.getRepository(DepartmentEntity);

        // Get department object
        const targetDepartment = await departmentRepository.findOneBy({
          id: body.id,
        });
        // Get original values
        const {
          name: originalName,
          phoneNumber: originalPhoneNumber,
          url: originalURL,
          departmentProfileURL: originalProfileURL,
        } = targetDepartment;

        // Change profile image url
        if (profile) {
          // Delte previous file
          fs.unlink(originalProfileURL, (err) => {
            if (err) {
              this.logger.error(err);
            }
          });
          targetDepartment.departmentProfileURL = profile.destination;
        }
        // Update target department's information
        targetDepartment.name = body.name ? body.name : originalName;
        targetDepartment.phoneNumber = body.phoneNumber
          ? body.phoneNumber
          : originalPhoneNumber;
        targetDepartment.url = body.url ? body.url : originalURL;
        targetDepartment.departmentProfileURL = profile
          ? profile.destination
          : originalProfileURL;
        const reuslt = await departmentRepository.save(targetDepartment);
        this.logger.log(`Department updated : ${targetDepartment.name}`);
        return reuslt;
      },
    );
    return updatedDepartment;
  }

  public async deleteDepartment(body: DeleteDepartmentDto): Promise<boolean> {
    // Find department exist
    const findDepartment = await this.departmentRepository.findOne({
      where: {
        id: body.id,
      },
      relations: {
        students: true,
        instructors: true,
      },
    });
    if (!findDepartment) {
      throw new DepartmentNotFound();
    }
    // All of the members should no t belongs to department when you want to delete it.
    if (findDepartment.students.length || findDepartment.instructors.length) {
      throw new MemberStillBelongsToDepartment();
    }
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const departmentRepository = manager.getRepository(DepartmentEntity);
      await departmentRepository.delete({
        id: findDepartment.id,
      });
      this.logger.log(`Department removed : ${findDepartment.name}`);
    });
    return true;
  }
}
