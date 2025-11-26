'use client';

import { useEffect, useState } from 'react';
import { getMyChannel, type MyChannel } from '@repo/logic/api/stream';
import { useAuth } from '@repo/logic/context/auth-context';

export default function MePage() {
  const { user, isAuthenticated } = useAuth();
  const [channel, setChannel] = useState<MyChannel | null>(null);
  const [streamKey, setStreamKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamKeyCopied, setStreamKeyCopied] = useState(false);
  const [serverCopied, setServerCopied] = useState(false);

  const streamingBase = process.env.NEXT_PUBLIC_STREAMING_SERVER_URL;
  const ingestUrl = streamingBase
    ? (() => {
        try {
          const url = new URL(streamingBase);
          const port = url.port || '1935';
          return `rtmp://${url.hostname}:${port}/live`;
        } catch {
          return null;
        }
      })()
    : null;

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchMyChannel = async () => {
      try {
        setLoading(true);
        const data = await getMyChannel();
        setChannel(data);
        setStreamKey(data.stream.streamKey ?? data.streamKey ?? null);
      } catch (err) {
        console.error(err);
        setError('스트림 키를 불러오지 못했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyChannel();
  }, [isAuthenticated]);

  const handleCopy = async (text: string | null, kind: 'streamKey' | 'server') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (kind === 'streamKey') {
        setStreamKeyCopied(true);
        setTimeout(() => setStreamKeyCopied(false), 1500);
      } else {
        setServerCopied(true);
        setTimeout(() => setServerCopied(false), 1500);
      }
    } catch (err) {
      console.error('Copy failed', err);
      setError('클립보드 복사에 실패했습니다. 수동으로 복사해주세요.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={containerStyle}>
        <h1>내 정보</h1>
        <p style={{ color: 'red' }}>로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div>
        <h1 style={{ marginBottom: '0.25rem' }}>내 정보</h1>
        <p style={{ color: '#555', margin: 0 }}>계정 정보와 스트림 키를 확인하세요.</p>
      </div>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>계정</div>
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <div>사용자 ID: {user?.id}</div>
          <div>이메일: {user?.email}</div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>스트림 키</div>
        {loading && <p>불러오는 중...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div style={streamKeyBoxStyle}>{streamKey ?? '스트림 키 없음'}</div>
              <button
                onClick={() => handleCopy(streamKey, 'streamKey')}
                disabled={!streamKey}
                style={{
                  padding: '0.7rem 1.1rem',
                  borderRadius: 8,
                  border: '1px solid #0f6efc',
                  background: streamKey ? '#0f6efc' : '#9bb8f7',
                  color: '#fff',
                  cursor: streamKey ? 'pointer' : 'not-allowed',
                  minWidth: 96,
                }}
              >
                {streamKeyCopied ? '복사됨' : '복사'}
              </button>
            </div>
            <p style={{ color: '#666', marginTop: '0.4rem' }}>
              RTMP 인코더 설정 시 다른 사람과 공유하지 마세요.
            </p>
          </>
        )}
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>OBS 설정용 서버 주소</div>
        {streamingBase ? (
          <>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              <div>
                재생 서버 (NEXT_PUBLIC_STREAMING_SERVER_URL):{' '}
                <span style={{ fontFamily: 'monospace' }}>{streamingBase}</span>
              </div>
              <div>
                RTMP 인제스트 주소(추정):{' '}
                <span style={{ fontFamily: 'monospace' }}>{ingestUrl ?? '파싱 불가'}</span>
              </div>
            </div>
            <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleCopy(ingestUrl, 'server')}
                disabled={!ingestUrl}
                style={{
                  padding: '0.7rem 1.1rem',
                  borderRadius: 8,
                  border: '1px solid #0f6efc',
                  background: ingestUrl ? '#0f6efc' : '#9bb8f7',
                  color: '#fff',
                  cursor: ingestUrl ? 'pointer' : 'not-allowed',
                  minWidth: 120,
                }}
              >
                {serverCopied ? '서버 복사됨' : 'RTMP 주소 복사'}
              </button>
            </div>
            <p style={{ color: '#666', marginTop: '0.35rem' }}>
              RTMP 포트가 다르거나 커스텀 경로를 쓰면 해당 값으로 교체해 주세요.
            </p>
          </>
        ) : (
          <p style={{ color: 'red' }}>
            NEXT_PUBLIC_STREAMING_SERVER_URL이 설정되지 않았습니다. .env에 값을 추가하세요.
          </p>
        )}
      </section>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: '2rem auto',
  padding: '1.5rem',
  border: '1px solid #e0e0e0',
  borderRadius: 12,
  boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const sectionStyle: React.CSSProperties = {
  padding: '1rem',
  borderRadius: 10,
  border: '1px solid #e6e6e6',
  background: '#fafafa',
};

const sectionHeaderStyle: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: '0.5rem',
};

const streamKeyBoxStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.85rem 1rem',
  borderRadius: 8,
  border: '1px solid #d7d7d7',
  background: '#f7f7f7',
  fontFamily: 'monospace',
  wordBreak: 'break-all',
  minHeight: 44,
};
