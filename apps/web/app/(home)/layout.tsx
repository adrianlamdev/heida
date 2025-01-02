import Nav from "@/components/nav";
import Footer from "@/components/footer";

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
