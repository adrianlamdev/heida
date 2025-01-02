import Footer from "@/components/layout/footer";
import Nav from "@/components/layout/nav";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col">
      <Nav />
      <div className="flex-1 overflow-hidden">{children}</div>
      <Footer />
    </div>
  );
}
