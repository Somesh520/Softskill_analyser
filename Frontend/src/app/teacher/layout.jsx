import React from 'react';
import RoleLayoutWrapper from '../../components/layout/RoleLayoutWrapper';

export default function TeacherLayout({ children }) {
  return (
    <RoleLayoutWrapper role="teacher">
      {children}
    </RoleLayoutWrapper>
  );
}
