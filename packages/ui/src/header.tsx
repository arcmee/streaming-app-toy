'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@repo/logic/context/auth-context';
import { Button } from './button';

export const Header = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();

  if (loading) {
    return <header>Loading...</header>;
  }

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link href="/">Home</Link>
      </div>
      <div>
        {isAuthenticated && user ? (
          <>
            <span style={{ marginRight: '1rem' }}>Welcome, {user.username}!</span>
            <Button onClick={logout}>Logout</Button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
};
