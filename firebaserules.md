# Firestore Security Rules — TheSizNexus
> Canonical source for all AI agents. Copy the code block below verbatim into Firebase Console → Firestore → Rules.
> Last updated: 2026-04-18

## Collections

| Collection | Purpose |
|---|---|
| `users` | User profiles, ranks, bans |
| `friendRequests` | Friend request state |
| `chats` | DM chat metadata |
| `chats/{id}/messages` | DM messages subcollection |
| `notifications` | In-app notifications |
| `announcements` | Public announcements |
| `corpLog` | Corp activity log (immutable) |
| `corpChat` | Global group chat |
| `missions` | Mission definitions |
| `missionSubmissions` | Member mission submissions |
| `events` | Corp events with RSVP |
| `intelPosts` | Intel/news posts |
| `polls` | Polls and voting |
| `reports` | Member abuse reports |
| `bans` | Ban records |
| `_configKEY` | App config (owner-only write) |
| `commissions` | Member commission listings |
| `inquiries` | Commission contact messages |

## Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ──────────────────────────────────────────────
    //  Helper Functions
    // ──────────────────────────────────────────────

    function isAuthenticated() {
      return request.auth != null;
    }

    function isRegisteredUser() {
      return request.auth != null
        && request.auth.token.firebase.sign_in_provider != 'anonymous';
    }

    function isOwner() {
      return request.auth != null
        && request.auth.uid == 'QZ62mytbllhPt7wWkv6gKtmz31l1';
    }

    function getRank(uid) {
      let doc = get(/databases/$(database)/documents/users/$(uid));
      return doc.exists ? doc.data.rank : '';
    }

    function myRank() {
      return getRank(request.auth.uid);
    }

    function isDevOrAbove() {
      return isAuthenticated()
        && (myRank() in ['Developer', 'Co-Administrator', 'Administrator', 'Founder']
            || isOwner());
    }

    function isCoAdminOrAbove() {
      return isAuthenticated()
        && (myRank() in ['Co-Administrator', 'Administrator', 'Founder']
            || isOwner());
    }

    function isModOrAbove() {
      return isAuthenticated()
        && (myRank() in ['Moderator', 'Developer', 'Co-Administrator', 'Administrator', 'Founder']
            || isOwner());
    }

    function isNotBanned() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
      return !userDoc.exists || userDoc.data.get('isBanned', false) == false;
    }

    function validString(field, maxLen) {
      return request.resource.data[field] is string
        && request.resource.data[field].size() <= maxLen;
    }

    function hasOnly(fields) {
      return request.resource.data.diff(resource.data).affectedKeys().hasOnly(fields);
    }

    // ──────────────────────────────────────────────
    //  Users
    // ──────────────────────────────────────────────
    match /users/{userId} {
      allow read: if true;

      allow create: if isAuthenticated()
        && request.auth.uid == userId
        && request.resource.data.keys().hasAll(['displayName'])
        && validString('displayName', 32)
        && (!('bio' in request.resource.data) || validString('bio', 300));

      allow update: if isAuthenticated()
        && request.auth.uid == userId
        && !request.resource.data.diff(resource.data).affectedKeys()
            .hasAny(['rank', 'isBanned', 'points', 'badges', 'isOwner']);

      allow update: if isAuthenticated() && (
        isOwner()
        || (isDevOrAbove()
            && hasOnly(['rank', 'badges', 'isBanned', 'points']))
      );

      allow delete: if isOwner();
    }

    // ──────────────────────────────────────────────
    //  Friend Requests
    // ──────────────────────────────────────────────
    match /friendRequests/{reqId} {
      allow read: if isAuthenticated() && (
        resource.data.from == request.auth.uid
        || resource.data.to == request.auth.uid
        || isModOrAbove()
      );

      allow create: if isRegisteredUser()
        && isNotBanned()
        && request.resource.data.from == request.auth.uid
        && request.resource.data.keys().hasAll(['from', 'to', 'status'])
        && request.resource.data.status == 'pending';

      allow update: if isAuthenticated() && (
        resource.data.from == request.auth.uid
        || resource.data.to == request.auth.uid
        || isModOrAbove()
      );

      allow delete: if isAuthenticated() && (
        resource.data.from == request.auth.uid
        || resource.data.to == request.auth.uid
        || isModOrAbove()
      );
    }

    // ──────────────────────────────────────────────
    //  Direct Messages (Chats)
    // ──────────────────────────────────────────────
    match /chats/{chatId} {
      allow read: if isAuthenticated()
        && (request.auth.uid in resource.data.participants);

      allow create: if isRegisteredUser()
        && isNotBanned()
        && request.auth.uid in request.resource.data.participants;

      allow update: if isAuthenticated()
        && request.auth.uid in resource.data.participants;

      allow delete: if isOwner();

      match /messages/{msgId} {
        allow read: if isAuthenticated()
          && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;

        allow create: if isRegisteredUser()
          && isNotBanned()
          && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants
          && request.resource.data.keys().hasAll(['text', 'sender', 'createdAt'])
          && request.resource.data.sender == request.auth.uid
          && validString('text', 2000);

        allow delete: if isOwner();
      }
    }

    // ──────────────────────────────────────────────
    //  Notifications
    // ──────────────────────────────────────────────
    match /notifications/{notifId} {
      allow create: if isRegisteredUser() && isNotBanned();

      allow read: if isAuthenticated() && (
        resource.data.to == request.auth.uid
        || isCoAdminOrAbove()
      );

      allow update: if isAuthenticated() && (
        (resource.data.to == request.auth.uid && hasOnly(['read']))
        || isCoAdminOrAbove()
      );

      allow delete: if isAuthenticated() && (
        resource.data.to == request.auth.uid
        || isCoAdminOrAbove()
      );
    }

    // ──────────────────────────────────────────────
    //  Announcements
    // ──────────────────────────────────────────────
    match /announcements/{annId} {
      allow read: if true;

      allow create: if isAuthenticated()
        && (isOwner() || isDevOrAbove())
        && request.resource.data.keys().hasAll(['title', 'body'])
        && validString('title', 120)
        && validString('body', 2000);

      allow update, delete: if isAuthenticated()
        && (isOwner() || isDevOrAbove());
    }

    // ──────────────────────────────────────────────
    //  Corp Activity Log
    // ──────────────────────────────────────────────
    match /corpLog/{logId} {
      allow read: if isAuthenticated();

      allow create: if isRegisteredUser()
        && isNotBanned()
        && request.resource.data.keys().hasAll(['type', 'message'])
        && validString('message', 500);

      allow update, delete: if isOwner();
    }

    // ──────────────────────────────────────────────
    //  Corp Chat (Global/Group Chat)
    // ──────────────────────────────────────────────
    match /corpChat/{msgId} {
      allow read: if isAuthenticated();

      allow create: if isRegisteredUser()
        && isNotBanned()
        && request.resource.data.keys().hasAll(['text', 'uid'])
        && request.resource.data.uid == request.auth.uid
        && validString('text', 1000);

      allow delete: if isAuthenticated()
        && (isOwner() || isModOrAbove());

      allow update: if false;
    }

    // ──────────────────────────────────────────────
    //  Missions
    // ──────────────────────────────────────────────
    match /missions/{mId} {
      allow read: if isAuthenticated();

      allow create: if isAuthenticated()
        && (isOwner() || isDevOrAbove())
        && request.resource.data.keys().hasAll(['title', 'description'])
        && validString('title', 120)
        && validString('description', 1000);

      allow update, delete: if isAuthenticated()
        && (isOwner() || isDevOrAbove());
    }

    // ──────────────────────────────────────────────
    //  Mission Submissions
    // ──────────────────────────────────────────────
    match /missionSubmissions/{subId} {
      allow create: if isRegisteredUser()
        && isNotBanned()
        && request.resource.data.uid == request.auth.uid;

      allow read: if isAuthenticated() && (
        resource.data.uid == request.auth.uid
        || isDevOrAbove()
        || isOwner()
      );

      allow update: if isAuthenticated()
        && (isDevOrAbove() || isOwner());

      allow delete: if isAuthenticated()
        && (isDevOrAbove() || isOwner());
    }

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    match /events/{evId} {
      allow read: if isAuthenticated();

      allow create: if isAuthenticated()
        && (isOwner() || isDevOrAbove())
        && request.resource.data.keys().hasAll(['title'])
        && validString('title', 120);

      allow update: if isAuthenticated() && isNotBanned()
        && (hasOnly(['rsvpYes', 'rsvpNo'])
            || isOwner()
            || isDevOrAbove());

      allow delete: if isAuthenticated()
        && (isOwner() || isDevOrAbove());
    }

    // ──────────────────────────────────────────────
    //  Intel Posts
    // ──────────────────────────────────────────────
    match /intelPosts/{postId} {
      allow read: if isAuthenticated();

      allow create: if isAuthenticated()
        && (isOwner() || isModOrAbove())
        && request.resource.data.keys().hasAll(['title', 'body'])
        && validString('title', 200)
        && validString('body', 5000);

      allow update, delete: if isAuthenticated()
        && (isOwner() || isModOrAbove());
    }

    // ──────────────────────────────────────────────
    //  Polls
    // ──────────────────────────────────────────────
    match /polls/{pollId} {
      allow read: if isAuthenticated();

      allow create: if isAuthenticated()
        && (isOwner() || isDevOrAbove())
        && request.resource.data.keys().hasAll(['question', 'options']);

      allow update: if isRegisteredUser()
        && isNotBanned();

      allow delete: if isAuthenticated()
        && (isOwner() || isDevOrAbove());
    }

    // ──────────────────────────────────────────────
    //  Reports
    // ──────────────────────────────────────────────
    match /reports/{reportId} {
      allow create: if isRegisteredUser()
        && isNotBanned()
        && request.resource.data.keys().hasAll(['reason', 'reportedUid'])
        && validString('reason', 500);

      allow read, update, delete: if isAuthenticated()
        && (isCoAdminOrAbove() || isOwner());
    }

    // ──────────────────────────────────────────────
    //  Bans
    // ──────────────────────────────────────────────
    match /bans/{userId} {
      allow read: if isAuthenticated() && (
        request.auth.uid == userId
        || isCoAdminOrAbove()
        || isOwner()
      );

      allow create, update: if isAuthenticated()
        && (isCoAdminOrAbove() || isOwner())
        && request.resource.data.keys().hasAll(['uid', 'reason', 'active']);

      allow delete: if isAuthenticated()
        && (isCoAdminOrAbove() || isOwner());
    }

    // ──────────────────────────────────────────────
    //  App Configuration
    // ──────────────────────────────────────────────
    match /_configKEY/{docId} {
      allow read: if docId == 'app' || docId == 'devKeyHash';
      allow write: if isOwner();
    }

    // ──────────────────────────────────────────────
    //  Commissions
    // ──────────────────────────────────────────────
    match /commissions/{id} {
      // Public can read active listings; owner can read their own regardless of status
      allow read: if resource.data.status == 'active'
                  || (isAuthenticated() && request.auth.uid == resource.data.uid);

      // Registered, non-banned members can post listings
      allow create: if isRegisteredUser()
        && isNotBanned()
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.keys().hasAll(['uid', 'title', 'description', 'category', 'status'])
        && validString('title', 100)
        && validString('description', 2000)
        && request.resource.data.status == 'active';

      // Owner can update their own listing; uid is immutable
      allow update: if isAuthenticated()
        && request.auth.uid == resource.data.uid
        && request.resource.data.uid == resource.data.uid;

      // Owner or senior staff can soft-delete (set status: 'removed') or hard delete
      allow delete: if isAuthenticated()
        && (request.auth.uid == resource.data.uid
            || isCoAdminOrAbove()
            || isOwner());
    }

    // ──────────────────────────────────────────────
    //  Inquiries
    // ──────────────────────────────────────────────
    match /inquiries/{id} {
      // Registered, non-banned members can send inquiries
      allow create: if isRegisteredUser()
        && isNotBanned()
        && request.resource.data.fromUid == request.auth.uid
        && request.resource.data.keys().hasAll(['commissionId', 'artistUid', 'fromUid', 'message'])
        && validString('message', 1000);

      // Only the sender, the commission owner, or staff can read
      allow read: if isAuthenticated() && (
        request.auth.uid == resource.data.fromUid
        || request.auth.uid == resource.data.artistUid
        || isModOrAbove()
      );

      // Commission owner can update status field only (mark read/replied)
      allow update: if isAuthenticated()
        && request.auth.uid == resource.data.artistUid
        && hasOnly(['status']);

      allow delete: if isOwner();
    }

    // ──────────────────────────────────────────────
    //  Catch-all deny — block all undefined collections
    // ──────────────────────────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
