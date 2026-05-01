import React from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
