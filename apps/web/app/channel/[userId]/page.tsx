'use client';

import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { getChannelByUserId } from '@repo/logic/api/stream';
import { Channel } from '@repo/logic/domain/channel';
import { chatService } from '@repo/logic/api/chat';
import { useAuth } from '@repo/logic/context/auth-context';
import type { ChatMessage } from '@repo/logic/domain/chat';
import { Chat } from '@repo/ui/chat';

const styles = {
  page: {
    padding: '2rem',
    fontFamily: 'sans-serif',
  },
  layout: {
    display: 'flex',
    gap: '2rem',
  },
  mainContent: {
    flex: 3,
  },
  chatAside: {
    flex: 1,
    height: 'calc(100vh - 4rem)', // Adjust height as needed
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user: currentUser, isAuthenticated } = useAuth();

  // Dynamically load flv.js
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/flv.js@latest/dist/flv.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch channel data
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

  // Manage chat connection
  useEffect(() => {
    if (!channel?.stream.id) return;

    chatService.connect();
    chatService.joinRoom(channel.stream.id);

    chatService.onNewMessage((message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    chatService.onError((error) => {
      console.error('Chat Error:', error.message);
      // Optionally show an error to the user in the chat UI
    });

    // Cleanup on component unmount
    return () => {
      chatService.leaveRoom(channel.stream.id);
      chatService.offNewMessage();
      chatService.offError();
      chatService.disconnect();
      setMessages([]); // Clear messages on leave
    };
  }, [channel]);

  const handleSendMessage = (text: string) => {
    if (!currentUser || !channel) return;
    chatService.sendMessage({
      streamId: channel.stream.id,
      userId: currentUser.id,
      text,
    });
  };

  if (loading) {
    return <div style={styles.page}><p>Loading channel...</p></div>;
  }

  if (error) {
    return <div style={styles.page}><p style={{ color: 'red' }}>{error}</p></div>;
  }

  if (!channel) {
    return <div style={styles.page}><p>Channel not found.</p></div>;
  }

  const streamUrl = `${process.env.NEXT_PUBLIC_STREAMING_SERVER_URL}/live/${channel.stream.id}.flv`;

  return (
    <div style={styles.page}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>{channel.stream.title}</h1>
        <h2>Streamed by: {channel.user.username}</h2>
      </header>

      <div style={styles.layout}>
        <div style={styles.mainContent}>
          <div style={styles.playerWrapper}>
            <ReactPlayer
              style={styles.reactPlayer}
              url={streamUrl}
              playing={channel.stream.isLive}
              controls
              width="100%"
              height="100%"
            />
          </div>
          <div style={styles.info}>
            <h3>About this stream:</h3>
            <p>{channel.stream.description}</p>
            {!channel.stream.isLive && <p>This stream is not live right now.</p>}
          </div>
        </div>

        <aside style={styles.chatAside}>
          <Chat 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            disabled={!isAuthenticated}
          />
        </aside>
      </div>
    </div>
  );
}
