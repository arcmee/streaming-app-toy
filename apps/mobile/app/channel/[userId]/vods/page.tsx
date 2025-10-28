'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVodsByUserId } from '@repo/logic/api/stream';
import type { VOD } from '@repo/logic/domain/vod';

// Basic styling
const styles = {
  page: {
    padding: '2rem',
    fontFamily: 'sans-serif',
  },
  title: {
    marginBottom: '2rem',
  },
  vodList: {
    listStyle: 'none',
    padding: 0,
  },
  vodItem: {
    marginBottom: '1rem',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
  },
  vodLink: {
    textDecoration: 'none',
    color: '#007bff',
    fontWeight: 'bold',
  },
  vodDate: {
    fontSize: '0.9rem',
    color: '#666',
  },
};

export default function VodsPage({ params }: { params: { userId: string } }) {
  const [vods, setVods] = useState<VOD[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.userId) return;

    const fetchVods = async () => {
      try {
        setLoading(true);
        const fetchedVods = await getVodsByUserId(params.userId);
        setVods(fetchedVods);
      } catch (err) {
        setError('Failed to fetch VODs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVods();
  }, [params.userId]);

  if (loading) {
    return <div style={styles.page}><p>Loading VODs...</p></div>;
  }

  if (error) {
    return <div style={styles.page}><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>VODs for User {params.userId}</h1>
      {vods.length > 0 ? (
        <ul style={styles.vodList}>
          {vods.map((vod) => (
            <li key={vod.id} style={styles.vodItem}>
              <Link href={`/vod/${vod.id}`} style={styles.vodLink}>
                {vod.title}
              </Link>
              <p style={styles.vodDate}>
                Created on: {new Date(vod.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No VODs found for this user.</p>
      )}
    </div>
  );
}
