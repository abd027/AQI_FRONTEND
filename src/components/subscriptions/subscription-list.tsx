"use client";

import { CitySubscription, AqiData } from "@/lib/api-client";
import SubscriptionCard from "./subscription-card";

// Helper function to generate consistent city keys (same as in page.tsx)
function getCityKey(city: string, country: string | null | undefined): string {
  const normalizedCountry = (country || "unknown").trim();
  return `${city}_${normalizedCountry}`.toLowerCase();
}

interface SubscriptionListProps {
  subscriptions: CitySubscription[];
  aqiDataMap: Record<string, AqiData>;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onSendNotification?: (id: number) => Promise<void>;
  onRefresh?: (id: number) => Promise<void>;
  loading?: boolean;
  loadingStates?: Record<string, boolean>;
  errorStates?: Record<string, string | null>;
}

export default function SubscriptionList({
  subscriptions,
  aqiDataMap,
  onToggle,
  onDelete,
  onSendNotification,
  onRefresh,
  loading = false,
  loadingStates = {},
  errorStates = {},
}: SubscriptionListProps) {
  // Safety check: ensure subscriptions is always an array
  const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];

  if (safeSubscriptions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No subscriptions yet.</p>
        <p className="text-sm mt-2">
          Add a city subscription to receive email alerts when AQI exceeds 100.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {safeSubscriptions.map((subscription) => {
        const cityKey = getCityKey(subscription.city, subscription.country);
        const aqiData = aqiDataMap[cityKey];
        const isLoading = loadingStates[cityKey] || false;
        const error = errorStates[cityKey] || null;

        return (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            aqiData={aqiData}
            onToggle={onToggle}
            onDelete={onDelete}
            onSendNotification={onSendNotification}
            onRefresh={onRefresh}
            loading={loading}
            isLoading={isLoading}
            error={error}
          />
        );
      })}
    </div>
  );
}
