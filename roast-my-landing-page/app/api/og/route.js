import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const score = searchParams.get('score') || '??';
  const url = searchParams.get('url') || 'your landing page';
  const verdict = searchParams.get('verdict') || 'Get your page roasted by AI';

  // Color based on score
  const s = parseInt(score, 10);
  let scoreColor = '#ef4444';
  if (s >= 80) scoreColor = '#22c55e';
  else if (s >= 60) scoreColor = '#eab308';
  else if (s >= 40) scoreColor = '#f97316';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <span style={{ fontSize: '32px' }}>🔥</span>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>PageRoast</span>
        </div>

        {/* Score circle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            border: `8px solid ${scoreColor}`,
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '64px', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: '18px', color: '#71717a' }}>/100</span>
          </div>
        </div>

        {/* Verdict */}
        <p
          style={{
            fontSize: '24px',
            color: '#d4d4d8',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
            marginBottom: '16px',
          }}
        >
          {verdict.length > 120 ? verdict.substring(0, 120) + '...' : verdict}
        </p>

        {/* URL */}
        <p style={{ fontSize: '16px', color: '#52525b' }}>{url}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
