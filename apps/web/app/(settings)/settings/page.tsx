"use client";

import { Card, CardTitle } from "@/components/feature-card";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { CardContent, CardHeader } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { useEffect, useState } from "react";
import { Switch } from "@workspace/ui/components/switch";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Slider } from "@workspace/ui/components/slider";

export default function SettingsPage() {
  const supabase = createClient();

  const [selectedSection, setSelectedSection] = useState("profile");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    (async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user details:", error);
          return;
        }

        setUser(user);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const settings = [
    {
      id: "profile",
      name: "Profile",
    },
    {
      id: "preferences",
      name: "Model Preferences",
    },
    {
      id: "chat-management",
      name: "Chat & Knowledge",
    },
    {
      id: "appearance",
      name: "Appearance",
    },
    {
      id: "billing",
      name: "Billing",
      sections: [
        {
          name: "Subscription",
        },
        {
          name: "Invoices",
        },
      ],
    },
    {
      id: "account",
      name: "Account",
    },
  ];

  return (
    <section className="pt-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8 w-full">
        <h2 className="text-3xl tracking-tighter">Settings</h2>

        <div className="flex justify-between w-full gap-12">
          <div className="space-y-4 w-1/3">
            {settings.map((section) => (
              <Button
                key={section.id}
                variant={selectedSection === section.id ? "outline" : "ghost"}
                className="w-full justify-between h-14 px-6"
                onClick={() => setSelectedSection(section.id)}
              >
                <div className="flex flex-col text-left">
                  <div className="font-medium">{section.name}</div>
                </div>
              </Button>
            ))}
          </div>
          <ScrollArea className="w-full h-[70dvh]">
            {selectedSection === "profile" && <ProfileSection user={user} />}
            {selectedSection === "preferences" && <ModelPreferencesSection />}
          </ScrollArea>
        </div>
      </div>
    </section>
  );
}

const ProfileSection = ({ user }: { user: User | null }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState({
    marketing: false,
    updates: true,
    security: true,
  });

  const handleDeleteAccount = async () => {
    // Implement account deletion logic here
    console.log("Account deletion requested");
  };

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={user?.email}
              disabled
              className="w-full bg-muted"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              type="text"
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Preferences Card */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-1">
            Email Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Marketing Emails</div>
                <div className="text-sm text-muted-foreground">
                  Receive emails about new features and promotions
                </div>
              </div>
              <Switch
                checked={emailPreferences.marketing}
                onCheckedChange={(checked) =>
                  setEmailPreferences({
                    ...emailPreferences,
                    marketing: checked,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Product Updates</div>
                <div className="text-sm text-muted-foreground">
                  Get notified about product updates and changes
                </div>
              </div>
              <Switch
                checked={emailPreferences.updates}
                onCheckedChange={(checked) =>
                  setEmailPreferences({ ...emailPreferences, updates: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Security Alerts</div>
                <div className="text-sm text-muted-foreground">
                  Receive important security notifications
                </div>
              </div>
              <Switch
                checked={emailPreferences.security}
                onCheckedChange={(checked) =>
                  setEmailPreferences({
                    ...emailPreferences,
                    security: checked,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion Card */}
      <Card className="border-rose-800/80 hover:border-rose-800/80 p-1">
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showDeleteConfirm ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there's no going back.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </AlertDescription>
              </Alert>
              <div className="flex gap-1">
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Confirm Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ModelPreferencesSection = () => {
  const [modelSettings, setModelSettings] = useState({
    defaultModel: "claude-3-sonnet",
    temperature: 0.7,
    contextLength: 8000,
  });

  const [autoRotation, setAutoRotation] = useState({
    enabled: false,
    costOptimized: true,
    speedOptimized: false,
  });

  return (
    <div className="space-y-6">
      {/* Default Model Settings Card */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle>Default Model Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Model</label>
            <Input
              value={modelSettings.defaultModel}
              onChange={(e) =>
                setModelSettings({
                  ...modelSettings,
                  defaultModel: e.target.value,
                })
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Temperature</label>
              <span className="text-sm text-muted-foreground">
                {modelSettings.temperature}
              </span>
            </div>
            <div></div>
            <Slider
              value={[modelSettings.temperature]}
              onValueChange={([value]) =>
                setModelSettings({ ...modelSettings, temperature: value })
              }
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">More creative</p>
              <p className="text-sm text-muted-foreground">
                More deterministic
              </p>
            </div>
          </div>

          {/* <div className="space-y-2"> */}
          {/*   <div className="flex justify-between"> */}
          {/*     <label className="text-sm font-medium">Context Length</label> */}
          {/*     <span className="text-sm text-muted-foreground"> */}
          {/*       {modelSettings.contextLength} tokens */}
          {/*     </span> */}
          {/*   </div> */}
          {/*   <Slider */}
          {/*     value={[modelSettings.contextLength]} */}
          {/*     onValueChange={([value]) => */}
          {/*       setModelSettings({ ...modelSettings, contextLength: value }) */}
          {/*     } */}
          {/*     min={1000} */}
          {/*     max={200000} */}
          {/*     step={1000} */}
          {/*     className="w-full" */}
          {/*   /> */}
          {/*   <p className="text-sm text-muted-foreground"> */}
          {/*     Maximum length of conversation history to include */}
          {/*   </p> */}
          {/* </div> */}
        </CardContent>
      </Card>

      {/* Auto Model Rotation Card */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle>Auto Model Rotation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Enable Auto Rotation</div>
              <div className="text-sm text-muted-foreground">
                Automatically switch between models based on task requirements
              </div>
            </div>
            <Switch
              checked={autoRotation.enabled}
              onCheckedChange={(checked) =>
                setAutoRotation({
                  ...autoRotation,
                  enabled: checked,
                })
              }
            />
          </div>

          {autoRotation.enabled && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Cost Optimization</div>
                  <div className="text-sm text-muted-foreground">
                    Prefer models with lower token costs when possible
                  </div>
                </div>
                <Switch
                  checked={autoRotation.costOptimized}
                  onCheckedChange={(checked) =>
                    setAutoRotation({
                      ...autoRotation,
                      costOptimized: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Speed Optimization</div>
                  <div className="text-sm text-muted-foreground">
                    Prefer faster models for simple tasks
                  </div>
                </div>
                <Switch
                  checked={autoRotation.speedOptimized}
                  onCheckedChange={(checked) =>
                    setAutoRotation({
                      ...autoRotation,
                      speedOptimized: checked,
                    })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
