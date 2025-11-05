import { useState } from 'react';
import { User } from '../App';
import { useEvents } from '../context/EventContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { LogOut, QrCode, Calendar, MapPin, Users, TrendingUp, Plus, ScanLine, CheckCircle, Eye, Clock } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EventOrganizerDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function EventOrganizerDashboard({ user, onLogout }: EventOrganizerDashboardProps) {
  const { events, addEvent, checkinToEvent, getEventCheckins } = useEvents();
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    venue: '',
    description: '',
  });

  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showCheckinsListModal, setShowCheckinsListModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [manualRollNo, setManualRollNo] = useState('');
  const [manualName, setManualName] = useState('');

  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, e) => sum + e.registrations.length, 0);
  const totalCheckins = events.reduce((sum, e) => sum + e.checkins.length, 0);
  const avgRate = totalRegistrations > 0 ? Math.round((totalCheckins / totalRegistrations) * 100) : 0;

  const chartData = events.slice(0, 5).map(e => ({
    name: e.name.substring(0, 15),
    registrations: e.registrations.length,
    checkins: e.checkins.length,
  }));

  const trendData = events.slice(0, 5).map((e, i) => ({
    event: `E${i + 1}`,
    rate: e.registrations.length > 0 ? Math.round((e.checkins.length / e.registrations.length) * 100) : 0,
  }));

  const handleCreateEvent = () => {
    if (!newEvent.name || !newEvent.date || !newEvent.venue) {
      toast.error('Please fill all required fields');
      return;
    }

    const qrCode = `QR-${newEvent.name.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 8)}`;
    const event = {
      id: Date.now().toString(),
      ...newEvent,
      registrations: [],
      checkins: [],
      qrCode,
    };

    addEvent(event);
    setSelectedQR(qrCode);
    setShowQRModal(true);
    setNewEvent({ name: '', date: '', venue: '', description: '' });
    toast.success('✅ Event created and QR generated!');
  };

  const handleCheckin = () => {
    if (!manualRollNo || !manualName || !selectedEventId) {
      toast.error('Please enter both roll number and name');
      return;
    }

    const success = checkinToEvent(selectedEventId, manualRollNo, manualName);
    
    if (success) {
      toast.success(`✅ Check-in recorded for ${manualName}`);
      setManualRollNo('');
      setManualName('');
      setShowCheckinModal(false);
    } else {
      toast.error('Already checked in for this event');
    }
  };

  const currentEventCheckins = selectedEventId ? getEventCheckins(selectedEventId) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-800 dark:via-pink-800 dark:to-rose-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-white mb-1">Event Organizer Dashboard</h1>
            <p className="text-purple-100">Welcome back, {user.name}!</p>
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
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Events</p>
                <p className="text-white mt-2">{totalEvents}</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Registrations</p>
                <p className="text-white mt-2">{totalRegistrations}</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Check-ins</p>
                <p className="text-white mt-2">{totalCheckins}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-200" />
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

        {/* Create Event Form */}
        <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
          <h2 className="text-gray-900 dark:text-white mb-4">Create New Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                placeholder="Amazing Event 2025"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                placeholder="Main Auditorium"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event description"
                className="mt-1"
              />
            </div>
          </div>
          <Button
            onClick={handleCreateEvent}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event & Generate QR
          </Button>
        </Card>

        {/* Events Table */}
        <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
          <h2 className="text-gray-900 dark:text-white mb-4">Events & Check-ins</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Check-ins</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.venue}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500 text-white">{event.registrations.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500 text-white">{event.checkins.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEventId(event.id);
                            setShowCheckinsListModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Check-ins
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedQR(event.qrCode);
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
                            setSelectedEventId(event.id);
                            setShowCheckinModal(true);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Check-in
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
            <h2 className="text-gray-900 dark:text-white mb-4">Event Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="registrations" fill="#8b5cf6" name="Registrations" stackId="a" />
                <Bar dataKey="checkins" fill="#22c55e" name="Check-ins" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
            <h2 className="text-gray-900 dark:text-white mb-4">Check-in Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="rate" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} name="Rate %" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* QR Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event QR Code</DialogTitle>
            <DialogDescription>Participants can scan this QR code to register and check in</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center p-6">
            <div className="w-64 h-64 bg-white border-4 border-purple-600 rounded-lg flex items-center justify-center shadow-xl">
              <div className="text-center">
                <QrCode className="w-32 h-32 mx-auto text-purple-600 mb-4" />
                <p className="text-gray-800">{selectedQR}</p>
              </div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-center">
              Participants can scan this QR code to register/check-in
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-ins List Modal */}
      <Dialog open={showCheckinsListModal} onOpenChange={setShowCheckinsListModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Check-ins</DialogTitle>
            <DialogDescription>View all participants who have checked in to this event</DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {selectedEventId && (
              <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="text-gray-900 dark:text-white mb-2">
                  {events.find(e => e.id === selectedEventId)?.name}
                </h3>
                <div className="flex gap-4 text-gray-600 dark:text-gray-300">
                  <span>📅 {events.find(e => e.id === selectedEventId)?.date}</span>
                  <span>📍 {events.find(e => e.id === selectedEventId)?.venue}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Badge className="bg-blue-500">
                    {events.find(e => e.id === selectedEventId)?.registrations.length} Registered
                  </Badge>
                  <Badge className="bg-green-500">
                    {events.find(e => e.id === selectedEventId)?.checkins.length} Checked In
                  </Badge>
                </div>
              </div>
            )}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentEventCheckins.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No check-ins yet for this event
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Participant Name</TableHead>
                      <TableHead>Check-in Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentEventCheckins.map((checkin, index) => (
                      <TableRow key={`${checkin.eventId}-${checkin.studentRollNo}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{checkin.studentRollNo}</Badge>
                        </TableCell>
                        <TableCell>{checkin.studentName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{checkin.checkinAt}</span>
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

      {/* Check-in Modal */}
      <Dialog open={showCheckinModal} onOpenChange={setShowCheckinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event Check-in</DialogTitle>
            <DialogDescription>Scan participant QR code or enter details manually</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-green-500 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-center">
                <ScanLine className="w-16 h-16 mx-auto text-green-600 mb-2 animate-pulse" />
                <p className="text-gray-600 dark:text-gray-300">Scan Participant QR Code</p>
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
              <Label htmlFor="rollNo">Roll Number / ID</Label>
              <Input
                id="rollNo"
                value={manualRollNo}
                onChange={(e) => setManualRollNo(e.target.value)}
                placeholder="CS2024001"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="name">Participant Name</Label>
              <Input
                id="name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleCheckin}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              Confirm Check-in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
