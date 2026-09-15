export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #D5E7F2 0%, #C3DFEF 50%, #A6D2E8 100%)'
      }}
    >
      {/* ── Ambient Glow Light Spot 1: Cyan Accent Glow ── */}
      <div
        className="absolute pointer-events-none select-none filter blur-3xl opacity-60"
        style={{
          top: '15%',
          right: '20%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(42, 149, 191, 0.35) 0%, rgba(255,255,255,0) 70%)',
        }}
      />

      {/* ── Ambient Glow Light Spot 2: Primary Ocean Blue Glow ── */}
      <div
        className="absolute pointer-events-none select-none filter blur-3xl opacity-50"
        style={{
          bottom: '10%',
          left: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(18, 97, 166, 0.30) 0%, rgba(255,255,255,0) 70%)',
        }}
      />

      {/* BLOB 1 — Corner Top Right */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: '-160px',
          right: '-180px',
          width: '560px',
          height: '520px',
          background: 'rgba(255,255,255,0.28)',
          borderRadius: '62% 38% 46% 54% / 60% 44% 56% 40%'
        }}
      />
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: '-90px',
          right: '-60px',
          width: '340px',
          height: '320px',
          background: 'rgba(255,255,255,0.38)',
          borderRadius: '48% 52% 60% 40% / 42% 58% 42% 58%'
        }}
      />

      {/* BLOB 2 — Corner Bottom Left */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          bottom: '-220px',
          left: '-140px',
          width: '620px',
          height: '600px',
          background: 'rgba(18, 97, 166, 0.15)',
          borderRadius: '40% 60% 55% 45% / 55% 45% 55% 45%'
        }}
      />
      <div
        className="absolute pointer-events-none select-none"
        style={{
          bottom: '-100px',
          left: '40px',
          width: '300px',
          height: '280px',
          background: 'rgba(255,255,255,0.30)',
          borderRadius: '58% 42% 38% 62% / 46% 54% 46% 54%'
        }}
      />

      {/* Children */}
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>
  )
}
