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
  Check,
  ExternalLink,
  Speech,
  MessageCircle,
  Box,
  Sparkle,
  Sparkles,
  PlugZap,
  Rocket,
  Settings,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch chats");
  }
  return response.json();
};

export default function ChatNav() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openrouterModelName, setOpenrouterModelName] = useState<string>(
    "deepseek/deepseek-chat",
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showAPIDialog, setShowAPIDialog] = useState(false);
  const [showChatSettingsDialog, setShowChatSettingsDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [apiKeys, setApiKeys] = useState({
    openai: false,
    claude: false,
    openrouter: false,
  });
  const [keyInput, setKeyInput] = useState("");

  const providers = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="text-foreground"
          fill="currentColor"
        >
          <path d="M44.559 19.646a11.957 11.957 0 0 0-1.028-9.822 12.094 12.094 0 0 0-13.026-5.802A11.962 11.962 0 0 0 21.485 0 12.097 12.097 0 0 0 9.95 8.373a11.964 11.964 0 0 0-7.997 5.8A12.097 12.097 0 0 0 3.44 28.356a11.957 11.957 0 0 0 1.028 9.822 12.094 12.094 0 0 0 13.026 5.802 11.953 11.953 0 0 0 9.02 4.02 12.096 12.096 0 0 0 11.54-8.379 11.964 11.964 0 0 0 7.997-5.8 12.099 12.099 0 0 0-1.491-14.177zM26.517 44.863a8.966 8.966 0 0 1-5.759-2.082 6.85 6.85 0 0 0 .284-.16L30.6 37.1c.49-.278.79-.799.786-1.361V22.265l4.04 2.332a.141.141 0 0 1 .078.111v11.16a9.006 9.006 0 0 1-8.987 8.995zM7.191 36.608a8.957 8.957 0 0 1-1.073-6.027c.071.042.195.119.284.17l9.558 5.52a1.556 1.556 0 0 0 1.57 0l11.67-6.738v4.665a.15.15 0 0 1-.057.124l-9.662 5.579a9.006 9.006 0 0 1-12.288-3.293zM4.675 15.744a8.966 8.966 0 0 1 4.682-3.943c0 .082-.005.228-.005.33v11.042a1.555 1.555 0 0 0 .785 1.359l11.669 6.736-4.04 2.333a.143.143 0 0 1-.136.012L7.967 28.03a9.006 9.006 0 0 1-3.293-12.284zm33.19 7.724L26.196 16.73l4.04-2.331a.143.143 0 0 1 .136-.012l9.664 5.579c4.302 2.485 5.776 7.989 3.29 12.29a8.991 8.991 0 0 1-4.68 3.943V24.827a1.553 1.553 0 0 0-.78-1.36zm4.02-6.051c-.07-.044-.195-.119-.283-.17l-9.558-5.52a1.556 1.556 0 0 0-1.57 0l-11.67 6.738V13.8a.15.15 0 0 1 .057-.124l9.662-5.574a8.995 8.995 0 0 1 13.36 9.315zm-25.277 8.315-4.04-2.333a.141.141 0 0 1-.079-.11v-11.16a8.997 8.997 0 0 1 14.753-6.91c-.073.04-.2.11-.283.161L17.4 10.9a1.552 1.552 0 0 0-.786 1.36l-.006 13.469zM18.803 21l5.198-3.002 5.197 3V27l-5.197 3-5.198-3z" />
        </svg>
      ),
      href: "https://platform.openai.com/docs/overview",
      id: "openai",
      name: "OpenAI",
      description: "Access OpenAI models",
      placeholder: "sk-...",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          imageRendering="optimizeQuality"
          fillRule="evenodd"
          clipRule="evenodd"
          viewBox="0 0 512 512"
        >
          <rect
            fill="#CC9B7A"
            width="512"
            height="512"
            rx="104.187"
            ry="105.042"
          />
          <path
            fill="#1F1F1E"
            fillRule="nonzero"
            d="M318.663 149.787h-43.368l78.952 212.423 43.368.004-78.952-212.427zm-125.326 0l-78.952 212.427h44.255l15.932-44.608 82.846-.004 16.107 44.612h44.255l-79.126-212.427h-45.317zm-4.251 128.341l26.91-74.701 27.083 74.701h-53.993z"
          />
        </svg>
      ),
      href: "https://www.anthropic.com/api",
      id: "claude",
      name: "Anthropic Claude",
      description: "Access Claude models",
      placeholder: "sk-ant-...",
    },
    {
      icon: (
        <svg
          width="512"
          height="512"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          stroke="currentColor"
        >
          <g clipPath="url(#clip0_205_3)">
            <path
              d="M3 248.945C18 248.945 76 236 106 219C136 202 136 202 198 158C276.497 102.293 332 120.945 423 120.945"
              strokeWidth="90"
            />
            <path d="M511 121.5L357.25 210.268L357.25 32.7324L511 121.5Z" />
            <path
              d="M0 249C15 249 73 261.945 103 278.945C133 295.945 133 295.945 195 339.945C273.497 395.652 329 377 420 377"
              strokeWidth="90"
            />
            <path d="M508 376.445L354.25 287.678L354.25 465.213L508 376.445Z" />
          </g>
        </svg>
      ),
      href: "https://openrouter.ai/settings/keys",
      id: "openrouter",
      name: "OpenRouter",
      description: "Access multiple AI models",
      placeholder: "sk-or-...",
    },
  ];

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const {
    data: chatsData,
    error: chatsError,
    mutate: mutateChats,
    isLoading,
  } = useSWR<[]>(user ? "/api/v1/chat" : null, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch("/api/keys");
      if (!response.ok) {
        throw new Error("Failed to fetch API keys");
      }
      const data = await response.json();
      setApiKeys(data.keys || {});
    } catch (error) {
      console.error("Error fetching API keys:", error);
    }
  };

  const saveAPIKey = async (provider: string, key: string) => {
    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: provider,
          key: key,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save API key");
      }

      // Refresh the keys after saving
      await fetchAPIKeys();
    } catch (error) {
      console.error("Error saving API key:", error);
    }
  };

  const deleteAPIKey = async (provider: string) => {
    try {
      const response = await fetch(`/api/keys?type=${provider}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete API key");
      }

      // Refresh the keys after deletion
      await fetchAPIKeys();
    } catch (error) {
      console.error("Error deleting API key:", error);
    }
  };

  const handleAPIKeyChange = async (provider: string, value: string) => {
    setKeyInput(value);

    if (value.trim()) {
      await saveAPIKey(provider, value);
    } else {
      await deleteAPIKey(provider);
    }
  };

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
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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
                  {chatsError && (
                    <div className="text-red-500 text-sm">
                      Error loading chats
                    </div>
                  )}
                  {!chatsData && !chatsError && (
                    <div className="text-muted-foreground text-sm">
                      Loading chats...
                    </div>
                  )}
                  {chatsData?.map((chat) => (
                    <Button
                      key={chat.id}
                      variant="ghost"
                      className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-secondary h-14"
                      asChild
                      onClick={() => setSheetOpen(false)}
                    >
                      <Link href={`/chat/${chat.id}`}>
                        <div className="flex items-center space-x-2">
                          <span>{chat.title}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(chat.created_at).toLocaleDateString()}
                        </div>
                      </Link>
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
                      <p className="text-sm font-medium leading-none">
                        Account & Settings
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account settings</span>
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setShowAPIDialog(true)}>
                        <Key className="mr-2 h-4 w-4" />
                        <span>API keys</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowAPIDialog(true)}>
                        <PlugZap className="mr-2 h-4 w-4" />
                        <span>Integrations</span>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem> */}
                      {/*   <Keyboard className="mr-2 h-4 w-4" /> */}
                      {/*   <span>Keyboard shortcuts</span> */}
                      {/*   <DropdownMenuShortcut>⌘K</DropdownMenuShortcut> */}
                      {/* </DropdownMenuItem> */}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => setShowChatSettingsDialog(true)}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Chat settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/support">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          <span>Help & support</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/feedback">
                          <Lock className="mr-2 h-4 w-4" />
                          <span>Report an issue</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleSignOut}>
                      <Rocket className="mr-2 h-4 w-4" />
                      <span>Release notes</span>
                    </DropdownMenuItem>
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

          <Dialog open={showAPIDialog} onOpenChange={setShowAPIDialog}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>API Key Management</DialogTitle>
                <DialogDescription>
                  Configure your API keys for different providers
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-4 md:border-r md:pr-4">
                  {providers.map((provider) => (
                    <Button
                      key={provider.id}
                      variant={
                        selectedProvider === provider.id ? "outline" : "ghost"
                      }
                      className="w-full justify-between h-16 px-6"
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div>{provider.icon}</div>
                        <div className="flex flex-col text-left">
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {provider.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        {/* FIXME: check and set check if provider has key */}
                        {selectedProvider === provider.id && (
                          <div className="backdrop-blur bg-green-800/20 border-green-800/30 text-green-700 flex items-center gap-2 rounded-md px-4 py-2">
                            <Check className="h-4 w-4" />
                            <span className="">Set</span>
                          </div>
                        )}
                        <Link href={provider.href} target="_blank">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </Button>
                  ))}
                </div>

                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>
                      {providers.find((p) => p.id === selectedProvider)?.name}
                    </CardTitle>
                    <CardDescription>
                      {apiKeys[selectedProvider as keyof typeof apiKeys]
                        ? "API key is saved and encrypted"
                        : "Enter your API key for " +
                          providers.find((p) => p.id === selectedProvider)
                            ?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input
                        type="password"
                        placeholder={
                          providers.find((p) => p.id === selectedProvider)
                            ?.placeholder
                        }
                        value={keyInput}
                        onChange={(e) =>
                          handleAPIKeyChange(selectedProvider, e.target.value)
                        }
                        className="w-full"
                      />
                      {apiKeys[selectedProvider as keyof typeof apiKeys] && (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => deleteAPIKey(selectedProvider)}
                        >
                          Remove API Key
                        </Button>
                      )}
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                      Your API keys are encrypted with AES-256 encryption and
                      stored securely to maintain confidentiality and integrity.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showChatSettingsDialog}
            onOpenChange={showChatSettingsDialog}
          >
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Chat History</DialogTitle>
                <DialogDescription>
                  Configure your API keys for different providers
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-4 md:border-r md:pr-4">
                  {providers.map((provider) => (
                    <Button
                      key={provider.id}
                      variant={
                        selectedProvider === provider.id ? "outline" : "ghost"
                      }
                      className="w-full justify-between h-16 px-6"
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div>{provider.icon}</div>
                        <div className="flex flex-col text-left">
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {provider.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        {selectedProvider === provider.id && <Check />}
                        <Link href={provider.href} target="_blank">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </Button>
                  ))}
                </div>

                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>
                      {providers.find((p) => p.id === selectedProvider)?.name}
                    </CardTitle>
                    <CardDescription>
                      {apiKeys[selectedProvider as keyof typeof apiKeys]
                        ? "API key is saved and encrypted"
                        : "Enter your API key for " +
                          providers.find((p) => p.id === selectedProvider)
                            ?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input
                        type="password"
                        placeholder={
                          providers.find((p) => p.id === selectedProvider)
                            ?.placeholder
                        }
                        value={keyInput}
                        onChange={(e) =>
                          handleAPIKeyChange(selectedProvider, e.target.value)
                        }
                        className="w-full"
                      />
                      {apiKeys[selectedProvider as keyof typeof apiKeys] && (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => deleteAPIKey(selectedProvider)}
                        >
                          Remove API Key
                        </Button>
                      )}
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                      Your API keys are encrypted with AES-256 encryption and
                      stored securely to maintain confidentiality and integrity.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>

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
            asChild
          >
            <Link href="/chat">
              <MessageCirclePlus className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
