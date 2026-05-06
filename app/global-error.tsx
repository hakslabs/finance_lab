'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko" data-theme="light">
      <body>
        <main className="sl-center" style={{ minHeight: '100vh', padding: 'var(--sl-space-6)' }}>
          <section className="sl-card" style={{ maxWidth: 440, padding: 'var(--sl-space-7)' }}>
            <span className="sl-tag sl-tag-warn">Error</span>
            <h1 className="sl-h2" style={{ marginTop: 'var(--sl-space-4)' }}>
              인프라 검증 화면을 다시 불러와야 합니다.
            </h1>
            <p className="sl-body-sm" style={{ marginTop: 'var(--sl-space-3)' }}>
              오류는 Sentry 설정이 있을 때 대시보드로 전송됩니다. 임시 세션을 다시 시도해 주세요.
            </p>
            <button
              type="button"
              className="sl-btn sl-btn-primary sl-btn-lg"
              style={{ marginTop: 'var(--sl-space-6)' }}
              onClick={reset}
            >
              다시 시도
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
