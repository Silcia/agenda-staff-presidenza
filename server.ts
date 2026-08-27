import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_STAFF_MEMBERS, getInitialEvents, INITIAL_STAFF_NOTES, INITIAL_LOCATIONS } from './src/data/staffConfig';
import { StaffMember, CalendarEvent, StaffNote, StaffMemberId, StatusType, SchoolLocation } from './src/types';

// In-memory data store for live shared synchronization
let staffMembers: StaffMember[] = JSON.parse(JSON.stringify(INITIAL_STAFF_MEMBERS));
let calendarEvents: CalendarEvent[] = JSON.parse(JSON.stringify(getInitialEvents()));
let staffNotes: StaffNote[] = JSON.parse(JSON.stringify(INITIAL_STAFF_NOTES));
let schoolLocations: SchoolLocation[] = JSON.parse(JSON.stringify(INITIAL_LOCATIONS));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', school: 'Liceo Classico Statale Gabriele d\'Annunzio - Pescara' });
  });

  // Locations endpoints (Sedi & Ubicazioni)
  app.get('/api/locations', (req, res) => {
    res.json({ locations: schoolLocations });
  });

  app.put('/api/locations', (req, res) => {
    const { locations } = req.body;
    if (Array.isArray(locations)) {
      schoolLocations = locations;
      return res.json({ success: true, locations: schoolLocations });
    }
    res.status(400).json({ error: 'Invalid locations array' });
  });

  app.post('/api/locations', (req, res) => {
    const newLocation = req.body;
    if (!newLocation.name) {
      return res.status(400).json({ error: 'Location name is required' });
    }
    const created: SchoolLocation = {
      ...newLocation,
      id: newLocation.id || `loc_${Date.now()}`,
    };
    schoolLocations.push(created);
    res.status(201).json({ success: true, location: created });
  });

  app.put('/api/locations/:id', (req, res) => {
    const { id } = req.params;
    const locIndex = schoolLocations.findIndex(l => l.id === id);
    if (locIndex === -1) {
      return res.status(404).json({ error: 'Location not found' });
    }
    schoolLocations[locIndex] = {
      ...schoolLocations[locIndex],
      ...req.body,
      id,
    };
    res.json({ success: true, location: schoolLocations[locIndex] });
  });

  app.delete('/api/locations/:id', (req, res) => {
    const { id } = req.params;
    schoolLocations = schoolLocations.filter(l => l.id !== id);
    res.json({ success: true });
  });

  // Staff endpoints
  app.get('/api/staff', (req, res) => {
    res.json({ staff: staffMembers });
  });

  app.put('/api/staff', (req, res) => {
    const { staff } = req.body;
    if (Array.isArray(staff)) {
      staffMembers = staff;
      return res.json({ success: true, staff: staffMembers });
    }
    res.status(400).json({ error: 'Invalid staff array' });
  });

  app.put('/api/staff/:id', (req, res) => {
    const { id } = req.params;
    const memberIndex = staffMembers.findIndex(m => m.id === id);
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    staffMembers[memberIndex] = {
      ...staffMembers[memberIndex],
      ...req.body,
      id, // keep id
      lastUpdated: new Date().toISOString(),
    };

    res.json({ success: true, member: staffMembers[memberIndex] });
  });

  app.post('/api/staff', (req, res) => {
    const newMember = req.body;
    if (!newMember.name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const created: StaffMember = {
      ...newMember,
      id: newMember.id || `staff_${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
    staffMembers.push(created);
    res.status(201).json({ success: true, member: created });
  });

  app.delete('/api/staff/:id', (req, res) => {
    const { id } = req.params;
    staffMembers = staffMembers.filter(m => m.id !== id);
    res.json({ success: true });
  });

  app.patch('/api/staff/:id/status', (req, res) => {
    const { id } = req.params;
    const { currentStatus, statusNote, locationRoom } = req.body;

    const memberIndex = staffMembers.findIndex(m => m.id === id);
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    if (currentStatus) staffMembers[memberIndex].currentStatus = currentStatus as StatusType;
    if (statusNote !== undefined) staffMembers[memberIndex].statusNote = statusNote;
    if (locationRoom !== undefined) staffMembers[memberIndex].locationRoom = locationRoom;
    staffMembers[memberIndex].lastUpdated = new Date().toISOString();

    res.json({ success: true, member: staffMembers[memberIndex] });
  });

  // Events endpoints
  app.get('/api/events', (req, res) => {
    const { date, memberId } = req.query;
    let filtered = [...calendarEvents];

    if (date && typeof date === 'string') {
      filtered = filtered.filter(e => e.date === date);
    }

    if (memberId && typeof memberId === 'string') {
      filtered = filtered.filter(e => e.attendeeIds.includes(memberId as StaffMemberId));
    }

    // Sort by startTime
    filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));

    res.json({ events: filtered });
  });

  app.post('/api/events', (req, res) => {
    const { title, description, category, date, startTime, endTime, location, attendeeIds, createdBy, isUrgent, notes } = req.body;

    if (!title || !date || !startTime || !endTime || !attendeeIds || attendeeIds.length === 0) {
      return res.status(400).json({ error: 'Missing required event fields' });
    }

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      description: description || '',
      category: category || 'staff_meeting',
      date,
      startTime,
      endTime,
      location: location || 'Presidenza / Sede Centrale',
      attendeeIds,
      createdBy: createdBy || 'sanvitale',
      isUrgent: Boolean(isUrgent),
      notes: notes || '',
    };

    calendarEvents.push(newEvent);
    res.status(201).json({ success: true, event: newEvent });
  });

  app.put('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const eventIndex = calendarEvents.findIndex(e => e.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    calendarEvents[eventIndex] = {
      ...calendarEvents[eventIndex],
      ...req.body,
      id, // Preserve id
    };

    res.json({ success: true, event: calendarEvents[eventIndex] });
  });

  app.delete('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = calendarEvents.length;
    calendarEvents = calendarEvents.filter(e => e.id !== id);

    if (calendarEvents.length === initialLength) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ success: true });
  });

  // Notes endpoints
  app.get('/api/notes', (req, res) => {
    res.json({ notes: staffNotes });
  });

  app.post('/api/notes', (req, res) => {
    const { authorId, text, isPinned, priority } = req.body;
    if (!text || !authorId) {
      return res.status(400).json({ error: 'Author and text are required' });
    }

    const newNote: StaffNote = {
      id: `note-${Date.now()}`,
      authorId,
      text,
      createdAt: new Date().toISOString(),
      isPinned: Boolean(isPinned),
      priority: priority || 'normal',
    };

    staffNotes.unshift(newNote);
    res.status(201).json({ success: true, note: newNote });
  });

  app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    staffNotes = staffNotes.filter(n => n.id !== id);
    res.json({ success: true });
  });

  // Reset to seed data
  app.post('/api/reset-data', (req, res) => {
    staffMembers = JSON.parse(JSON.stringify(INITIAL_STAFF_MEMBERS));
    calendarEvents = JSON.parse(JSON.stringify(getInitialEvents()));
    staffNotes = JSON.parse(JSON.stringify(INITIAL_STAFF_NOTES));
    schoolLocations = JSON.parse(JSON.stringify(INITIAL_LOCATIONS));
    res.json({ success: true, message: 'Data reset successfully' });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Staff Presidenza Liceo D'Annunzio server listening on port ${PORT}`);
  });
}

startServer();
