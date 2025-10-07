'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  title: string;
  subtitle?: string;
  navigation: NavigationItem[];
  userInfo?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  onLogout: () => void;
  logo?: React.ReactNode;
}

export function Sidebar({ title, subtitle, navigation, userInfo, onLogout, logo }: SidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    // Для главных страниц проверяем точное совпадение
    if (path === '/super-admin' || path === '/dashboard') {
      return pathname === path;
    }
    // Для остальных проверяем начало пути
    return pathname?.startsWith(path);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          {logo || (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
          )}
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              {logo || (
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
              )}
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-white">{title}</h1>
                {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile User Info */}
          {userInfo && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  {userInfo.name && (
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userInfo.name}</p>
                  )}
                  {userInfo.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userInfo.email}</p>
                  )}
                  {userInfo.role && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{userInfo.role}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          {/* Desktop Header */}
          <div className="h-16 px-4 flex items-center border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              {logo || (
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
              )}
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-white">{title}</h1>
                {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Desktop User Info */}
          {userInfo && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                {userInfo.name && (
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userInfo.name}</p>
                )}
                {userInfo.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userInfo.email}</p>
                )}
                {userInfo.role && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{userInfo.role}</p>
                )}
              </div>
              <button
                onClick={onLogout}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

