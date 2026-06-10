import React from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FFFFFF,#F8F9FA)]">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="px-4 py-7 sm:px-6 lg:px-8 xl:px-10">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
