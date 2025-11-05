import { useState } from 'react';
import { User } from '../App';
import { useAttendance } from '../context/AttendanceContext';
import { useEvents } from '../context/EventContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { LogOut, ScanLine, Calendar, TrendingUp, CheckCircle, BookOpen, CalendarDays, MapPin, QrCode, Clock, Ticket } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const { sessions, markAttendance, getStudentAttendance } = useAttendance();
  const { events, registerForEvent, checkinToEvent, getStudentEvents } = useEvents();
  const studentRollNo = user.rollNo || 'CS2024001';
  const studentAttendance = getStudentAttendance(studentRollNo);
  const studentEvents = getStudentEvents(studentRollNo);
  
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanTab, setScanTab] = useState<'scan' | 'manual'>('scan');
  
  // Event scanning states
  const [scanningEvent, setScanningEvent] = useState(false);
  const [showEventScanModal, setShowEventScanModal] = useState(false);
  const [selectedEventForScan, setSelectedEventForScan] = useState<string | null>(null);
  const [eventScanTab, setEventScanTab] = useState<'scan' | 'manual'>('scan');
  const [manualEventCode, setManualEventCode] = useState('');

  const totalSessions = sessions.length;
  const attended = studentAttendance.length;
  const attendanceRate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;

  const chartData = [
    { name: 'Week 1', present: Math.min(studentAttendance.length, 5), absent: Math.max(0, 5 - Math.min(studentAttendance.length, 5)) },
    { name: 'Week 2', present: Math.max(0, studentAttendance.length - 5), absent: Math.max(0, 5 - Math.max(0, studentAttendance.length - 5)) },
    { name: 'Week 3', present: Math.max(0, studentAttendance.length - 10), absent: Math.max(0, 5 - Math.max(0, studentAttendance.length - 10)) },
  ];

  const handleScan = () => {
    setScanning(true);
    
    setTimeout(() => {
      const unattendedSessions = sessions.filter(
        s => !s.attendees.includes(studentRollNo)
      );
      
      if (unattendedSessions.length > 0) {
        const randomSession = unattendedSessions[Math.floor(Math.random() * unattendedSessions.length)];
        const success = markAttendance(randomSession.id, studentRollNo, user.name);
        
        if (success) {
          toast.success(`✅ Attendance marked for ${randomSession.topic}!`);
        }
      } else {
        toast.error('No active sessions available or already marked');
      }
      
      setScanning(false);
    }, 2000);
  };

  const handleManualSubmit = () => {
    if (!manualCode) {
      toast.error('Please enter session code');
      return;
    }

    const session = sessions.find(s => s.qrCode.toLowerCase() === manualCode.toLowerCase());
    
    if (!session) {
      toast.error('Invalid session code');
      return;
    }

    const success = markAttendance(session.id, studentRollNo, user.name);
    
    if (success) {
      toast.success(`✅ Attendance marked for ${session.topic}!`);
      setManualCode('');
    } else {
      toast.error('Attendance already marked for this session');
    }
  };

  const handleRegister = (eventId: string) => {
    const success = registerForEvent(eventId, studentRollNo, user.name);
    
    if (success) {
      toast.success('✅ Successfully registered for event!');
    } else {
      toast.error('Already registered for this event');
    }
  };

  const handleEventScan = () => {
    if (!selectedEventForScan) return;
    
    setScanningEvent(true);
    
    setTimeout(() => {
      const success = checkinToEvent(selectedEventForScan, studentRollNo, user.name);
      
      if (success) {
        const event = events.find(e => e.id === selectedEventForScan);
        toast.success(`✅ Check-in successful for ${event?.name}!`);
        setShowEventScanModal(false);
        setSelectedEventForScan(null);
      } else {
        toast.error('Already checked in for this event');
      }
      
      setScanningEvent(false);
    }, 2000);
  };

  const handleEventManualSubmit = () => {
    if (!manualEventCode) {
      toast.error('Please enter event code');
      return;
    }

    const event = events.find(e => e.qrCode.toLowerCase() === manualEventCode.toLowerCase());
    
    if (!event) {
      toast.error('Invalid event code');
      return;
    }

    const success = checkinToEvent(event.id, studentRollNo, user.name);
    
    if (success) {
      toast.success(`✅ Check-in successful for ${event.name}!`);
      setManualEventCode('');
      setShowEventScanModal(false);
    } else {
      toast.error('Already checked in for this event');
    }
  };

  const isRegistered = (eventId: string) => studentEvents.registered.some(r => r.eventId === eventId);
  const isCheckedIn = (eventId: string) => studentEvents.checkedIn.some(c => c.eventId === eventId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 dark:from-blue-800 dark:via-cyan-800 dark:to-green-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-white mb-1">Student Dashboard</h1>
            <p className="text-blue-100">
              {user.name} • {user.rollNo} • {user.class}
            </p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Sessions</p>
                    <p className="text-white mt-2">{totalSessions}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-blue-200" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Attended</p>
                    <p className="text-white mt-2">{attended}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-200" />
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Attendance Rate</p>
                    <p className="text-white mt-2">{attendanceRate}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-200" />
                </div>
              </Card>
            </div>

            {/* QR Scanner with Tabs */}
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-gray-900 dark:text-white mb-6 text-center">Mark Attendance</h2>
              
              <Tabs value={scanTab} onValueChange={(v) => setScanTab(v as 'scan' | 'manual')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="scan">
                    <ScanLine className="w-4 h-4 mr-2" />
                    Scan QR Code
                  </TabsTrigger>
                  <TabsTrigger value="manual">
                    <QrCode className="w-4 h-4 mr-2" />
                    Manual Entry
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="scan">
                  <div className="max-w-md mx-auto">
                    <div className="relative mb-6">
                      <div className={`w-full h-80 rounded-2xl border-4 ${scanning ? 'border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20' : 'border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'} flex items-center justify-center transition-all duration-300 overflow-hidden relative`}>
                        
                        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
                        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
                        
                        {scanning ? (
                          <div className="text-center relative z-10">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
                            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-56 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <ScanLine className="w-32 h-32 mx-auto text-green-600 animate-pulse" />
                            <p className="mt-4 text-green-700 dark:text-green-400">Scanning QR Code...</p>
                            <p className="text-green-600 dark:text-green-500 mt-2">Please hold steady</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-48 h-48 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg flex items-center justify-center mb-4">
                              <QrCode className="w-24 h-24 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">Position QR code within frame</p>
                            <p className="text-gray-500 dark:text-gray-500 mt-1">Align with corner guides</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={handleScan}
                      disabled={scanning}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg disabled:opacity-50 py-6"
                    >
                      {scanning ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Scanning...
                        </>
                      ) : (
                        <>
                          <ScanLine className="w-5 h-5 mr-2" />
                          Start Scan
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="manual">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="p-6 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-center">
                      <QrCode className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400 mb-3" />
                      <p className="text-gray-700 dark:text-gray-300 mb-1">Enter Session Code</p>
                      <p className="text-gray-500 dark:text-gray-400">Paste the QR code or session ID</p>
                    </div>
                    <div>
                      <Label htmlFor="code">Session Code / QR Data</Label>
                      <Input
                        id="code"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="e.g., QR-DS-001"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleManualSubmit}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Attended Sessions */}
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-gray-900 dark:text-white mb-4">My Attended Sessions</h2>
              {studentAttendance.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No sessions attended yet</p>
                  <p className="mt-2">Scan a QR code to mark your attendance</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentAttendance.map((record) => {
                    const session = sessions.find(s => s.id === record.sessionId);
                    return session ? (
                      <Card key={record.sessionId} className="p-4 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-gray-900 dark:text-white">{session.topic}</h3>
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Present
                          </Badge>
                        </div>
                        <div className="space-y-2 text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{session.time} • {session.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{session.room}</span>
                          </div>
                          <div className="text-green-600 dark:text-green-400 mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                            Marked at: {record.timestamp}
                          </div>
                        </div>
                      </Card>
                    ) : null;
                  })}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => {
                const registered = isRegistered(event.id);
                const checkedIn = isCheckedIn(event.id);
                
                return (
                  <Card key={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className={`h-32 bg-gradient-to-r ${
                      event.id === '1' ? 'from-blue-500 to-cyan-500' :
                      event.id === '2' ? 'from-pink-500 to-rose-500' :
                      event.id === '3' ? 'from-purple-500 to-indigo-500' :
                      'from-green-500 to-emerald-500'
                    } p-6 text-white`}>
                      <h3 className="text-white mb-2">{event.name}</h3>
                      <div className="flex items-center gap-4 text-white/90">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.venue}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-800">
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {event.description}
                      </p>
                      <div className="flex gap-2">
                        {checkedIn ? (
                          <Badge className="bg-green-500 text-white">
                            <Ticket className="w-3 h-3 mr-1" />
                            Attended
                          </Badge>
                        ) : registered ? (
                          <>
                            <Badge className="bg-blue-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Registered
                            </Badge>
                            <Button
                              onClick={() => {
                                setSelectedEventForScan(event.id);
                                setShowEventScanModal(true);
                              }}
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                            >
                              <ScanLine className="w-3 h-3 mr-1" />
                              Scan to Check-in
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleRegister(event.id)}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                          >
                            Register Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Event Attendance History */}
            {studentEvents.checkedIn.length > 0 && (
              <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
                <h2 className="text-gray-900 dark:text-white mb-4">My Event Attendance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentEvents.checkedIn.map((checkin) => {
                    const event = events.find(e => e.id === checkin.eventId);
                    return event ? (
                      <Card key={checkin.eventId} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-gray-900 dark:text-white">{event.name}</h3>
                          <Badge className="bg-green-500 text-white">
                            <Ticket className="w-3 h-3 mr-1" />
                            Attended
                          </Badge>
                        </div>
                        <div className="space-y-2 text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue}</span>
                          </div>
                          <div className="text-green-600 dark:text-green-400 mt-2 pt-2 border-t border-purple-200 dark:border-purple-800">
                            Checked in: {checkin.checkinAt}
                          </div>
                        </div>
                      </Card>
                    ) : null;
                  })}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
              <h2 className="text-gray-900 dark:text-white mb-6">Attendance Analytics</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#22c55e" name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
                <h3 className="text-gray-900 dark:text-white mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Total Sessions</span>
                    <span className="text-gray-900 dark:text-white">{totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Present</span>
                    <span className="text-green-600">{attended}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Absent</span>
                    <span className="text-red-600">{totalSessions - attended}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Attendance Rate</span>
                    <span className="text-purple-600">{attendanceRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Events Attended</span>
                    <span className="text-purple-600">{studentEvents.checkedIn.length}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <h3 className="text-white mb-4">Performance Status</h3>
                <div className="text-center py-8">
                  <div className="text-white mb-2">
                    {attendanceRate}%
                  </div>
                  <p className="text-indigo-100">
                    {attendanceRate >= 75 ? '🎉 Excellent Attendance!' : '⚠️ Improve Attendance'}
                  </p>
                  {attendanceRate < 75 && totalSessions > 0 && (
                    <p className="text-indigo-200 mt-2">
                      Need {Math.ceil((totalSessions * 0.75) - attended)} more sessions
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-indigo-400">
                    <p className="text-indigo-100">Events: {studentEvents.checkedIn.length} attended</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Event Scan Modal */}
      <Dialog open={showEventScanModal} onOpenChange={setShowEventScanModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event Check-in</DialogTitle>
            <DialogDescription>Scan the event QR code or enter the event code manually to check in</DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <Tabs value={eventScanTab} onValueChange={(v) => setEventScanTab(v as 'scan' | 'manual')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="scan">
                  <ScanLine className="w-4 h-4 mr-2" />
                  Scan QR
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <QrCode className="w-4 h-4 mr-2" />
                  Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scan">
                <div className="space-y-4">
                  <div className="relative">
                    <div className={`w-full h-64 rounded-lg border-4 ${scanningEvent ? 'border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20' : 'border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'} flex items-center justify-center transition-all duration-300`}>
                      {scanningEvent ? (
                        <div className="text-center">
                          <ScanLine className="w-24 h-24 mx-auto text-green-600 animate-pulse" />
                          <p className="mt-4 text-green-700 dark:text-green-400">Scanning...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Ticket className="w-24 h-24 mx-auto text-purple-400" />
                          <p className="mt-4 text-gray-600 dark:text-gray-300">Position Event QR Code</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleEventScan}
                    disabled={scanningEvent}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6"
                  >
                    {scanningEvent ? 'Scanning...' : 'Start Scan'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="manual">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eventCode">Event Code</Label>
                    <Input
                      id="eventCode"
                      value={manualEventCode}
                      onChange={(e) => setManualEventCode(e.target.value)}
                      placeholder="e.g., QR-TECH-2025"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleEventManualSubmit}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Check-in
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
