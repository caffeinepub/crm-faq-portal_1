import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Include authorization module
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type Entry = {
    id : Nat;
    title : Text;
    description : Text;
    entryType : Text;
    area : Text;
    team : Text;
    status : Text;
    notes : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Stats = {
    issueCount : Nat;
    bugFixCount : Nat;
    howToCount : Nat;
    featureCount : Nat;
  };

  public type AppSettings = {
    labels : [(Text, Text)];
    typeOptions : [Text];
    areaOptions : [Text];
    teamOptions : [Text];
    logoUrl : Text;
    bannerUrl : Text;
  };

  module Entry {
    public func compare(entry1 : Entry, entry2 : Entry) : Order.Order {
      Int.compare(entry1.createdAt, entry2.createdAt);
    };
  };

  var nextId = 1;

  let entries = Map.empty<Nat, Entry>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  
  var settings : AppSettings = {
    labels = [("title", "Title"), ("description", "Description")];
    typeOptions = ["Issue", "Bug Fix", "How-To", "Feature"];
    areaOptions = ["Sales", "Installation", "After Sales", "Backend & Old UI"];
    teamOptions = ["Brand Team", "After Sales Team", "Operations Team", "Field Service Engineers"];
    logoUrl = "";
    bannerUrl = "";
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Entry Management
  public shared ({ caller }) func createEntry(title : Text, description : Text, entryType : Text, area : Text, team : Text, status : Text, notes : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create entries");
    };

    let id = nextId;
    nextId += 1;

    let newEntry : Entry = {
      id;
      title;
      description;
      entryType;
      area;
      team;
      status;
      notes;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    entries.add(id, newEntry);
    id;
  };

  public query ({ caller }) func getEntries() : async [Entry] {
    entries.values().toArray().sort();
  };

  public query ({ caller }) func getEntry(id : Nat) : async Entry {
    switch (entries.get(id)) {
      case (?entry) { entry };
      case (null) { Runtime.trap("Entry not found") };
    };
  };

  public shared ({ caller }) func updateEntry(id : Nat, title : Text, description : Text, entryType : Text, area : Text, team : Text, status : Text, notes : Text) : async Entry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update entries");
    };

    switch (entries.get(id)) {
      case (?existingEntry) {
        let updatedEntry : Entry = {
          id;
          title;
          description;
          entryType;
          area;
          team;
          status;
          notes;
          createdAt = existingEntry.createdAt;
          updatedAt = Time.now();
        };
        entries.add(id, updatedEntry);
        updatedEntry;
      };
      case (null) { Runtime.trap("Entry not found") };
    };
  };

  public shared ({ caller }) func deleteEntry(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete entries");
    };

    if (not entries.containsKey(id)) {
      Runtime.trap("Entry not found");
    };
    entries.remove(id);
  };

  public query ({ caller }) func getEntriesByType(entryType : Text) : async [Entry] {
    let filtered = entries.values().filter(
      func(e) { e.entryType == entryType }
    );
    filtered.toArray().sort();
  };

  public query ({ caller }) func getEntriesByArea(area : Text) : async [Entry] {
    let filtered = entries.values().filter(
      func(e) { e.area == area }
    );
    filtered.toArray().sort();
  };

  public query ({ caller }) func getEntriesByTeam(team : Text) : async [Entry] {
    let filtered = entries.values().filter(
      func(e) { e.team == team }
    );
    filtered.toArray().sort();
  };

  public query ({ caller }) func getStats() : async Stats {
    var issueCount = 0;
    var bugFixCount = 0;
    var howToCount = 0;
    var featureCount = 0;

    entries.values().forEach(
      func(e) {
        switch (e.entryType) {
          case ("Issue") { issueCount += 1 };
          case ("Bug Fix") { bugFixCount += 1 };
          case ("How-To") { howToCount += 1 };
          case ("Feature") { featureCount += 1 };
          case (_) {};
        };
      }
    );

    {
      issueCount;
      bugFixCount;
      howToCount;
      featureCount;
    };
  };

  // App Settings Management
  public query ({ caller }) func getSettings() : async AppSettings {
    settings;
  };

  public shared ({ caller }) func updateSettings(newSettings : AppSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    settings := newSettings;
  };
};
