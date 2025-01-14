"use client";

import { Card, CardTitle } from "@/components/feature-card";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { useEffect, useState } from "react";
import { Switch } from "@workspace/ui/components/switch";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Slider } from "@workspace/ui/components/slider";
import { CreditCard, Download, Calendar, Check, Scroll } from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";

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
    // {
    //   id: "appearance",
    //   name: "Appearance",
    // },
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

        <div className="flex justify-between w-full gap-12 border p-6 rounded-md">
          <div className="space-y-2 w-1/3">
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
            {selectedSection === "chat-management" && <ChatManagementSection />}
            {/* {selectedSection === "appearance" && <AppearanceSection />} */}
            {selectedSection === "billing" && <BillingSection />}
            {selectedSection === "account" && <AccountSection />}
          </ScrollArea>
        </div>
      </div>
    </section>
  );
}

const ProfileSection = ({ user }: { user: User | null }) => {
  const [emailPreferences, setEmailPreferences] = useState({
    marketing: false,
    updates: true,
    security: true,
  });

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
                setModelSettings({ ...modelSettings, temperature: value! })
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

const BillingSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("pro");

  const plans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: "$29.99",
      features: ["10 Projects", "Basic Analytics", "24/7 Support"],
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: "$8.00",
      features: [
        "Unlimited Projects",
        "Advanced Analytics",
        "Priority Support",
      ],
    },
  ];

  const invoices = [
    { id: "1234", amount: "$8.00", date: "July 12, 2022", status: "Paid" },
    { id: "1233", amount: "$8.00", date: "June 12, 2022", status: "Paid" },
    { id: "1232", amount: "$8.00", date: "May 12, 2022", status: "Paid" },
  ];

  const handlePlanChange = (planId) => {
    setSelectedPlan(planId);
    // Here you would typically make an API call to update the subscription
  };

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card className="p-1">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex flex-col">
                <Badge
                  variant="secondary"
                  className="w-fit bg-green-800/20 text-green-700 border-green-800/30 hover:bg-green-800/15"
                >
                  <div className="bg-green-700 w-1 h-1 rounded-full mr-1" />
                  Active
                </Badge>

                <CardTitle>Pro Plan</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Your subscription is active and will renew on August 12, 2023
              </p>
            </div>

            <CancelDialog />
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CreditCard className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">
                  Visa ending in 4242
                </p>
              </div>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="p-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Billing History</CardTitle>
            <Button variant="outline" className="text-sm">
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">#{invoice.id}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-green-800/20 text-green-700 border-green-800/30"
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const CancelDialog = () => {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");

  const reasons = [
    "Too expensive",
    "Not using it enough",
    "Found a better alternative",
    "Missing features",
    "Technical issues",
    "Other",
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Cancel Plan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Cancel Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Your plan will remain active until the end of the current billing
              period.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Why are you cancelling?
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional feedback (optional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="h-24"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <DialogTrigger asChild>
              <Button variant="outline">Go Back</Button>
            </DialogTrigger>
            <Button variant="destructive">Confirm Cancellation</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AccountSection = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const handleDeleteAccount = async () => {
    // Implement account deletion logic here
    console.log("Account deletion requested");
  };
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: "Chrome / Windows",
      location: "New York, US",
      lastActive: "2 hours ago",
      current: true,
    },
    {
      id: 2,
      device: "Safari / macOS",
      location: "San Francisco, US",
      lastActive: "2 days ago",
      current: false,
    },
  ]);

  const handlePasswordChange = () => {
    // Implement password change logic
    console.log("Password change requested");
  };

  const handleSessionRevoke = (sessionId) => {
    setSessions(sessions.filter((session) => session.id !== sessionId));
  };

  return (
    <div className="space-y-6">
      {/* Security Settings Card */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Change Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Change Password</h3>
                <p className="text-sm text-muted-foreground">
                  Update your password to maintain account security
                </p>
              </div>
              <Button onClick={handlePasswordChange} variant="outline">
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions Card */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{session.device}</span>
                    {session.current && (
                      <Badge variant="secondary" className="text-xs">
                        Current Session
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{session.location}</p>
                    <p>Last active: {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSessionRevoke(session.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy Card */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium mb-1">Data Export</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Download a copy of all your data
                </p>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Request Data Export
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-1">Privacy Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Usage Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Help us improve by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion Card */}
      <Card className="border-rose-800/50 hover:border-rose-800/50 p-1 bg-rose-700/10">
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account. Your data will be deleted within 30
            days, except we may retain metadata and logs for longer where
            required or permitted by law.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Request account deletion</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Cancel Plan
                </DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

const ChatManagementSection = () => {
  return (
    <div className="space-y-6">
      {/* Chat History Card */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle>Chat History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">Export Chat History</h3>
              <p className="text-sm text-muted-foreground">
                Download all your chat conversations
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Chats
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Export Chat History</DialogTitle>
                  <DialogDescription>
                    Choose a format to export your chat history
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    onClick={() => console.log("Export as PDF")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF Document
                  </Button>
                  <Button
                    onClick={() => console.log("Export as Markdown")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Markdown
                  </Button>
                  <Button
                    onClick={() => console.log("Export as Text")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Plain Text
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">Delete Chat History</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all chat conversations
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Delete all chats</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Chat History</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete all conversations? This
                      action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-3 mt-4">
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button variant="destructive">Clear History</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Management Card */}
      <Card className="p-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Knowledge Base</CardTitle>
            <Button variant="destructive">Delete all files</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Files you upload will be available as reference during chat
              conversations
            </div>

            <Input placeholder="Search files" className="w-full" />
            <div className="space-y-2">
              {/* Example uploaded files list */}
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center space-x-4">
                  <Button size="icon" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <div>
                    <p className="text-sm font-medium">documentation.pdf</p>
                    <p className="text-xs text-muted-foreground">2.3 MB</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge
                    variant="secondary"
                    className="w-fit bg-green-800/20 text-green-700 border-green-800/30 hover:bg-green-800/15"
                  >
                    indexed
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center space-x-4">
                  <Button size="icon" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <div>
                    <p className="text-sm font-medium">data.csv</p>
                    <p className="text-xs text-muted-foreground">156 KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, TXT, CSV, DOCX or similar files up to 10MB
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
