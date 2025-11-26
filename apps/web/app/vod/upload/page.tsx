'use client';

import { useState } from 'react';
import { uploadVod } from '@repo/logic/api/stream';
import { useAuth } from '@repo/logic/context/auth-context';
import Link from 'next/link';

export default function VodUploadPage() {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !isAuthenticated) {
      setError('로그인 후 제목과 영상을 모두 입력하세요.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await uploadVod({ file, title, description });
      setStatus('업로드가 완료되었습니다. VOD 목록을 새로고침하세요.');
      setTitle('');
      setDescription('');
      setFile(null);
    } catch (err) {
      console.error(err);
      setError('업로드에 실패했습니다. 파일 크기와 네트워크를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: '1rem' }}>
      <h1>VOD 업로드</h1>
      <p style={{ color: '#555' }}>
        `POST /api/vods/upload` 엔드포인트를 사용합니다. 로그인 상태에서만 업로드 가능합니다.
      </p>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/">홈으로</Link>
      </div>
      {!isAuthenticated && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>
          업로드하려면 먼저 로그인하세요.
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label>
          제목
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isAuthenticated || loading}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            required
          />
        </label>
        <label>
          설명 (선택)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!isAuthenticated || loading}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', minHeight: 80 }}
          />
        </label>
        <label>
          영상 파일 (video)
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={!isAuthenticated || loading}
            style={{ marginTop: '0.25rem' }}
            required
          />
        </label>
        <button type="submit" disabled={!isAuthenticated || loading}>
          {loading ? '업로드 중...' : '업로드'}
        </button>
      </form>
      {status && <p style={{ color: 'green', marginTop: '0.75rem' }}>{status}</p>}
      {error && <p style={{ color: 'red', marginTop: '0.75rem' }}>{error}</p>}
    </div>
  );
}
