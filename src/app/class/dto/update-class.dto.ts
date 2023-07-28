import { ApiProperty } from '@nestjs/swagger';
import { ClassEntity } from '@src/domain/class/class.entity';

export class UpdateClassDto implements Partial<ClassEntity> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  maximum_student: number;

  constructor(data: UpdateClassDto) {
    Object.assign(this, data);
  }
}
