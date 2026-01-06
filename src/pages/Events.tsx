import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Search, MapPin } from "lucide-react";
import { MainLayout } from "@/components/layout";
import { EventCard, EventListSkeleton } from "@/components/events";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/useEvents";
import { useUser } from "@/store/useAppStore";

const CITIES = [
  "All",
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Namangan",
  "Farg'ona",
];

export default function Events() {
  const navigate = useNavigate();
  const user = useUser();
  const [selectedCity, setSelectedCity] = useState<string>(user?.city || "All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useEvents({
    city: selectedCity === "All" ? undefined : selectedCity,
    status: "PUBLISHED",
  });

  const events = data?.data ?? [];

  // Filter events by search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Browse and register for upcoming events
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* City Filter */}
        <div className="overflow-x-auto -mx-4 px-4">
          <Tabs value={selectedCity} onValueChange={setSelectedCity}>
            <TabsList className="w-max">
              {CITIES.map(city => (
                <TabsTrigger key={city} value={city} className="px-4">
                  {city === "All" ? (
                    "All Cities"
                  ) : (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {city}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Events List */}
        {isLoading ? (
          <EventListSkeleton count={4} />
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-4">
            {filteredEvents.map(event => (
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
              <p className="font-medium">No events found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? "Try a different search term"
                  : selectedCity !== "All"
                    ? `No events in ${selectedCity}`
                    : "No upcoming events available"}
              </p>
              {(searchQuery || selectedCity !== "All") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCity("All");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
