'use client';

import React, { use, useEffect, useRef, useState } from 'react';
import { getChannelByUserId } from '@repo/logic/api/stream';
import { Channel } from '@repo/logic/domain/channel';
import { chatService } from '@repo/logic/api/chat';
import { useAuth } from '@repo/logic/context/auth-context';
import type { ChatMessage } from '@repo/logic/domain/chat';
import { Chat } from '@repo/ui/chat';
import Link from 'next/link';
import styles from './page.module.css';
import type Hls from 'hls.js';

export default function ChannelPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const { user: currentUser, isAuthenticated, token } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const streamingBase = process.env.NEXT_PUBLIC_STREAMING_SERVER_URL;
  const streamPathKey = channel?.stream.streamKey ?? channel?.streamKey ?? channel?.stream.id ?? null;
  const streamUrl = streamingBase && streamPathKey ? `${streamingBase}/live/${streamPathKey}.m3u8` : null;

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

      chatService.onError((chatErr) => {
        console.error('Chat Error:', chatErr.message);
      });
    } catch (chatErr) {
      console.error('Failed to connect to chat:', chatErr);
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
      } catch (cleanupErr) {
        console.error('Error during chat cleanup:', cleanupErr);
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

  // Attach hls.js to video element
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !streamUrl || !channel) return;

    const canPlayNatively = videoElement.canPlayType('application/vnd.apple.mpegurl');
    let cancelled = false;

    const cleanupNative = () => {
      videoElement.removeAttribute('src');
      videoElement.load();
    };

    const startNativePlayback = () => {
      videoElement.src = streamUrl;
      if (channel.stream.isLive) {
        videoElement.play().catch((err) => console.error('HLS native play failed', err));
      }
    };

    if (canPlayNatively) {
      startNativePlayback();
      return () => cleanupNative();
    }

    (async () => {
      const Hls = (await import('hls.js')).default;
      if (cancelled) return;
      if (!Hls.isSupported()) {
        console.error('HLS not supported in this browser');
        return;
      }

      hlsRef.current?.destroy();
      const hls = new Hls({
        enableWorker: true,
        backBufferLength: 90,
        startLevel: -1,
        liveSyncDurationCount: 3,
        lowLatencyMode: true,
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('hls.js error', data);
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
        }
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(videoElement);
      if (channel.stream.isLive) {
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play().catch((err) => console.error('hls.js play failed', err));
        });
      }

      hlsRef.current = hls;
    })();

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [streamUrl, channel?.stream.isLive]);

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

  if (!streamingBase) {
    return (
      <div style={styles.page}>
        <p style={{ color: 'red' }}>
          Streaming server URL is not set. Please set NEXT_PUBLIC_STREAMING_SERVER_URL.
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link href="/" style={{ color: '#0f6efc' }}>
          Back to streams
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
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            Playback URL: {streamUrl ?? 'N/A'}
          </p>
          <div className={styles.info}>
            <h3>About this stream:</h3>
            <p>{channel.stream.description}</p>
            {!channel.stream.isLive && <p>This stream is not live right now.</p>}
          </div>
        </div>

        <aside className={styles.chatAside}>
          {chatError && <p style={{ color: 'red' }}>{chatError}</p>}
          <Chat messages={messages} onSendMessage={handleSendMessage} disabled={!isAuthenticated} />
        </aside>
      </div>
    </>
  );
}
