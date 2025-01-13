"use client";

import { Card, CardTitle, CardDescription } from "@/components/feature-card";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@workspace/ui/components/button";
import { CardHeader, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { UserIcon, Mail, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export default function AccountSettingsPage() {
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

  const accountSections = [
    {
      id: "profile",
      name: "Profile",
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
      id: "preferences",
      name: "Preferences",
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
            {accountSections.map((section) => (
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

          <div className="w-full">
            <Card className="w-full p-4 shadow-none">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {selectedSection === "profile" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          value={user?.email}
                          disabled
                          className="w-full bg-muted"
                        />
                      </div>
                    </>
                  )}
                  {selectedSection === "billing" && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Manage your email notification preferences
                        </p>
                      </div>
                      <Button variant="outline" disabled>
                        Coming soon
                      </Button>
                    </div>
                  )}
                  {selectedSection === "preferences" && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Language Preferences</p>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred language
                        </p>
                      </div>
                      <Button variant="outline" disabled>
                        Coming soon
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
