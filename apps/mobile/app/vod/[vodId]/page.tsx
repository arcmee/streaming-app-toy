'use client';

import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { getVodById } from '@repo/logic/api/stream';
import type { VOD } from '@repo/logic/domain/vod';

const styles = {
  page: {
    padding: '2rem',
    fontFamily: 'sans-serif',
  },
  playerWrapper: {
    position: 'relative',
    paddingTop: '56.25%', // 16:9 aspect ratio
    marginBottom: '2rem',
  },
  reactPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  info: {
    marginTop: '1rem',
  },
};

export default function VodPage({ params }: { params: { vodId: string } }) {
  const [vod, setVod] = useState<VOD | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.vodId) return;

    const fetchVod = async () => {
      try {
        setLoading(true);
        const fetchedVod = await getVodById(params.vodId);
        setVod(fetchedVod);
      } catch (err) {
        setError('Failed to fetch VOD data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVod();
  }, [params.vodId]);

  if (loading) {
    return <div style={styles.page}><p>Loading VOD...</p></div>;
  }

  if (error) {
    return <div style={styles.page}><p style={{ color: 'red' }}>{error}</p></div>;
  }

  if (!vod) {
    return <div style={styles.page}><p>VOD not found.</p></div>;
  }

  return (
    <div style={styles.page}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>{vod.title}</h1>
      </header>

      <div style={styles.playerWrapper}>
        <ReactPlayer
          style={styles.reactPlayer}
          url={vod.url} // The URL of the VOD file
          playing
          controls
          width="100%"
          height="100%"
        />
      </div>

      {vod.description && (
        <div style={styles.info}>
          <h3>About this VOD:</h3>
          <p>{vod.description}</p>
        </div>
      )}
    </div>
  );
}
