import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent, useRegisterForEvent } from "@/hooks/useEvents";
import { useBackButton } from "@/providers/TelegramProvider";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = parseInt(id || "0");

  const { data: event, isLoading } = useEvent(eventId);
  const registerMutation = useRegisterForEvent();

  // Back button
  useBackButton(() => navigate(-1), true);

  const handleRegister = async () => {
    if (!event) return;

    try {
      await registerMutation.mutateAsync({ eventId: event.id });
      navigate("/my-tickets");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout showNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="aspect-video rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32" />
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout showNav={false}>
        <div className="p-4 text-center py-12">
          <p className="text-muted-foreground">Event not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/events")}
          >
            Back to Events
          </Button>
        </div>
      </MainLayout>
    );
  }

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const price = parseFloat(event.price);
  const canRegister = event.status === "PUBLISHED" && !isPast;

  return (
    <MainLayout showNav={false}>
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="ml-2 font-medium truncate">{event.title}</span>
        </div>
      </div>

      <div className="pb-24">
        {/* Event Image */}
        <div className="relative aspect-video bg-muted">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
              <Calendar className="h-16 w-16 text-primary/40" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Title & Status */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              {event.status === "CANCELLED" && (
                <Badge variant="destructive">Cancelled</Badge>
              )}
              {event.status === "COMPLETED" && (
                <Badge variant="secondary">Completed</Badge>
              )}
            </div>

            {/* Price */}
            <p className="text-xl font-semibold text-primary">
              {price > 0 ? `${price.toLocaleString()} UZS` : "Free Event"}
            </p>
          </div>

          <Separator />

          {/* Event Details */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {format(eventDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">Date</p>
                </div>
              </div>

              {event.startTime && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {event.startTime}
                      {event.endTime && ` - ${event.endTime}`}
                    </p>
                    <p className="text-sm text-muted-foreground">Time</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{event.city}</p>
                  {event.address && (
                    <p className="text-sm text-muted-foreground">
                      {event.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">{event.maxSeats} seats</p>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">About Event</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      {canRegister && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t safe-area-bottom">
          <Button
            className="w-full h-12 text-base"
            onClick={handleRegister}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              "Registering..."
            ) : price > 0 ? (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Register & Pay {price.toLocaleString()} UZS
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Register for Free
              </>
            )}
          </Button>
        </div>
      )}
    </MainLayout>
  );
}
