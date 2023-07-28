import { common } from '@infrastructure/types';

export const swaggerTags: common.SwaggerTag[] = [
  { tag: 'Health Checker', description: 'API 상태 체크' },
  { tag: 'Department', description: '학과(혹은 부서) API' },
  { tag: 'Member', description: '전체 회원 관련 API' },
  { tag: 'Auth', description: '인증 관련 API' },
  { tag: 'Class', description: '수업 관련 API' },
  { tag: 'Class-Image', description: '수업 컨테이너 이미지 관련 API' },
  { tag: 'Instructor', description: '교직원 관련 API' },
  { tag: 'Student', description: '학생관련 API' },
];
