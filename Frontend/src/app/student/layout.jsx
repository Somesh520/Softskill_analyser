import React from 'react';
import RoleLayoutWrapper from '../../components/layout/RoleLayoutWrapper';

export default function StudentLayout({ children }) {
  return (
    <RoleLayoutWrapper role="student">
      {children}
    </RoleLayoutWrapper>
  );
}
