import { Nav } from "@/components/Nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </>
  );
}
