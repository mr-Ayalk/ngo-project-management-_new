'use client';

export default function MessagesPage() {
  return (
    <>
      <div className="page-header">
        <h1>Messages</h1>
        <p>Real-time team communication and collaboration.</p>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          padding: 40,
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        }}
      >
        <div
          style={{
            fontSize: 48,
            marginBottom: 16,
          }}
        >
          💬
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
          Messages Coming Soon
        </div>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
          Real-time messaging and team communication features will be available in the next update.
        </div>
        <button
          onClick={() => alert('You will be notified when this feature is available!')}
          style={{
            padding: '10px 20px',
            background: '#1a6b3c',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Notify Me
        </button>
      </div>
    </>
  );
}
