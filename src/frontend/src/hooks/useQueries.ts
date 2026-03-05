import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppSettings, Entry, Stats } from "../types";
import { useActor } from "./useActor";

export function useEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<Entry[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor)
        return {
          howToCount: 0n,
          featureCount: 0n,
          issueCount: 0n,
          bugFixCount: 0n,
          pendingCount: 0n,
          completedCount: 0n,
          totalCount: 0n,
        };
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor)
        return {
          areaOptions: [
            "Sales",
            "Installation",
            "After Sales",
            "Backend / Old UI",
          ],
          teamOptions: [
            "Brand Team",
            "After Sales Team",
            "Operations Team",
            "Field Service Engineers",
          ],
          labels: [],
          logoUrl: "",
          bannerUrl: "",
          typeOptions: ["Issue", "Bug Fix", "How-To", "Feature"],
        };
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      entryType: string;
      area: string;
      team: string;
      status: string;
      notes: string;
      reportedBy: string;
      dependency: string;
      instructions: string;
      resolveDate: bigint | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createEntry(
        data.title,
        data.description,
        data.entryType,
        data.area,
        data.team,
        data.status,
        data.notes,
        data.reportedBy,
        data.dependency,
        data.instructions,
        data.resolveDate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      entryType: string;
      area: string;
      team: string;
      status: string;
      notes: string;
      reportedBy: string;
      dependency: string;
      instructions: string;
      resolveDate: bigint | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateEntry(
        data.id,
        data.title,
        data.description,
        data.entryType,
        data.area,
        data.team,
        data.status,
        data.notes,
        data.reportedBy,
        data.dependency,
        data.instructions,
        data.resolveDate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: AppSettings) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
