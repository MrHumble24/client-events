import { format } from "date-fns";
import { Ticket, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { MainLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRegistrations } from "@/hooks/useUser";
import type { PaymentStatus } from "@/types";

const STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    icon: typeof Clock;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "Pending", icon: Clock, variant: "secondary" },
  APPROVED: { label: "Approved", icon: CheckCircle, variant: "default" },
  REJECTED: { label: "Rejected", icon: XCircle, variant: "destructive" },
};

export default function MyTickets() {
  const { data: allData, isLoading: allLoading } = useUserRegistrations();
  const { data: pendingData, isLoading: pendingLoading } = useUserRegistrations(
    {
      status: "PENDING",
    }
  );
  const { data: approvedData, isLoading: approvedLoading } =
    useUserRegistrations({
      status: "APPROVED",
    });

  const allRegistrations = allData?.data ?? [];
  const pendingRegistrations = pendingData?.data ?? [];
  const approvedRegistrations = approvedData?.data ?? [];

  return (
    <MainLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            My Tickets
          </h1>
          <p className="text-muted-foreground">
            View your event registrations and payment status
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">
              All ({allRegistrations.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingRegistrations.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedRegistrations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <RegistrationList
              registrations={allRegistrations}
              isLoading={allLoading}
              emptyMessage="No registrations yet"
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <RegistrationList
              registrations={pendingRegistrations}
              isLoading={pendingLoading}
              emptyMessage="No pending registrations"
            />
          </TabsContent>

          <TabsContent value="approved" className="mt-4">
            <RegistrationList
              registrations={approvedRegistrations}
              isLoading={approvedLoading}
              emptyMessage="No approved tickets"
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

interface RegistrationListProps {
  registrations: any[];
  isLoading: boolean;
  emptyMessage: string;
}

function RegistrationList({
  registrations,
  isLoading,
  emptyMessage,
}: RegistrationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {registrations.map(registration => (
        <RegistrationCard key={registration.id} registration={registration} />
      ))}
    </div>
  );
}

interface RegistrationCardProps {
  registration: any;
}

function RegistrationCard({ registration }: RegistrationCardProps) {
  const { event, status, createdAt } = registration;
  const config = STATUS_CONFIG[status as PaymentStatus];
  const StatusIcon = config.icon;
  const eventDate = new Date(event.date);
  const price = parseFloat(event.price);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Event Image */}
          <div className="h-16 w-16 rounded-lg bg-muted shrink-0 overflow-hidden">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                <Calendar className="h-6 w-6 text-primary/40" />
              </div>
            )}
          </div>

          {/* Event Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium truncate">{event.title}</h3>
              <Badge variant={config.variant} className="shrink-0">
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-0.5">
              {format(eventDate, "MMM d, yyyy")} • {event.city}
            </p>

            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-medium text-primary">
                {price > 0 ? `${price.toLocaleString()} UZS` : "Free"}
              </p>
              <p className="text-xs text-muted-foreground">
                Registered {format(new Date(createdAt), "MMM d")}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Note (if rejected) */}
        {status === "REJECTED" && registration.adminNote && (
          <div className="mt-3 p-2 bg-destructive/10 rounded text-sm text-destructive">
            <strong>Reason:</strong> {registration.adminNote}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
