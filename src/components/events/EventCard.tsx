import { format } from "date-fns";
import { MapPin, Calendar, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/types";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const price = parseFloat(event.price);

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all hover:shadow-md",
        isPast && "opacity-60"
      )}
      onClick={onClick}
    >
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
            <Calendar className="h-12 w-12 text-primary/40" />
          </div>
        )}

        {/* Price Badge */}
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 bg-background/90 backdrop-blur"
        >
          {price > 0 ? `${price.toLocaleString()} UZS` : "Free"}
        </Badge>

        {/* Status Badge */}
        {event.status === "CANCELLED" && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Cancelled
          </Badge>
        )}
        {event.status === "COMPLETED" && (
          <Badge
            variant="outline"
            className="absolute top-2 left-2 bg-background/90"
          >
            Completed
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-2 mb-2">
          {event.title}
        </h3>

        {/* Event Info */}
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{format(eventDate, "EEEE, MMM d, yyyy")}</span>
          </div>

          {event.startTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {event.startTime}
                {event.endTime && ` - ${event.endTime}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{event.city}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" />
            <span>{event.maxSeats} seats</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
