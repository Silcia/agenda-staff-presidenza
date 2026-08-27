import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { db } from "../firebase";
import { StaffMember, CalendarEvent, StaffNote, SchoolLocation } from "../types";
import { INITIAL_STAFF_MEMBERS, INITIAL_LOCATIONS, getInitialEvents, INITIAL_STAFF_NOTES } from "../data/staffConfig";

// Collection References
const EVENTS_COLLECTION = "events";
const STAFF_COLLECTION = "staff";
const NOTES_COLLECTION = "notes";
const LOCATIONS_COLLECTION = "locations";

// Real-time Firestore Listeners with safety guards
export function subscribeToStaff(onUpdate: (staff: StaffMember[]) => void): () => void {
  try {
    if (!db) return () => {};
    const staffCol = collection(db, STAFF_COLLECTION);
    return onSnapshot(staffCol, async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial staff if empty
        try {
          const batch = writeBatch(db);
          INITIAL_STAFF_MEMBERS.forEach((member) => {
            const memberRef = doc(db, STAFF_COLLECTION, member.id);
            batch.set(memberRef, member);
          });
          await batch.commit();
        } catch (e) {
          console.warn("Failed seeding initial staff to Firestore:", e);
        }
        onUpdate(INITIAL_STAFF_MEMBERS);
      } else {
        const staffList: StaffMember[] = [];
        snapshot.forEach((docSnap) => {
          staffList.push(docSnap.data() as StaffMember);
        });
        if (staffList.length > 0) {
          onUpdate(staffList);
        }
      }
    }, (err) => {
      console.warn("Firestore staff subscription error:", err);
    });
  } catch (err) {
    console.warn("Could not initiate staff subscription:", err);
    return () => {};
  }
}

export function subscribeToEvents(onUpdate: (events: CalendarEvent[]) => void): () => void {
  try {
    if (!db) return () => {};
    const eventsCol = collection(db, EVENTS_COLLECTION);
    return onSnapshot(eventsCol, async (snapshot) => {
      if (snapshot.empty) {
        const initEvents = getInitialEvents();
        try {
          const batch = writeBatch(db);
          initEvents.forEach((evt) => {
            const evtRef = doc(db, EVENTS_COLLECTION, evt.id);
            batch.set(evtRef, evt);
          });
          await batch.commit();
        } catch (e) {
          console.warn("Failed seeding initial events to Firestore:", e);
        }
        onUpdate(initEvents);
      } else {
        const eventsList: CalendarEvent[] = [];
        snapshot.forEach((docSnap) => {
          eventsList.push(docSnap.data() as CalendarEvent);
        });
        onUpdate(eventsList);
      }
    }, (err) => {
      console.warn("Firestore events subscription error:", err);
    });
  } catch (err) {
    console.warn("Could not initiate events subscription:", err);
    return () => {};
  }
}

export function subscribeToNotes(onUpdate: (notes: StaffNote[]) => void): () => void {
  try {
    if (!db) return () => {};
    const notesCol = collection(db, NOTES_COLLECTION);
    return onSnapshot(notesCol, async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_STAFF_NOTES.forEach((note) => {
            const noteRef = doc(db, NOTES_COLLECTION, note.id);
            batch.set(noteRef, note);
          });
          await batch.commit();
        } catch (e) {
          console.warn("Failed seeding initial notes to Firestore:", e);
        }
        onUpdate(INITIAL_STAFF_NOTES);
      } else {
        const notesList: StaffNote[] = [];
        snapshot.forEach((docSnap) => {
          notesList.push(docSnap.data() as StaffNote);
        });
        notesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(notesList);
      }
    }, (err) => {
      console.warn("Firestore notes subscription error:", err);
    });
  } catch (err) {
    console.warn("Could not initiate notes subscription:", err);
    return () => {};
  }
}

export function subscribeToLocations(onUpdate: (locs: SchoolLocation[]) => void): () => void {
  try {
    if (!db) return () => {};
    const locsCol = collection(db, LOCATIONS_COLLECTION);
    return onSnapshot(locsCol, async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_LOCATIONS.forEach((loc) => {
            const locRef = doc(db, LOCATIONS_COLLECTION, loc.id);
            batch.set(locRef, loc);
          });
          await batch.commit();
        } catch (e) {
          console.warn("Failed seeding initial locations to Firestore:", e);
        }
        onUpdate(INITIAL_LOCATIONS);
      } else {
        const locList: SchoolLocation[] = [];
        snapshot.forEach((docSnap) => {
          locList.push(docSnap.data() as SchoolLocation);
        });
        onUpdate(locList);
      }
    }, (err) => {
      console.warn("Firestore locations subscription error:", err);
    });
  } catch (err) {
    console.warn("Could not initiate locations subscription:", err);
    return () => {};
  }
}

// Real-Time Write Operations to Cloud Firestore
export async function saveEventToCloud(event: CalendarEvent): Promise<void> {
  const eventRef = doc(db, EVENTS_COLLECTION, event.id);
  await setDoc(eventRef, event, { merge: true });
}

export async function deleteEventFromCloud(eventId: string): Promise<void> {
  const eventRef = doc(db, EVENTS_COLLECTION, eventId);
  await deleteDoc(eventRef);
}

export async function deleteBatchEventsFromCloud(eventIds: string[]): Promise<void> {
  if (eventIds.length === 0) return;
  // Split into chunks of 450 (Firestore limit is 500 per batch)
  const chunkSize = 450;
  for (let i = 0; i < eventIds.length; i += chunkSize) {
    const chunk = eventIds.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach((id) => {
      const ref = doc(db, EVENTS_COLLECTION, id);
      batch.delete(ref);
    });
    await batch.commit();
  }
}

export async function deleteAllEventsFromCloud(): Promise<void> {
  const eventsCol = collection(db, EVENTS_COLLECTION);
  const snap = await getDocs(eventsCol);
  if (snap.empty) return;
  
  const ids = snap.docs.map(d => d.id);
  await deleteBatchEventsFromCloud(ids);
}

export async function updateStaffMemberInCloud(member: StaffMember): Promise<void> {
  const memberRef = doc(db, STAFF_COLLECTION, member.id);
  await setDoc(memberRef, member, { merge: true });
}

export async function saveAllStaffToCloud(staffList: StaffMember[]): Promise<void> {
  const batch = writeBatch(db);
  staffList.forEach((member) => {
    const ref = doc(db, STAFF_COLLECTION, member.id);
    batch.set(ref, member, { merge: true });
  });
  await batch.commit();
}

export async function saveNoteToCloud(note: StaffNote): Promise<void> {
  const noteRef = doc(db, NOTES_COLLECTION, note.id);
  await setDoc(noteRef, note);
}

export async function deleteNoteFromCloud(noteId: string): Promise<void> {
  const noteRef = doc(db, NOTES_COLLECTION, noteId);
  await deleteDoc(noteRef);
}

export async function saveAllLocationsToCloud(locations: SchoolLocation[]): Promise<void> {
  const batch = writeBatch(db);
  locations.forEach((loc) => {
    const ref = doc(db, LOCATIONS_COLLECTION, loc.id);
    batch.set(ref, loc, { merge: true });
  });
  await batch.commit();
}
