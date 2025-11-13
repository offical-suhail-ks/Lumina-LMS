import { useMemo } from 'react';

function useRoleRoutes(role) {
  // Configure route access/redirects per user role
  return useMemo(() => {
    if (role === 'admin') {
      return ['/dashboard', '/courses', '/calendar', '/fees', '/assignments'];
    }
    if (role === 'faculty') {
      return ['/dashboard', '/courses', '/calendar', '/assignments'];
    }
    if (role === 'student') {
      return ['/dashboard', '/courses', '/calendar', '/assignments', '/mailbox', '/fees', '/profile'];
    }
    if (role === 'parent') {
      return ['/dashboard', '/profile', '/calendar', '/fees'];
    }
    if (role === 'accounting') {
      return ['/dashboard', '/accounting/tasks', '/accounting/salaries'];
    }
    return ['/login'];
  }, [role]);
}

export default useRoleRoutes;
