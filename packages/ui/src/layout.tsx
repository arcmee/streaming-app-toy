'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@repo/logic/context/auth-context';

const layoutStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderBottom: '1px solid #eaeaea',
    backgroundColor: '#fff',
  },
  appName: {
    fontWeight: 'bold' as const,
    fontSize: '1.5rem',
    textDecoration: 'none',
    color: '#000',
  },
  nav: {
    display: 'flex',
    gap: '1rem',
  },
  navLink: {
    textDecoration: 'none',
    color: '#007bff',
  },
  main: {
    flex: 1,
    padding: '2rem',
    backgroundColor: '#f9f9f9',
  },
  footer: {
    padding: '2rem',
    textAlign: 'center' as const,
    borderTop: '1px solid #eaeaea',
    backgroundColor: '#fff',
  },
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div style={layoutStyles.container}>
      <header style={layoutStyles.header}>
        <Link href="/" style={layoutStyles.appName}>
          Streaming App
        </Link>
        <nav style={layoutStyles.nav}>
          {isAuthenticated ? (
            <button onClick={logout} style={{...layoutStyles.navLink, border: 'none', background: 'none', cursor: 'pointer'}}>
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" style={layoutStyles.navLink}>
                Login
              </Link>
              <Link href="/signup" style={layoutStyles.navLink}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>
      <main style={layoutStyles.main}>
        {children}
      </main>
      <footer style={layoutStyles.footer}>
        <p>&copy; {new Date().getFullYear()} Streaming App. All rights reserved.</p>
      </footer>
    </div>
  );
}
