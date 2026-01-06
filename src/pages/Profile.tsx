import { useState } from "react";
import { User, Phone, MapPin, Settings, ChevronRight } from "lucide-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from "@/store/useAppStore";
import { useUpdateProfile, useUserStats } from "@/hooks/useUser";
import { useTelegram } from "@/providers/TelegramProvider";

export default function Profile() {
  const user = useUser();
  const { initData } = useTelegram();
  const telegramUser = initData?.user;
  const { data: stats } = useUserStats();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    city: user?.city || "",
  });

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        fullName: formData.fullName || undefined,
        phoneNumber: formData.phoneNumber || null,
        city: formData.city || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const initials =
    user?.fullName
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <MainLayout>
      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold truncate">
                  {user?.fullName || "Guest User"}
                </h2>
                {telegramUser?.username && (
                  <p className="text-sm text-muted-foreground">
                    @{telegramUser.username}
                  </p>
                )}
                {user?.isOnboarded ? (
                  <span className="inline-flex items-center text-xs text-green-600 mt-1">
                    ✓ Profile Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs text-orange-600 mt-1">
                    Complete your profile
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.approvedRegistrations}
                </p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-500">
                  {stats.pendingRegistrations}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Profile Information</CardTitle>
              <Sheet open={isEditing} onOpenChange={setIsEditing}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Edit Profile</SheetTitle>
                    <SheetDescription>
                      Update your profile information
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            phoneNumber: e.target.value,
                          }))
                        }
                        placeholder="+998901234567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        placeholder="Enter your city"
                      />
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={handleSave}
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{user?.fullName || "Not set"}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{user?.phoneNumber || "Not set"}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{user?.city || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent className="p-0">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-left font-medium">Settings</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
