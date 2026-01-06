import { useNavigate } from "react-router-dom";
import { Calendar, ArrowRight, Ticket, TrendingUp, AlertTriangle } from "lucide-react";
import { MainLayout } from "@/components/layout";
import { EventCard, EventListSkeleton } from "@/components/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEvents } from "@/hooks/useEvents";
import { useUserStats } from "@/hooks/useUser";
import { useUser } from "@/store/useAppStore";
import { useTelegram } from "@/providers/TelegramProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const navigate = useNavigate();
  const user = useUser();
  const { isTelegramApp } = useTelegram();
  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    status: "PUBLISHED",
    limit: 3,
  });
  const { data: stats } = useUserStats();

  const events = eventsData?.data ?? [];

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        {/* Dev Mode Warning */}
        {!isTelegramApp && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Development Mode</AlertTitle>
            <AlertDescription>
              Open this app inside Telegram to use all features. Some features may not work in browser.
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <section className="space-y-1">
          <h1 className="text-2xl font-bold">
            Welcome{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}!
            👋
          </h1>
          <p className="text-muted-foreground">
            Discover and register for amazing events in your city
          </p>
        </section>

        {/* Quick Stats */}
        {stats && (
          <section className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.approvedRegistrations}
                  </p>
                  <p className="text-xs text-muted-foreground">My Tickets</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.pendingRegistrations}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Upcoming Events */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => navigate("/events")}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {eventsLoading ? (
            <EventListSkeleton count={2} />
          ) : events.length > 0 ? (
            <div className="grid gap-4">
              {events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No upcoming events</p>
                <p className="text-sm text-muted-foreground">
                  Check back later for new events!
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
