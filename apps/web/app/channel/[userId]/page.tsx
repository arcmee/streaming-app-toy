'use client';

import { use, useEffect, useState } from 'react';
import React, { useEffect, useState, useRef } from 'react';
import { getChannelByUserId } from '@repo/logic/api/stream';
import { Channel } from '@repo/logic/domain/channel';
import { chatService } from '@repo/logic/api/chat';
import { useAuth } from '@repo/logic/context/auth-context';
import type { ChatMessage } from '@repo/logic/domain/chat';
import { Chat } from '@repo/ui/chat';
import Link from 'next/link';
import styles from './page.module.css';

declare global {
  interface Window {
    flvjs?: typeof import('flv.js');
  }
}

export default function ChannelPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const { user: currentUser, isAuthenticated, token } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const flvPlayerRef = useRef<import('flv.js').Player | null>(null);

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
    if (!userId) return;

    const fetchChannel = async () => {
      try {
        setLoading(true);
        const fetchedChannel = await getChannelByUserId(userId);
        setChannel(fetchedChannel);
      } catch (err) {
        setError('Failed to fetch channel data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [userId]);

  // Manage chat connection
  useEffect(() => {
    if (!channel?.stream.id || !token) return;

    const handleConnectionError = (msg: string) => {
      setChatError(`Chat connection error: ${msg}`);
    };

    try {
      chatService.connect(token);
      chatService.joinRoom(channel.stream.id);

      chatService.onConnectionError(handleConnectionError);

      chatService.onNewMessage((message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      chatService.onUserJoined((message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      chatService.onUserLeft((message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      chatService.onError((error) => {
        console.error('Chat Error:', error.message);
      });
    } catch (error) {
      console.error('Failed to connect to chat:', error);
    }

    return () => {
      try {
        chatService.leaveRoom(channel.stream.id);
        chatService.offNewMessage();
        chatService.offUserJoined();
        chatService.offUserLeft();
        chatService.offError();
        chatService.offConnectionError(handleConnectionError);
        chatService.disconnect();
        setMessages([]);
      } catch (error) {
        console.error('Error during chat cleanup:', error);
      }
    };
  }, [channel, token]);

  // Update socket auth when token changes while connected
  useEffect(() => {
    if (token) {
      try {
        chatService.updateToken(token);
      } catch {
        // socket not initialized; ignore
      }
    }
  }, [token]);

  const handleSendMessage = (text: string) => {
    if (!currentUser || !channel) return;
    chatService.sendMessage({
      streamId: channel.stream.id,
      userId: currentUser.id,
      text,
    });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p>Loading channel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (!channel) {
    return <p>Channel not found.</p>;
  }

  const streamingBase = process.env.NEXT_PUBLIC_STREAMING_SERVER_URL;
  if (!streamingBase) {
    return (
      <div style={styles.page}>
        <p style={{ color: 'red' }}>
          Streaming server URL is not set. Please set NEXT_PUBLIC_STREAMING_SERVER_URL.
        </p>
      </div>
    );
  }

  const streamPathKey = channel.stream.streamKey ?? channel.stream.id;
  const streamUrl = `${streamingBase}/live/${streamPathKey}.flv`;

  // Attach flv.js to video element
  useEffect(() => {
    if (!videoRef.current || !window.flvjs || !window.flvjs.isSupported()) return;
    try {
      flvPlayerRef.current?.destroy();
      const flvPlayer = window.flvjs.createPlayer({
        type: 'flv',
        url: streamUrl,
      });
      flvPlayer.attachMediaElement(videoRef.current);
      flvPlayer.load();
      if (channel.stream.isLive) {
        flvPlayer.play();
      }
      flvPlayerRef.current = flvPlayer;
    } catch (err) {
      console.error('flv.js init error', err);
    }

    return () => {
      flvPlayerRef.current?.destroy();
      flvPlayerRef.current = null;
    };
  }, [streamUrl, channel.stream.isLive]);

  return (
    <>
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link href="/" style={{ color: '#0f6efc' }}>
          ← Back to streams
        </Link>
        <h1>{channel.stream.title}</h1>
        <h2>Streamed by: {channel.user.username}</h2>
        <Link href={`/channel/${userId}/vods`}>View VODs</Link>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <div className={styles.playerWrapper}>
            <video
              ref={videoRef}
              className={styles.reactPlayer}
              style={{ width: '100%', height: '100%' }}
              controls
              autoPlay={channel.stream.isLive}
              muted
            />
          </div>
          <div className={styles.info}>
            <h3>About this stream:</h3>
            <p>{channel.stream.description}</p>
            {!channel.stream.isLive && <p>This stream is not live right now.</p>}
          </div>
        </div>

        <aside className={styles.chatAside}>
          {chatError && <p style={{ color: 'red' }}>{chatError}</p>}
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            disabled={!isAuthenticated}
          />
        </aside>
      </div>
    </>
  );
}
