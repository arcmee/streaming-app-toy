'use client';

import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { getChannelByUserId } from '@repo/logic/api/stream';
import { Channel } from '@repo/logic/domain/channel';

// Assuming a basic layout and styles
const styles = {
  page: {
    padding: '2rem',
    fontFamily: 'sans-serif',
  },
  playerWrapper: {
    position: 'relative',
    paddingTop: '56.25%', // 16:9 aspect ratio
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

export default function ChannelPage({ params }: { params: { userId: string } }) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.userId) return;

    const fetchChannel = async () => {
      try {
        setLoading(true);
        const fetchedChannel = await getChannelByUserId(params.userId);
        setChannel(fetchedChannel);
      } catch (err) {
        setError('Failed to fetch channel data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [params.userId]);

  if (loading) {
    return <div style={styles.page}><p>Loading channel...</p></div>;
  }

  if (error) {
    return <div style={styles.page}><p style={{ color: 'red' }}>{error}</p></div>;
  }

  if (!channel) {
    return <div style={styles.page}><p>Channel not found.</p></div>;
  }

  const streamUrl = `http://localhost:8000/live/${channel.stream.id}.flv`;

  return (
    <div style={styles.page}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>{channel.stream.title}</h1>
        <h2>Streamed by: {channel.user.username}</h2>
      </header>

      {channel.stream.isLive ? (
        <div style={styles.playerWrapper}>
          <ReactPlayer
            style={styles.reactPlayer}
            url={streamUrl}
            playing
            controls
            width="100%"
            height="100%"
          />
        </div>
      ) : (
        <p>This stream is not live right now.</p>
      )}

      <div style={styles.info}>
        <h3>About this stream:</h3>
        <p>{channel.stream.description}</p>
      </div>
    </div>
  );
}
