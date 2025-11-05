import { createContext, useContext, useState, ReactNode } from 'react';

export interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  description: string;
  qrCode: string;
  registrations: string[]; // Array of student roll numbers who registered
  checkins: string[]; // Array of student roll numbers who checked in
}

export interface EventRegistration {
  eventId: string;
  studentRollNo: string;
  studentName: string;
  registeredAt: string;
}

export interface EventCheckin {
  eventId: string;
  studentRollNo: string;
  studentName: string;
  checkinAt: string;
}

interface EventContextType {
  events: Event[];
  registrations: EventRegistration[];
  checkins: EventCheckin[];
  addEvent: (event: Event) => void;
  registerForEvent: (eventId: string, studentRollNo: string, studentName: string) => boolean;
  checkinToEvent: (eventId: string, studentRollNo: string, studentName: string) => boolean;
  getEventCheckins: (eventId: string) => EventCheckin[];
  getStudentEvents: (studentRollNo: string) => { registered: EventRegistration[]; checkedIn: EventCheckin[] };
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Tech Symposium 2025',
      date: '2025-11-15',
      venue: 'Main Auditorium',
      description: 'Annual technology conference featuring industry leaders',
      qrCode: 'QR-TECH-2025',
      registrations: ['CS2024001', 'CS2024002', 'CS2024003', 'CS2024004'],
      checkins: ['CS2024001', 'CS2024002'],
    },
    {
      id: '2',
      name: 'Cultural Fest',
      date: '2025-11-20',
      venue: 'Sports Complex',
      description: 'Celebrate diversity with music, dance, and food',
      qrCode: 'QR-CULT-2025',
      registrations: ['CS2024001', 'CS2024003'],
      checkins: ['CS2024001'],
    },
    {
      id: '3',
      name: 'Hackathon 2025',
      date: '2025-11-25',
      venue: 'Computer Lab Block',
      description: '24-hour coding competition with amazing prizes',
      qrCode: 'QR-HACK-2025',
      registrations: ['CS2024002', 'CS2024004'],
      checkins: [],
    },
    {
      id: '4',
      name: 'Sports Day',
      date: '2025-11-30',
      venue: 'Sports Ground',
      description: 'Inter-department sports competition',
      qrCode: 'QR-SPORT-2025',
      registrations: ['CS2024003'],
      checkins: [],
    },
  ]);

  const [registrations, setRegistrations] = useState<EventRegistration[]>([
    { eventId: '1', studentRollNo: 'CS2024001', studentName: 'John Doe', registeredAt: '2025-11-10 10:30:00' },
    { eventId: '1', studentRollNo: 'CS2024002', studentName: 'Jane Smith', registeredAt: '2025-11-10 11:15:00' },
    { eventId: '1', studentRollNo: 'CS2024003', studentName: 'Mike Johnson', registeredAt: '2025-11-10 14:20:00' },
    { eventId: '1', studentRollNo: 'CS2024004', studentName: 'Sarah Wilson', registeredAt: '2025-11-11 09:00:00' },
    { eventId: '2', studentRollNo: 'CS2024001', studentName: 'John Doe', registeredAt: '2025-11-12 16:00:00' },
    { eventId: '2', studentRollNo: 'CS2024003', studentName: 'Mike Johnson', registeredAt: '2025-11-12 16:30:00' },
    { eventId: '3', studentRollNo: 'CS2024002', studentName: 'Jane Smith', registeredAt: '2025-11-13 10:00:00' },
    { eventId: '3', studentRollNo: 'CS2024004', studentName: 'Sarah Wilson', registeredAt: '2025-11-13 11:00:00' },
    { eventId: '4', studentRollNo: 'CS2024003', studentName: 'Mike Johnson', registeredAt: '2025-11-14 15:00:00' },
  ]);

  const [checkins, setCheckins] = useState<EventCheckin[]>([
    { eventId: '1', studentRollNo: 'CS2024001', studentName: 'John Doe', checkinAt: '2025-11-15 09:05:00' },
    { eventId: '1', studentRollNo: 'CS2024002', studentName: 'Jane Smith', checkinAt: '2025-11-15 09:12:00' },
    { eventId: '2', studentRollNo: 'CS2024001', studentName: 'John Doe', checkinAt: '2025-11-20 10:00:00' },
  ]);

  const addEvent = (event: Event) => {
    setEvents([event, ...events]);
  };

  const registerForEvent = (eventId: string, studentRollNo: string, studentName: string): boolean => {
    // Check if already registered
    const alreadyRegistered = registrations.some(
      (reg) => reg.eventId === eventId && reg.studentRollNo === studentRollNo
    );

    if (alreadyRegistered) {
      return false;
    }

    const newRegistration: EventRegistration = {
      eventId,
      studentRollNo,
      studentName,
      registeredAt: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    setRegistrations([...registrations, newRegistration]);

    // Update event registrations
    setEvents(
      events.map((e) =>
        e.id === eventId && !e.registrations.includes(studentRollNo)
          ? { ...e, registrations: [...e.registrations, studentRollNo] }
          : e
      )
    );

    return true;
  };

  const checkinToEvent = (eventId: string, studentRollNo: string, studentName: string): boolean => {
    // Check if already checked in
    const alreadyCheckedIn = checkins.some(
      (checkin) => checkin.eventId === eventId && checkin.studentRollNo === studentRollNo
    );

    if (alreadyCheckedIn) {
      return false;
    }

    const newCheckin: EventCheckin = {
      eventId,
      studentRollNo,
      studentName,
      checkinAt: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    setCheckins([...checkins, newCheckin]);

    // Update event checkins
    setEvents(
      events.map((e) =>
        e.id === eventId && !e.checkins.includes(studentRollNo)
          ? { ...e, checkins: [...e.checkins, studentRollNo] }
          : e
      )
    );

    // Auto-register if not already registered
    if (!registrations.some((reg) => reg.eventId === eventId && reg.studentRollNo === studentRollNo)) {
      registerForEvent(eventId, studentRollNo, studentName);
    }

    return true;
  };

  const getEventCheckins = (eventId: string): EventCheckin[] => {
    return checkins.filter((checkin) => checkin.eventId === eventId);
  };

  const getStudentEvents = (studentRollNo: string) => {
    return {
      registered: registrations.filter((reg) => reg.studentRollNo === studentRollNo),
      checkedIn: checkins.filter((checkin) => checkin.studentRollNo === studentRollNo),
    };
  };

  return (
    <EventContext.Provider
      value={{
        events,
        registrations,
        checkins,
        addEvent,
        registerForEvent,
        checkinToEvent,
        getEventCheckins,
        getStudentEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
