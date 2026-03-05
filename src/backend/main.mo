import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Include authorization module
  let accessControlState = AccessControl.initState();
  var _nextId = 1;

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
    reportedBy : Text;
    dependency : Text;
    instructions : Text;
    resolveDate : ?Int;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Stats = {
    issueCount : Nat;
    bugFixCount : Nat;
    howToCount : Nat;
    featureCount : Nat;
    pendingCount : Nat;
    completedCount : Nat;
    totalCount : Nat;
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

  let _entries = Map.empty<Nat, Entry>();
  let _userProfiles = Map.empty<Principal, UserProfile>();

  var _settings : AppSettings = {
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
    _userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    _userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    _userProfiles.add(caller, profile);
  };

  // Helper function to check if caller is authenticated (non-anonymous)
  func isAuthenticated(caller : Principal) : Bool {
    caller.toText() != "2vxsx-fae"
  };

  // Entry Management
  public shared ({ caller }) func createEntry(
    title : Text,
    description : Text,
    entryType : Text,
    area : Text,
    team : Text,
    status : Text,
    notes : Text,
    reportedBy : Text,
    dependency : Text,
    instructions : Text,
    resolveDate : ?Int,
  ) : async Nat {
    // Check if caller is authenticated (non-anonymous)
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Anonymous users cannot create entries");
    };

    let id = _nextId;
    _nextId += 1;

    let newEntry : Entry = {
      id;
      title;
      description;
      entryType;
      area;
      team;
      status;
      notes;
      reportedBy;
      dependency;
      instructions;
      resolveDate;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    _entries.add(id, newEntry);
    id;
  };

  public query ({ caller }) func getEntries() : async [Entry] {
    _entries.values().toArray().sort();
  };

  public query ({ caller }) func getEntry(id : Nat) : async Entry {
    switch (_entries.get(id)) {
      case (?entry) { entry };
      case (null) { Runtime.trap("Entry not found") };
    };
  };

  public shared ({ caller }) func updateEntry(
    id : Nat,
    title : Text,
    description : Text,
    entryType : Text,
    area : Text,
    team : Text,
    status : Text,
    notes : Text,
    reportedBy : Text,
    dependency : Text,
    instructions : Text,
    resolveDate : ?Int,
  ) : async Entry {
    // Check if caller is authenticated (non-anonymous)
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Anonymous users cannot update entries");
    };

    switch (_entries.get(id)) {
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
          reportedBy;
          dependency;
          instructions;
          resolveDate;
          createdAt = existingEntry.createdAt;
          updatedAt = Time.now();
        };
        _entries.add(id, updatedEntry);
        updatedEntry;
      };
      case (null) { Runtime.trap("Entry not found") };
    };
  };

  public shared ({ caller }) func deleteEntry(id : Nat) : async () {
    // Check if caller is authenticated (non-anonymous)
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Anonymous users cannot delete entries");
    };

    if (not _entries.containsKey(id)) {
      Runtime.trap("Entry not found");
    };
    _entries.remove(id);
  };

  public query ({ caller }) func getEntriesByType(entryType : Text) : async [Entry] {
    let filtered = _entries.values().filter(
      func(e) { e.entryType == entryType }
    );
    filtered.toArray().sort();
  };

  public query ({ caller }) func getEntriesByArea(area : Text) : async [Entry] {
    let filtered = _entries.values().filter(
      func(e) { e.area == area }
    );
    filtered.toArray().sort();
  };

  public query ({ caller }) func getEntriesByTeam(team : Text) : async [Entry] {
    let filtered = _entries.values().filter(
      func(e) { e.team == team }
    );
    filtered.toArray().sort();
  };

  public query ({ caller }) func getStats() : async Stats {
    var issueCount = 0;
    var bugFixCount = 0;
    var howToCount = 0;
    var featureCount = 0;
    var pendingCount = 0;
    var completedCount = 0;

    _entries.values().forEach(
      func(e) {
        switch (e.entryType) {
          case ("Issue") { issueCount += 1 };
          case ("Bug Fix") { bugFixCount += 1 };
          case ("How-To") { howToCount += 1 };
          case ("Feature") { featureCount += 1 };
          case (_) {};
        };

        switch (e.status) {
          case ("Open") { pendingCount += 1 };
          case ("In Progress") { pendingCount += 1 };
          case ("Resolved") { completedCount += 1 };
          case ("Closed") { completedCount += 1 };
          case (_) {};
        };
      }
    );

    {
      issueCount;
      bugFixCount;
      howToCount;
      featureCount;
      pendingCount;
      completedCount;
      totalCount = _entries.size();
    };
  };

  // App Settings Management
  public query ({ caller }) func getSettings() : async AppSettings {
    _settings;
  };

  public shared ({ caller }) func updateSettings(newSettings : AppSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    _settings := newSettings;
  };
};
