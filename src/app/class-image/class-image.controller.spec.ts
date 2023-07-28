import { Test, TestingModule } from '@nestjs/testing';
import { ClassImageController } from './class-image.controller';
import { ClassImageService } from './class-image.service';
import { PatchImageStatusDto } from './dto/patch-image-status.dto';
import { CreateImageDto } from './dto/create-image.dto';
import { DeleteDepartmentDto } from '../department/dto/delete-department.dto';

describe('ClassImageController', () => {
  let controller: ClassImageController;
  let service: ClassImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassImageController],
      providers: [
        {
          provide: ClassImageService,
          useValue: {
            getAllClassImages: jest.fn(),
            getClassImageById: jest.fn(),
            getClassImageStatus: jest.fn(),
            changeStatus: jest.fn(),
            createClassImage: jest.fn(),
            deleteClassImage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClassImageController>(ClassImageController);
    service = module.get<ClassImageService>(ClassImageService);
  });

  describe("It should call it's service once", () => {
    it('Should call getAllClassIages', async () => {
      const spy = jest.spyOn(service, 'getAllClassImages');
      await controller.getAllClassImages(1, 10);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call getClassImageById', async () => {
      const spy = jest.spyOn(service, 'getClassImageById');
      await controller.getClassImageById(1);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call getClassImageStatus', async () => {
      const spy = jest.spyOn(service, 'getClassImageStatus');
      await controller.getClassImageStatus(1);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call changeStatus', async () => {
      const spy = jest.spyOn(service, 'changeStatus');
      await controller.changeStatus({} as PatchImageStatusDto);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call createClassImage', async () => {
      const spy = jest.spyOn(service, 'createClassImage');
      await controller.createClassImage({} as CreateImageDto);
      expect(spy).toBeCalledTimes(1);
    });

    it('Should call deleteClassImage', async () => {
      const spy = jest.spyOn(service, 'deleteClassImage');
      await controller.deleteClassImage({} as DeleteDepartmentDto);
      expect(spy).toBeCalledTimes(1);
    });
  });
});
