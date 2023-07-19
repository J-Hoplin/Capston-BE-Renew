import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DeleteDepartmentDto } from './dto/delete-department.dto';

describe('DepartmentController', () => {
  let controller: DepartmentController;
  let service: DepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
      providers: [
        {
          provide: DepartmentService,
          useValue: {
            getAllDepartments: jest.fn(),
            getDepartmentById: jest.fn(),
            createDepartment: jest.fn(),
            updateDepartment: jest.fn(),
            deleteDepartment: jest.fn(),
            checkDepartmentNameTaken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DepartmentController>(DepartmentController);
    service = module.get<DepartmentService>(DepartmentService);
  });
  describe('Department controller service call check', () => {
    it('Should call get all department once', async () => {
      const spy = jest.spyOn(service, 'getAllDepartments');
      await controller.getAllDepartments();
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call getDepartmentById once', async () => {
      const spy = jest.spyOn(service, 'getDepartmentById');
      await controller.getDepartmentById(1);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call createDepartment once', async () => {
      const spy = jest.spyOn(service, 'createDepartment');
      await controller.createDepartment({} as CreateDepartmentDto);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call checkDepartmentNameTaken', async () => {
      const spy = jest.spyOn(service, 'checkDepartmentNameTaken');
      await controller.checkDepartmentNameTaken('test');
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call updateDepartment once', async () => {
      const spy = jest.spyOn(service, 'updateDepartment');
      await controller.updateDepartment({} as UpdateDepartmentDto);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call deleteDepartment once', async () => {
      const spy = jest.spyOn(service, 'deleteDepartment');
      await controller.deleteDepartment({} as DeleteDepartmentDto);
      expect(spy).toBeCalledTimes(1);
    });
  });
});
