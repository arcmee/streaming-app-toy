'use client';

import { useEffect, useState } from 'react';
import { getStreams } from '@repo/logic/api/stream';
import { Stream } from '@repo/logic/domain/stream';
import { Card } from '@repo/ui/card';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        const fetchedStreams = await getStreams();
        setStreams(fetchedStreams);
      } catch (err) {
        setError('Failed to fetch streams. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 style={{ marginBottom: '2rem' }}>Live Streams</h1>
        
        {loading && <p>Loading streams...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {!loading && !error && (
          <div className={styles.grid}>
            {streams.length > 0 ? (
              streams.map((stream) => (
                <Link key={stream.id} href={`/channel/${stream.userId}`} style={{ textDecoration: 'none' }}>
                  <Card title={stream.title}>
                    {stream.thumbnailUrl && (
                      <img 
                        src={stream.thumbnailUrl} 
                        alt={stream.title} 
                        style={{ width: '100%', height: 'auto', objectFit: 'cover' }} 
                      />
                    )}
                    <p>{stream.description}</p>
                    {/* In a real app, you'd fetch the user's name from the userId */}
                    <p>Streamer ID: {stream.userId}</p>
                  </Card>
                </Link>
              ))
            ) : (
              <p>No live streams right now. Check back later!</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
