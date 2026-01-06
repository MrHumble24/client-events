import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCompleteOnboarding } from "@/hooks/useUser";
import { useTelegram } from "@/providers/TelegramProvider";

export default function Onboarding() {
  const navigate = useNavigate();
  const { initData } = useTelegram();
  const completeOnboarding = useCompleteOnboarding();

  const telegramUser = initData?.user;
  const defaultName = telegramUser
    ? `${telegramUser.first_name}${
        telegramUser.last_name ? ` ${telegramUser.last_name}` : ""
      }`
    : "";

  const [formData, setFormData] = useState({
    fullName: defaultName,
    phoneNumber: "",
    city: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[0-9]{9,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await completeOnboarding.mutateAsync({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        city: formData.city || undefined,
      });
      navigate("/");
    } catch (error) {
      console.error("Onboarding failed:", error);
    }
  };

  return (
    <MainLayout showHeader={false} showNav={false}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome */}
          <div className="text-center space-y-2">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="text-muted-foreground">
              Let's set up your profile to get started
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                This helps us personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    placeholder="+998901234567"
                    className={errors.phoneNumber ? "border-destructive" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City (Optional)</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="e.g., Toshkent"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={completeOnboarding.isPending}
                >
                  {completeOnboarding.isPending ? "Saving..." : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Skip for now */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/")}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
