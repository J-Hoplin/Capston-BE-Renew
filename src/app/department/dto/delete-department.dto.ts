import { ApiProperty } from '@nestjs/swagger';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteDepartmentDto implements Partial<DepartmentEntity> {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id!: number;
}
