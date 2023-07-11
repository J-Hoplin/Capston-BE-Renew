import { common } from '@infrastructure/types';

export const swaggerTags: common.SwaggerTag[] = [
  { tag: 'Health Checker', description: 'API 상태 체크' },
  { tag: 'Department', description: '학과(혹은 부서) API' },
  { tag: 'Student', description: '학생 API' },
  { tag: 'Instructor', description: '교수(혹은 지도자) API' },
  { tag: 'Manager', description: '관리자 API' },
  { tag: 'Auth', description: '인증 API' },
  { tag: 'Mail', description: '메일 API, Gmail사용' },
];
