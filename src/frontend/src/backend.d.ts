import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Stats {
    pendingCount: bigint;
    howToCount: bigint;
    totalCount: bigint;
    featureCount: bigint;
    completedCount: bigint;
    issueCount: bigint;
    bugFixCount: bigint;
}
export interface Entry {
    id: bigint;
    status: string;
    title: string;
    entryType: string;
    area: string;
    createdAt: bigint;
    team: string;
    description: string;
    instructions: string;
    updatedAt: bigint;
    reportedBy: string;
    dependency: string;
    notes: string;
    resolveDate?: bigint;
}
export interface UserProfile {
    name: string;
}
export interface AppSettings {
    areaOptions: Array<string>;
    teamOptions: Array<string>;
    labels: Array<[string, string]>;
    logoUrl: string;
    bannerUrl: string;
    typeOptions: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEntry(title: string, description: string, entryType: string, area: string, team: string, status: string, notes: string, reportedBy: string, dependency: string, instructions: string, resolveDate: bigint | null): Promise<bigint>;
    deleteEntry(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntries(): Promise<Array<Entry>>;
    getEntriesByArea(area: string): Promise<Array<Entry>>;
    getEntriesByTeam(team: string): Promise<Array<Entry>>;
    getEntriesByType(entryType: string): Promise<Array<Entry>>;
    getEntry(id: bigint): Promise<Entry>;
    getSettings(): Promise<AppSettings>;
    getStats(): Promise<Stats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEntry(id: bigint, title: string, description: string, entryType: string, area: string, team: string, status: string, notes: string, reportedBy: string, dependency: string, instructions: string, resolveDate: bigint | null): Promise<Entry>;
    updateSettings(newSettings: AppSettings): Promise<void>;
}
