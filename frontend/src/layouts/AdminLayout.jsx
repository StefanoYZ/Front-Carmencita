import React from 'react';
import { Outlet } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';

function AdminLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default AdminLayout;
