'use client';

import { useEffect, useState } from 'react';
import { getStreams } from '@repo/logic/api/stream';
import { Stream } from '@repo/logic/domain/stream';
import { Card } from '@repo/ui/card';
import Link from 'next/link';
import Image from 'next/image';
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
    <>
      <h1 style={{ marginBottom: '2rem' }}>Live Streams</h1>
      
      {loading && <p>Loading streams...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && (
        <div className={styles.grid}>
          {streams.length > 0 ? (
            streams.map((stream) => (
              <Link key={stream.id} href={`/channel/${stream.userId}`}>
                <Card title={stream.title}>
                  <Image 
                    src={stream.thumbnailUrl || 'https://placehold.co/320x180'} 
                    alt={stream.title} 
                    width={320}
                    height={180}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }} 
                  />
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
    </>
  );
}
