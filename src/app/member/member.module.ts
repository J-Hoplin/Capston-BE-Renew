import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from '@domain/member/member.entity';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { ConfigModule } from '@nestjs/config';
import defaultConfig from '@src/config/config/default.config';
import { DepartmentEntity } from '@src/domain/department/department.entity';
import { LoggerModule } from '@hoplin/nestjs-logger';

@Module({
  imports: [
    LoggerModule.forFeature(),
    TypeOrmModule.forFeature([MemberEntity, DepartmentEntity]),
  ],
  providers: [MemberService],
  controllers: [MemberController],
})
export class MemberModule {}
