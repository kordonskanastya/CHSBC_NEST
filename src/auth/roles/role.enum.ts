export enum ROLE {
  STUDENT = 'student',
  TEACHER = 'teacher',
  CURATOR = 'curator',
  ADMIN = 'admin',
  ROOT = 'root',
}

export const ROLE_LIST = [ROLE.STUDENT, ROLE.TEACHER, ROLE.CURATOR, ROLE.ADMIN, ROLE.ROOT]

export function isRoleEnough(currentRole: string, requiredRole: string) {
  if (currentRole === requiredRole) {
    return true
  }

  return currentRole && ROLE_LIST.indexOf(<ROLE>currentRole) >= ROLE_LIST.indexOf(<ROLE>requiredRole)
}
