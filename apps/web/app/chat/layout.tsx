import ChatNav from "@/components/chat-nav";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-screen flex flex-col">
      <ChatNav />
      {children}
    </main>
  );
}
