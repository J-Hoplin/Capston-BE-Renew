import { Test, TestingModule } from '@nestjs/testing';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { EnrollClassDto } from './dto/enroll-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { DeleteClassDto } from './dto/delete-class.dto';

describe('ClassController', () => {
  let controller: ClassController;
  let service: ClassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassController],
      providers: [
        {
          provide: ClassService,
          useValue: {
            getAllClass: jest.fn(),
            getClassById: jest.fn(),
            getClassByName: jest.fn(),
            getClassByInstructor: jest.fn(),
            getClassByInstructorAndName: jest.fn(),
            getClassByDepartment: jest.fn(),
            getAvailableClasses: jest.fn(),
            createNewClass: jest.fn(),
            enrollClass: jest.fn(),
            updateClass: jest.fn(),
            deleteClass: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClassController>(ClassController);
    service = module.get<ClassService>(ClassService);
  });

  describe('Class controller service call check', () => {
    it('Should call getAllClass once', async () => {
      const spy = jest.spyOn(service, 'getAllClass');
      await controller.getAllClass();
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call getClassById once', async () => {
      const spy = jest.spyOn(service, 'getClassById');
      await controller.getClassById(1);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call getClassByName once', async () => {
      const spy = jest.spyOn(service, 'getClassByName');
      await controller.getClassByName('test');
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call getClassByInstructor', async () => {
      const spy = jest.spyOn(service, 'getClassByInstructor');
      await controller.getClassByInstructor(1);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call getClassByInstructorAndName', async () => {
      const spy = jest.spyOn(service, 'getClassByInstructorAndName');
      await controller.getClassByInstructorAndName('OS', 1);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call getClassByDepartment', async () => {
      const spy = jest.spyOn(service, 'getClassByDepartment');
      await controller.getClassByDepartment(1);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call getAvailableClasses', async () => {
      const spy = jest.spyOn(service, 'getAvailableClasses');
      await controller.getAvailableClasses(1);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call createNewClass', async () => {
      const spy = jest.spyOn(service, 'createNewClass');
      await controller.createNewClass({} as CreateClassDto);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call enrollClass', async () => {
      const spy = jest.spyOn(service, 'enrollClass');
      await controller.enrollClass({} as EnrollClassDto);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call updateClass', async () => {
      const spy = jest.spyOn(service, 'updateClass');
      await controller.updateClass({} as UpdateClassDto);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call deleteClass', async () => {
      const spy = jest.spyOn(service, 'deleteClass');
      await controller.deleteClass({} as DeleteClassDto);
      expect(spy).toBeCalledTimes(1);
    });
  });
});
