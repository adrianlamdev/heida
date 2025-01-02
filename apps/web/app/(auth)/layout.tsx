export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const quotes = [
    "Heida has completely transformed the way I manage my tasks. Highly recommended!",
    "The best productivity tool I've ever used. It's a game-changer!",
    "Heida makes collaboration seamless and efficient. Love it!",
    "I can't imagine my workflow without Heida. It's simply amazing.",
    "Heida has saved me so much time and effort. Worth every penny!",
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center w-screen px-4">
        <div className="max-w-5xl w-full">
          <div className="max-w-screen-xl mx-auto py-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-2xl hover:text-primary/90 transition-colors">
                heida
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-5xl w-full flex items-center justify-center gap-8">
          {children}
          <div className="p-6 bg-background border rounded-lg backdrop-blur-sm">
            <blockquote className="italic text-muted-foreground">
              "{randomQuote}"
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
