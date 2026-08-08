import React from 'react';
import RoleLayoutWrapper from '../../components/layout/RoleLayoutWrapper';

export default function AdminLayout({ children }) {
  return (
    <RoleLayoutWrapper role="admin">
      {children}
    </RoleLayoutWrapper>
  );
}
