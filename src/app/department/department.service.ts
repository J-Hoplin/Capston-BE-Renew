import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import {
  DepartmentNameAlreadyTaken,
  DepartmentNotFound,
} from '@src/infrastructure/exceptions';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    private readonly dataSource: DataSource,
  ) {}

  public async getAllDepartments(detail: boolean): Promise<DepartmentEntity[]> {
    const result = await this.departmentRepository.find({
      relations: {
        students: detail,
        instructors: detail,
      },
    });
    return result;
  }

  public async getDepartmentById(
    id: number,
    detail: boolean,
  ): Promise<DepartmentEntity> {
    const result = await this.departmentRepository.findOneBy({
      id,
      students: detail,
      instructors: detail,
    });
    return result;
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
      throw new DepartmentNameAlreadyTaken(body.name);
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

        return await departmentRepository.save(newDepartment);
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
    if (checkDepartmentExist) {
      throw new DepartmentNotFound();
    }
    // If user try to change department's name
    if (body.name) {
      const checkNameTaken = await this.departmentRepository.findOneBy({
        name: body.name,
      });
      if (checkNameTaken) {
        throw new DepartmentNameAlreadyTaken(body.name);
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

        // Update target department's information
        targetDepartment.name = body.name ? body.name : originalName;
        targetDepartment.phoneNumber = body.phoneNumber
          ? body.phoneNumber
          : originalPhoneNumber;
        targetDepartment.url = body.url ? body.url : originalURL;
        targetDepartment.departmentProfileURL = profile
          ? profile.destination
          : originalProfileURL;
        return await departmentRepository.save(targetDepartment);
      },
    );
    return updatedDepartment;
  }

  public async deleteDepartment() {}
}
