import ChatNav from "@/components/chat-nav";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col">
      <ChatNav />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
