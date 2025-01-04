"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import {
  Menu,
  MessageCirclePlus,
  User as UserIcon,
  LogOut,
  Lock,
  Sun,
  Key,
  Globe,
  HelpCircle,
  Keyboard,
  Moon,
  MoreVertical,
} from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@workspace/ui/components/sheet";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatNav() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openrouterModelName, setOpenrouterModelName] = useState<string>(
    "deepseek/deepseek-chat",
  );

  // TODO: fetch recents from db
  const recentChats = [
    { id: 1, title: "Chat with Support" },
    { id: 2, title: "Project Discussion" },
    { id: 3, title: "Team Meeting" },
    { id: 4, title: "Product Feedback" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data, error } = await supabase.auth.getUser();

          if (error) {
            console.error("Error fetching user details:", error);
          } else {
            setUser(user);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase]);

  useEffect(() => {
    const storedModelName = localStorage.getItem("openrouter_model_name");
    if (storedModelName) {
      setOpenrouterModelName(storedModelName);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("openrouter_model_name", openrouterModelName);
  }, [openrouterModelName]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div className="w-full animate-pulse" />;
  }

  if (!user) {
    return null;
  }

  return (
    <nav className="relative z-50 w-full px-4 py-3 bg-background shadow flex justify-center">
      <div className="fixed pointer-events-none -z-10 top-0 left-0 right-0 h-28 bg-gradient-to-b from-background to-transparent" />

      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between w-full">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="flex flex-col h-full py-12">
              <SheetHeader>
                <SheetTitle>Recent Chats</SheetTitle>
              </SheetHeader>

              <div className="flex-1 min-h-0">
                <div className="mt-4 space-y-2">
                  {recentChats.map((chat) => (
                    <Button
                      key={chat.id}
                      variant="ghost"
                      className="flex items-center justify-between w-full p-2 text-left hover:bg-secondary"
                    >
                      <div className="flex items-center">{chat.title}</div>
                    </Button>
                  ))}
                </div>
              </div>

              <SheetFooter>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="w-full">
                    <div className="w-full">
                      <Button
                        variant="outline"
                        className="w-full px-4 py-3 h-auto justify-between"
                      >
                        <div className="flex justify-start items-center gap-2">
                          <Avatar className="h-10 w-10">
                            {/* <AvatarImage */}
                            {/*   src={ */}
                            {/*     user.user_metadata.avatar_url || "/avatars/user.png" */}
                            {/*   } */}
                            {/*   alt="User avatar" */}
                            {/* /> */}
                            <AvatarFallback className="bg-secondary">
                              {user.email[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col items-start leading-4">
                            <p className="">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-transparent"
                        >
                          <MoreVertical className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </Button>
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Key className="mr-2 h-4 w-4" />
                        <span>API Keys</span>
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Theme</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                          <DropdownMenuItem>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Light</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Dark</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Globe className="mr-2 h-4 w-4" />
                            <span>System</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem>
                        <Keyboard className="mr-2 h-4 w-4" />
                        <span>Keyboard shortcuts</span>
                        <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/support">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          <span>Help & Support</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/privacy-policy">
                          <Lock className="mr-2 h-4 w-4" />
                          <span>Privacy Policy</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-red-700 focus:text-red-700"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Input
            value={openrouterModelName}
            onChange={(e) => setOpenrouterModelName(e.target.value)}
            placeholder="OpenRouter Model Name"
            className="w-[45dvw] md:w-[30dvw] text-center bg-background focus-visible:ring-0 text-truncate"
          />

          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-transparent"
          >
            <MessageCirclePlus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
