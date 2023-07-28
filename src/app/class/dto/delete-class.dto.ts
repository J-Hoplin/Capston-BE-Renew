import { ApiProperty } from '@nestjs/swagger';
import { ClassEntity } from '@src/domain/class/class.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteClassDto implements Partial<ClassEntity> {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: number;
}
