export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #c8dff5 0%, #a5c8ee 45%, #85b5e8 100%)",
      }}
    >
      {/* ===================================================
          BLOB NHÓM 1 — Góc trên-phải
          Hai lớp lồng nhau → tạo độ sâu & chiều layered
          =================================================== */}

      {/* Lớp ngoài: lớn, mờ, tràn góc màn hình */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: "-160px",
          right: "-180px",
          width: "560px",
          height: "520px",
          background: "rgba(255,255,255,0.22)",
          borderRadius: "62% 38% 46% 54% / 60% 44% 56% 40%",
        }}
      />
      {/* Lớp trong: nhỏ hơn, đậm hơn, lệch tâm → highlight */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: "-90px",
          right: "-60px",
          width: "340px",
          height: "320px",
          background: "rgba(255,255,255,0.32)",
          borderRadius: "48% 52% 60% 40% / 42% 58% 42% 58%",
        }}
      />

      {/* ===================================================
          BLOB NHÓM 2 — Góc dưới-trái
          Tone xanh đậm hơn nền → tạo anchor góc màn hình
          =================================================== */}

      {/* Lớp ngoài: lớn, tone xanh đậm hơn nền một chút */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          bottom: "-220px",
          left: "-140px",
          width: "620px",
          height: "600px",
          background: "rgba(10, 101, 187, 0.12)",
          borderRadius: "40% 60% 55% 45% / 55% 45% 55% 45%",
        }}
      />
      {/* Lớp giữa: sáng hơn, highlight */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          bottom: "-100px",
          left: "40px",
          width: "300px",
          height: "280px",
          background: "rgba(255,255,255,0.22)",
          borderRadius: "58% 42% 38% 62% / 46% 54% 46% 54%",
        }}
      />
      {/* Lớp nhỏ: điểm nhấn trắng gần góc */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          bottom: "40px",
          left: "-30px",
          width: "160px",
          height: "150px",
          background: "rgba(255,255,255,0.35)",
          borderRadius: "50% 50% 45% 55% / 55% 45% 55% 45%",
        }}
      />

      {/* Children */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
