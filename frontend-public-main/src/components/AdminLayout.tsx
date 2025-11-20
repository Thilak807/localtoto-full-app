import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem('adminAccess');
      localStorage.removeItem('adminRefresh');
      localStorage.removeItem('adminPhone');
    } catch {}
    navigate('/admin/login', { replace: true });
  };

  const menuItems = [
    { to: '.', label: 'Dashboard', end: true },
    { to: 'rides', label: 'Rides' },
    { to: 'users', label: 'Users' },
    { to: 'drivers', label: 'Drivers' },
    { to: 'driver-requests', label: 'Driver Requests' },
    { to: 'contact-messages', label: 'Contact Messages' },
    { to: 'settings', label: 'Settings' },
  ];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md ${isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <span className="text-xl font-semibold text-green-600">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navLinkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <span className="text-xl font-semibold text-green-600">Admin</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
          <div className="flex items-center">
            <img 
              src="/full_logo.png" 
              alt="Local ToTo" 
              className="h-8 object-contain mr-2"
            />
            <span className="text-lg font-medium">Admin</span>
          </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </header>
        <main className="p-6">
          <div className="container-classic">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;



