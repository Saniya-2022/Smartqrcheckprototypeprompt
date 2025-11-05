import { createContext, useContext, useState, ReactNode } from 'react';

export interface Session {
  id: string;
  topic: string;
  date: string;
  time: string;
  room: string;
  duration: string;
  qrCode: string;
  attendees: string[]; // Array of student roll numbers
}

export interface AttendanceRecord {
  sessionId: string;
  studentRollNo: string;
  studentName: string;
  timestamp: string;
}

interface AttendanceContextType {
  sessions: Session[];
  attendanceRecords: AttendanceRecord[];
  addSession: (session: Session) => void;
  markAttendance: (sessionId: string, studentRollNo: string, studentName: string) => void;
  getSessionAttendees: (sessionId: string) => AttendanceRecord[];
  getStudentAttendance: (studentRollNo: string) => AttendanceRecord[];
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      topic: 'Data Structures',
      date: '2025-11-05',
      time: '09:00 AM',
      room: 'Room 101',
      duration: '60 min',
      qrCode: 'QR-DS-001',
      attendees: ['CS2024001', 'CS2024002', 'CS2024003'],
    },
    {
      id: '2',
      topic: 'Algorithms',
      date: '2025-11-04',
      time: '11:00 AM',
      room: 'Room 102',
      duration: '90 min',
      qrCode: 'QR-ALG-002',
      attendees: ['CS2024001', 'CS2024004'],
    },
    {
      id: '3',
      topic: 'Database Systems',
      date: '2025-11-03',
      time: '02:00 PM',
      room: 'Room 201',
      duration: '75 min',
      qrCode: 'QR-DB-003',
      attendees: ['CS2024001', 'CS2024002', 'CS2024005'],
    },
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    { sessionId: '1', studentRollNo: 'CS2024001', studentName: 'John Doe', timestamp: '2025-11-05 09:05:00' },
    { sessionId: '1', studentRollNo: 'CS2024002', studentName: 'Jane Smith', timestamp: '2025-11-05 09:07:00' },
    { sessionId: '1', studentRollNo: 'CS2024003', studentName: 'Mike Johnson', timestamp: '2025-11-05 09:10:00' },
    { sessionId: '2', studentRollNo: 'CS2024001', studentName: 'John Doe', timestamp: '2025-11-04 11:05:00' },
    { sessionId: '2', studentRollNo: 'CS2024004', studentName: 'Sarah Wilson', timestamp: '2025-11-04 11:08:00' },
    { sessionId: '3', studentRollNo: 'CS2024001', studentName: 'John Doe', timestamp: '2025-11-03 14:05:00' },
    { sessionId: '3', studentRollNo: 'CS2024002', studentName: 'Jane Smith', timestamp: '2025-11-03 14:06:00' },
    { sessionId: '3', studentRollNo: 'CS2024005', studentName: 'David Brown', timestamp: '2025-11-03 14:12:00' },
  ]);

  const addSession = (session: Session) => {
    setSessions([session, ...sessions]);
  };

  const markAttendance = (sessionId: string, studentRollNo: string, studentName: string) => {
    // Check if already marked
    const alreadyMarked = attendanceRecords.some(
      (record) => record.sessionId === sessionId && record.studentRollNo === studentRollNo
    );

    if (alreadyMarked) {
      return false;
    }

    const newRecord: AttendanceRecord = {
      sessionId,
      studentRollNo,
      studentName,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    setAttendanceRecords([...attendanceRecords, newRecord]);

    // Update session attendees
    setSessions(
      sessions.map((s) =>
        s.id === sessionId && !s.attendees.includes(studentRollNo)
          ? { ...s, attendees: [...s.attendees, studentRollNo] }
          : s
      )
    );

    return true;
  };

  const getSessionAttendees = (sessionId: string) => {
    return attendanceRecords.filter((record) => record.sessionId === sessionId);
  };

  const getStudentAttendance = (studentRollNo: string) => {
    return attendanceRecords.filter((record) => record.studentRollNo === studentRollNo);
  };

  return (
    <AttendanceContext.Provider
      value={{
        sessions,
        attendanceRecords,
        addSession,
        markAttendance,
        getSessionAttendees,
        getStudentAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
