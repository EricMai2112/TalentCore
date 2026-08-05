import Sidebar from "@/src/components/Sidebar";
import Topbar from "@/src/components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ backgroundColor: "#ffffff" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
