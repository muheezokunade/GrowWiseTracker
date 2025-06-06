import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/shared/ThemeProvider";
import { useCurrency } from "@/hooks/use-currency";
import { usePwaInstall } from "@/hooks/use-pwa-install";

// Profile form schema
const profileFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  monthlyRevenue: z.string().min(1, "Monthly revenue range is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Account form schema
const accountFormSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Currency form schema
const currencyFormSchema = z.object({
  currency: z.string().min(1, "Currency is required")
});

type AccountFormValues = z.infer<typeof accountFormSchema>;
type CurrencyFormValues = z.infer<typeof currencyFormSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { isInstallable, promptInstall, isIOS } = usePwaInstall();
  const [activeTab, setActiveTab] = useState("profile");

  // Define a type for business profile
  type BusinessProfile = {
    businessName: string;
    industry: string;
    monthlyRevenue: string;
  };
  
  // Fetch user profile
  const { data: profile, isLoading: isProfileLoading } = useQuery<BusinessProfile>({
    queryKey: ["/api/user/profile"],
    enabled: !!user,
  });
  
  // Fetch user info from auth context
  const { data: userInfo } = useQuery({
    queryKey: ["/api/user"],
    enabled: !!user,
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      businessName: profile?.businessName || "",
      industry: profile?.industry || "",
      monthlyRevenue: profile?.monthlyRevenue || "",
    },
  });

  // Update profile when data is loaded
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        businessName: profile.businessName || "",
        industry: profile.industry || "",
        monthlyRevenue: profile.monthlyRevenue || "",
      });
    }
  }, [profile, profileForm]);

  // Account form
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      username: user?.username || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PUT", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Submit profile form
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(data);
  };

  // Submit account form
  const onAccountSubmit = (data: AccountFormValues) => {
    // This would handle password change in a real app
    toast({
      title: "Feature not implemented",
      description: "Password change functionality is not implemented in this demo.",
    });
  };
  
  // Currency form
  const currencyForm = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencyFormSchema),
    defaultValues: {
      currency: user?.currency || "USD",
    },
  });
  
  // Update currency when user data is loaded
  useEffect(() => {
    if (user?.currency) {
      currencyForm.reset({
        currency: user.currency,
      });
    }
  }, [user, currencyForm]);
  
  // Update currency mutation
  const updateCurrency = useMutation({
    mutationFn: async (data: CurrencyFormValues) => {
      const res = await apiRequest("PUT", "/api/user/currency", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Currency updated",
        description: "Your preferred currency has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update currency",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Submit currency form
  const onCurrencySubmit = (data: CurrencyFormValues) => {
    updateCurrency.mutate(data);
  };

  // Industries options
  const industriesOptions = [
    { value: "retail", label: "Retail" },
    { value: "services", label: "Professional Services" },
    { value: "tech", label: "Technology" },
    { value: "food", label: "Food & Beverage" },
    { value: "health", label: "Health & Wellness" },
    { value: "creative", label: "Creative & Design" },
    { value: "other", label: "Other" },
  ];

  // Revenue range options
  const { currencyCode, formatCurrency } = useCurrency();
  
  const revenueRangeOptions = [
    { 
      value: "range1", 
      label: `Less than ${formatCurrency(1000)}` 
    },
    { 
      value: "range2", 
      label: `${formatCurrency(1000)} - ${formatCurrency(5000)}` 
    },
    { 
      value: "range3", 
      label: `${formatCurrency(5000)} - ${formatCurrency(10000)}` 
    },
    { 
      value: "range4", 
      label: `${formatCurrency(10000)} - ${formatCurrency(25000)}` 
    },
    { 
      value: "range5", 
      label: `${formatCurrency(25000)} - ${formatCurrency(50000)}` 
    },
    { 
      value: "range6", 
      label: `More than ${formatCurrency(50000)}` 
    },
  ];

  return (
    <MainLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="profile">Business Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>
                  Update your business information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProfileLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#27AE60]" />
                  </div>
                ) : (
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an industry" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {industriesOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="monthlyRevenue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Revenue Range</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {revenueRangeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="bg-[#27AE60] hover:bg-[#219653]"
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Update your account email and password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...accountForm}>
                  <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6">
                    <FormField
                      control={accountForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={accountForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={accountForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormDescription>
                            Leave blank if you don't want to change your password.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={accountForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="bg-[#27AE60] hover:bg-[#219653]">
                      Update Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Settings */}
          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your app experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Currency</h3>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">
                      Select your preferred currency for financial displays. 
                      {user?.currency && (
                        <span className="font-medium ml-1">
                          Current currency: {user.currency}
                        </span>
                      )}
                    </p>
                    <Form {...currencyForm}>
                      <form onSubmit={currencyForm.handleSubmit(onCurrencySubmit)} className="space-y-4 max-w-md">
                        <FormField
                          control={currencyForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select preferred currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                  <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                                  <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                                  <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                                  <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                                  <SelectItem value="CNY">Chinese Yuan (CNY)</SelectItem>
                                  <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                                  <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="bg-[#27AE60] hover:bg-[#219653]"
                          disabled={updateCurrency.isPending}
                        >
                          {updateCurrency.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Update Currency"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </div>

                  <h3 className="text-lg font-medium mb-4">Theme</h3>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`mr-2 ${theme === 'light' ? 'bg-[#27AE60]/10 border-[#27AE60]' : ''}`}
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`mr-2 ${theme === 'dark' ? 'bg-[#27AE60]/10 border-[#27AE60]' : ''}`}
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-5 w-5" />
                    </Button>
                    <span className="ml-4 text-sm text-muted-foreground">
                      {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Install App</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Install GrowWise as a standalone app for quicker access, even when offline.
                  </p>
                  
                  {isIOS ? (
                    <div className="space-y-3">
                      <Button
                        className="bg-[#27AE60] hover:bg-[#219653]"
                        onClick={promptInstall}
                      >
                        Install on iOS
                      </Button>
                      <div className="text-sm text-amber-600 p-3 bg-amber-50 rounded-md">
                        <p className="font-medium mb-1">iOS Installation:</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>Tap the share icon in Safari</li>
                          <li>Scroll down and tap "Add to Home Screen"</li>
                          <li>Tap "Add" in the upper right</li>
                        </ol>
                      </div>
                    </div>
                  ) : isInstallable ? (
                    <Button 
                      className="bg-[#27AE60] hover:bg-[#219653]"
                      onClick={promptInstall}
                    >
                      Install GrowWise App
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button 
                        className="bg-gray-300 hover:bg-gray-300 cursor-not-allowed text-gray-600"
                        disabled
                      >
                        Install GrowWise App
                      </Button>
                      <p className="text-sm text-amber-600">
                        {window.matchMedia('(display-mode: standalone)').matches
                          ? "App is already installed on this device"
                          : "App installation is not available in this browser or the app is already installed"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
