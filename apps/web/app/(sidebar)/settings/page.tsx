"use client";

import Loading from "@/app/loading";
import { Card, CardTitle } from "@/components/feature-card";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { CardContent, CardHeader } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Switch } from "@workspace/ui/components/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Textarea } from "@workspace/ui/components/textarea";
import { CreditCard, Download, Loader2 } from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const supabase = createClient();

  const [selectedSection, setSelectedSection] = useState("profile");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      id: "usage",
      name: "Usage & Limits",
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
    },
    {
      id: "account",
      name: "Account",
    },
  ];

  if (loading) {
    return <Loading />;
  }

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
            {selectedSection === "chat-management" && (
              <ChatManagementSection user={user} />
            )}
            {selectedSection === "billing" && <BillingSection />}
            {selectedSection === "account" && <AccountSection />}
          </ScrollArea>
        </div>
      </div>
    </section>
  );
}

const ProfileSection = ({ user }: { user: User | null }) => {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState({
    marketing: false,
    product_updates: true,
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">(
    "idle",
  );

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("email_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setEmailPreferences({
          marketing: data.marketing,
          product_updates: data.product_updates,
        });
      }
    } catch (error) {
      toast.error("Failed to load email preferences");
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: string, value: boolean) => {
    if (!user) return;

    setSaveStatus("saving");
    try {
      const { error } = await supabase
        .from("email_preferences")
        .update({ [key]: value })
        .eq("user_id", user.id);

      if (error) throw error;

      setEmailPreferences((prev) => ({ ...prev, [key]: value }));
      setSaveStatus("idle");
    } catch (error) {
      toast.error("Failed to update email preferences. Please try again.");
      setSaveStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-[30dvh]" />
        <Skeleton className="w-full h-[30dvh]" />
      </div>
    );
  }

  const handleEmailChange = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser(
        {
          email: email,
        },
        {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
      );

      if (error) throw error;

      toast.success("Verification email sent. Please check your inbox.");
    } catch (error) {
      toast.error("Failed to update email");
      if (user.email) {
        setEmail(user.email);
      }
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <div className="space-y-6">
      {saveStatus === "error" && (
        <Alert className="backdrop-blur bg-rose-800/20 border-rose-800/30 text-rose-700 mx-auto">
          <AlertDescription>Failed to save. Please try again.</AlertDescription>
        </Alert>
      )}

      {/* Profile Information Card */}
      <Card className="p-1">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="flex items-center justify-between">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-1/2"
                disabled={isUpdating}
              />
              <Button
                onClick={handleEmailChange}
                disabled={user?.email === email || isUpdating}
                variant="outline"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
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
                  updatePreference("marketing", checked)
                }
                disabled={saveStatus === "saving"}
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
                checked={emailPreferences.product_updates}
                onCheckedChange={(checked) =>
                  updatePreference("product_updates", checked)
                }
                disabled={saveStatus === "saving"}
              />
            </div>
          </div>
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
  return (
    <div className="space-y-6">
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
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
};

const DeleteAccountDialog = () => {
  const supabase = createClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const reasons = [
    "No longer needed",
    "Privacy concerns",
    "Not satisfied with service",
    "Moving to a different service",
    "Technical issues",
    "Other",
  ];

  // TODO: implement rate limiting
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No authenticated user");
      }

      const { error } = await supabase.from("support_requests").insert({
        user_id: user.id,
        request_type: "ACCOUNT_DELETION",
        subject: "Account Deletion Request",
        message: feedback
          ? `Reason: ${reason}\n\nFeedback: ${feedback}`
          : `Reason: ${reason}`,
        status: "OPEN",
      });

      if (error) {
        throw error;
      }

      toast.success("Request submitted successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Request account deletion</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Request Account Deletion
          </DialogTitle>
          <DialogDescription>
            Submit a request to delete your account. Once approved, your data
            will be scheduled for deletion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Why are you requesting account deletion?</Label>
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
            <Label>Additional feedback (optional)</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Help us improve our service..."
              className="h-24"
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Once your request is processed, your account and associated data
              will be scheduled for deletion with a 30-day grace period. During
              this time, you can log in to cancel the deletion request.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={!reason || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ChatManagementSection = ({ user }: { user: User | null }) => {
  const [hasChats, setHasChats] = useState(false);
  const [showDeleteFilesDialog, setShowDeleteFilesDialog] = useState(false);
  const [isDeletingFiles, setIsDeletingFiles] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [files, setFiles] = useState<
    Array<{
      file_id: string;
      original_name: string;
      file_type: string;
      file_size: number;
      created_at: string;
      embedding: boolean;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchChatCount();
    fetchFiles();
  }, []);

  const fetchChatCount = async () => {
    try {
      if (!user) return;

      const { count, error } = await supabase
        .from("user_chats")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .neq("id", "f0f75884-bddf-40a8-8f30-45ab53c1020f");

      if (error) throw error;

      setHasChats(count ? count > 0 : false);
    } catch (error) {
      toast.error("Failed to load chat count");
    }
  };

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      toast.error("Failed to load files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from("chat_files")
        .delete()
        .eq("file_id", fileId);

      if (error) throw error;

      setFiles(files.filter((file) => file.file_id !== fileId));
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  const handleDeleteAllFiles = async () => {
    setIsDeletingFiles(true);
    try {
      const { error } = await supabase
        .from("chat_files")
        .delete()
        .neq("file_id", "");

      if (error) throw error;

      setFiles([]);
      setShowDeleteFilesDialog(false);
      toast.success("All files deleted successfully");
    } catch (error) {
      toast.error("Failed to delete files");
    } finally {
      setIsDeletingFiles(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const filteredFiles = files.filter((file) =>
    file.original_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteAllChats = async () => {
    setIsDeleting(true);
    try {
      if (!user) return;
      const { error } = await supabase
        .from("user_chats")
        .delete()
        .eq("user_id", user.id)
        .neq("id", "f0f75884-bddf-40a8-8f30-45ab53c1020f");

      if (error) throw error;

      setShowDeleteDialog(false);
      setHasChats(false);
      toast.success("All chats deleted successfully");
    } catch (error) {
      toast.error("Failed to delete chats. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

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
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive" disabled={!hasChats}>
                    Delete Chat History
                  </Button>
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
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAllChats}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete History"
                      )}
                    </Button>
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
            <Dialog
              open={showDeleteFilesDialog}
              onOpenChange={setShowDeleteFilesDialog}
            >
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={files.length === 0}>
                  Delete all files
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete All Files</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete all files? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteFilesDialog(false)}
                    disabled={isDeletingFiles}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAllFiles}
                    disabled={isDeletingFiles}
                  >
                    {isDeletingFiles ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete All Files"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Files you upload will be available as reference during chat
              conversations
            </div>

            <Input
              placeholder="Search files"
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <div
                    key={file.file_id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="flex items-center space-x-4">
                      <Button size="icon" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <div>
                        <p className="text-sm font-medium">
                          {file.original_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {file.embedding && (
                        <Badge
                          variant="secondary"
                          className="w-fit bg-green-800/20 text-green-700 border-green-800/30 hover:bg-green-800/15"
                        >
                          indexed
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.file_id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No files found
                </div>
              )}
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
