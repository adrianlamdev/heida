"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Menu,
  MessageCircle,
  MessageCirclePlus,
  ArrowRight,
  Edit,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Input } from "@workspace/ui/components/input";
import { useState, useEffect } from "react";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const recentChats = [
    { id: 1, title: "Chat with Support" },
    { id: 2, title: "Project Discussion" },
    { id: 3, title: "Team Meeting" },
    { id: 4, title: "Product Feedback" },
  ];

  const [openrouterModelName, setOpenrouterModelName] = useState<string>(
    "deepseek/deepseek-chat",
  );

  useEffect(() => {
    const storedModelName = localStorage.getItem("openrouter_model_name");
    if (storedModelName) {
      setOpenrouterModelName(storedModelName);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("openrouter_model_name", openrouterModelName);
  }, [openrouterModelName]);

  return (
    <main className="h-screen flex flex-col">
      <nav className="px-4 py-2 flex items-center max-w-3xl w-full mx-auto">
        <div className="flex justify-between w-full items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Recent Chats</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                {recentChats.map((chat) => (
                  <Button
                    key={chat.id}
                    variant="ghost"
                    className="w-full justify-between text-left p-2 hover:bg-secondary flex items-center"
                  >
                    <div className="flex items-center">{chat.title}</div>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Input
            value={openrouterModelName}
            onChange={(e) => setOpenrouterModelName(e.target.value)}
            placeholder="OpenRouter Model Name"
            className="bg-secondary focus-visible:ring-0 text-truncate w-[30dvw]"
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-transparent"
          >
            <MessageCirclePlus />
          </Button>
        </div>
      </nav>
      {children}
    </main>
  );
}
