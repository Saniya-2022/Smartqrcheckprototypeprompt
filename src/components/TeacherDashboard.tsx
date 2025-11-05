import { useState } from 'react';
import { User } from '../App';
import { useAttendance } from '../context/AttendanceContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { LogOut, QrCode, Users, BookOpen, TrendingUp, Plus, ScanLine, UserPlus, Eye, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const { sessions, addSession, markAttendance, getSessionAttendees } = useAttendance();
  
  const [newSession, setNewSession] = useState({
    topic: '',
    date: '',
    time: '',
    room: '',
    duration: '',
  });

  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [manualRollNo, setManualRollNo] = useState('');
  const [manualName, setManualName] = useState('');

  const totalSessions = sessions.length;
  const totalStudents = 50;
  const totalAttended = sessions.reduce((sum, s) => sum + s.attendees.length, 0);
  const avgRate = totalSessions > 0 ? Math.round((totalAttended / (totalSessions * totalStudents)) * 100) : 0;

  const chartData = sessions.slice(0, 5).map(s => ({
    name: s.topic.substring(0, 10),
    attended: s.attendees.length,
    total: totalStudents,
  }));

  const trendData = sessions.slice(0, 5).map((s, i) => ({
    session: `S${i + 1}`,
    rate: Math.round((s.attendees.length / totalStudents) * 100),
  }));

  const handleCreateSession = () => {
    if (!newSession.topic || !newSession.date || !newSession.time || !newSession.room) {
      toast.error('Please fill all required fields');
      return;
    }

    const qrCode = `QR-${newSession.topic.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8)}`;
    const session = {
      id: Date.now().toString(),
      ...newSession,
      attendees: [],
      qrCode,
    };

    addSession(session);
    setSelectedQR(qrCode);
    setShowQRModal(true);
    setNewSession({ topic: '', date: '', time: '', room: '', duration: '' });
    toast.success('✅ Session created and QR generated!');
  };

  const handleAddAttendance = () => {
    if (!manualRollNo || !manualName || !selectedSessionId) {
      toast.error('Please enter both roll number and name');
      return;
    }

    const success = markAttendance(selectedSessionId, manualRollNo, manualName);
    
    if (success) {
      toast.success(`✅ Attendance recorded for ${manualName}`);
      setManualRollNo('');
      setManualName('');
      setShowAddModal(false);
    } else {
      toast.error('Attendance already marked for this student');
    }
  };

  const currentSessionAttendees = selectedSessionId ? getSessionAttendees(selectedSessionId) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-800 dark:via-purple-800 dark:to-violet-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-white mb-1">Teacher Dashboard</h1>
            <p className="text-indigo-100">Welcome back, {user.name}!</p>
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

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-green-100">Total Students</p>
                <p className="text-white mt-2">{totalStudents}</p>
              </div>
              <Users className="w-10 h-10 text-green-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Attendance</p>
                <p className="text-white mt-2">{totalAttended}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Avg. Rate</p>
                <p className="text-white mt-2">{avgRate}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Create Session Form */}
        <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
          <h2 className="text-gray-900 dark:text-white mb-4">Create New Session</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={newSession.topic}
                onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                placeholder="Session topic"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newSession.date}
                onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newSession.time}
                onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                value={newSession.room}
                onChange={(e) => setNewSession({ ...newSession, room: e.target.value })}
                placeholder="Room 101"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={newSession.duration}
                onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                placeholder="60 min"
                className="mt-1"
              />
            </div>
          </div>
          <Button
            onClick={handleCreateSession}
            className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Generate QR Code
          </Button>
        </Card>

        {/* Sessions Table */}
        <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
          <h2 className="text-gray-900 dark:text-white mb-4">Sessions & Attendance</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Attended</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.topic}</TableCell>
                    <TableCell>{session.date}</TableCell>
                    <TableCell>{session.time}</TableCell>
                    <TableCell>{session.room}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500 text-white">
                        {session.attendees.length}/{totalStudents}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            setShowAttendanceModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Attendance
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedQR(session.qrCode);
                            setShowQRModal(true);
                          }}
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          QR
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            setShowAddModal(true);
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
            <h2 className="text-gray-900 dark:text-white mb-4">Attendance Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attended" fill="#8b5cf6" name="Attended" />
                <Bar dataKey="total" fill="#e5e7eb" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
            <h2 className="text-gray-900 dark:text-white mb-4">Attendance Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} name="Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* QR Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session QR Code</DialogTitle>
            <DialogDescription>Students can scan this QR code to mark their attendance</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center p-6">
            <div className="w-64 h-64 bg-white border-4 border-indigo-600 rounded-lg flex items-center justify-center shadow-xl">
              <div className="text-center">
                <QrCode className="w-32 h-32 mx-auto text-indigo-600 mb-4" />
                <p className="text-gray-800">{selectedQR}</p>
              </div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-center">
              Students can scan this QR code to mark attendance
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendance List Modal */}
      <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance List</DialogTitle>
            <DialogDescription>View all students who have marked their attendance for this session</DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {selectedSessionId && (
              <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <h3 className="text-gray-900 dark:text-white mb-2">
                  {sessions.find(s => s.id === selectedSessionId)?.topic}
                </h3>
                <div className="flex gap-4 text-gray-600 dark:text-gray-300">
                  <span>📅 {sessions.find(s => s.id === selectedSessionId)?.date}</span>
                  <span>🕐 {sessions.find(s => s.id === selectedSessionId)?.time}</span>
                  <span>📍 {sessions.find(s => s.id === selectedSessionId)?.room}</span>
                </div>
              </div>
            )}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentSessionAttendees.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No students have marked attendance yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSessionAttendees.map((record, index) => (
                      <TableRow key={`${record.sessionId}-${record.studentRollNo}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.studentRollNo}</Badge>
                        </TableCell>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{record.timestamp}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Attendance Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Attendance</DialogTitle>
            <DialogDescription>Scan student QR code or enter details manually</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-green-500 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-center">
                <ScanLine className="w-16 h-16 mx-auto text-green-600 mb-2 animate-pulse" />
                <p className="text-gray-600 dark:text-gray-300">Scan Student QR Code</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">OR Manual Entry</span>
              </div>
            </div>
            <div>
              <Label htmlFor="rollNo">Roll Number</Label>
              <Input
                id="rollNo"
                value={manualRollNo}
                onChange={(e) => setManualRollNo(e.target.value)}
                placeholder="CS2024001"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="name">Student Name</Label>
              <Input
                id="name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleAddAttendance}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
