import { useState } from 'react';
import { User } from '../App';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { LogOut, Users, BookOpen, Calendar, TrendingUp, CheckCircle, Download, Activity } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

interface UserData {
  id: string;
  name: string;
  role: string;
  status: string;
}

interface SessionData {
  id: string;
  topic: string;
  teacher: string;
  date: string;
  attendance: number;
}

interface EventData {
  id: string;
  name: string;
  organizer: string;
  date: string;
  participants: number;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [users] = useState<UserData[]>([
    { id: '1', name: 'John Doe', role: 'Student', status: 'Active' },
    { id: '2', name: 'Jane Smith', role: 'Teacher', status: 'Active' },
    { id: '3', name: 'Mike Johnson', role: 'Organizer', status: 'Active' },
    { id: '4', name: 'Sarah Wilson', role: 'Student', status: 'Inactive' },
    { id: '5', name: 'David Brown', role: 'Teacher', status: 'Active' },
  ]);

  const [sessions] = useState<SessionData[]>([
    { id: '1', topic: 'Data Structures', teacher: 'Jane Smith', date: '2025-11-05', attendance: 45 },
    { id: '2', topic: 'Algorithms', teacher: 'David Brown', date: '2025-11-04', attendance: 42 },
    { id: '3', topic: 'Database Systems', teacher: 'Jane Smith', date: '2025-11-03', attendance: 48 },
  ]);

  const [events] = useState<EventData[]>([
    { id: '1', name: 'Tech Symposium 2025', organizer: 'Mike Johnson', date: '2025-11-15', participants: 120 },
    { id: '2', name: 'Cultural Fest', organizer: 'Mike Johnson', date: '2025-11-20', participants: 95 },
  ]);

  const totalTeachers = users.filter(u => u.role === 'Teacher').length;
  const totalStudents = users.filter(u => u.role === 'Student').length;
  const totalEvents = events.length;
  const totalSessions = sessions.length;
  const totalAttendance = sessions.reduce((sum, s) => sum + s.attendance, 0);

  const roleData = [
    { name: 'Students', value: totalStudents, color: '#3b82f6' },
    { name: 'Teachers', value: totalTeachers, color: '#8b5cf6' },
    { name: 'Organizers', value: users.filter(u => u.role === 'Organizer').length, color: '#ec4899' },
  ];

  const attendanceData = sessions.map(s => ({
    name: s.topic.substring(0, 12),
    attendance: s.attendance,
  }));

  const trendData = [
    { month: 'Jul', users: 45, sessions: 12, events: 2 },
    { month: 'Aug', users: 52, sessions: 15, events: 3 },
    { month: 'Sep', users: 68, sessions: 18, events: 4 },
    { month: 'Oct', users: 75, sessions: 20, events: 3 },
    { month: 'Nov', users: 85, sessions: 22, events: 5 },
  ];

  const handleExport = (type: string) => {
    toast.success(`📁 ${type} data exported successfully!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-green-100 dark:from-gray-900 dark:via-purple-900/30 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 via-violet-600 to-green-600 dark:from-sky-800 dark:via-violet-800 dark:to-green-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-white mb-1">Admin Dashboard</h1>
            <p className="text-sky-100">System Overview & Management</p>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Teachers</p>
                <p className="text-white mt-2">{totalTeachers}</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Students</p>
                <p className="text-white mt-2">{totalStudents}</p>
              </div>
              <Users className="w-10 h-10 text-green-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Events</p>
                <p className="text-white mt-2">{totalEvents}</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Sessions</p>
                <p className="text-white mt-2">{totalSessions}</p>
              </div>
              <BookOpen className="w-10 h-10 text-orange-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100">Attendance</p>
                <p className="text-white mt-2">{totalAttendance}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-pink-200" />
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
            <h2 className="text-gray-900 dark:text-white mb-4">User Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg lg:col-span-2">
            <h2 className="text-gray-900 dark:text-white mb-4">Attendance by Session</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendance" fill="#8b5cf6" name="Attendance" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Trend Chart */}
        <Card className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-900 dark:text-white">Growth Trends</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('Users')}
              >
                <Download className="w-4 h-4 mr-1" />
                Users
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('Sessions')}
              >
                <Download className="w-4 h-4 mr-1" />
                Sessions
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('Events')}
              >
                <Download className="w-4 h-4 mr-1" />
                Events
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
              <Line type="monotone" dataKey="sessions" stroke="#8b5cf6" strokeWidth={2} name="Sessions" />
              <Line type="monotone" dataKey="events" stroke="#ec4899" strokeWidth={2} name="Events" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Tabs for detailed data */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 dark:text-white">All Users</h2>
                <Button
                  onClick={() => handleExport('Users')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.role === 'Student'
                                ? 'bg-blue-500'
                                : user.role === 'Teacher'
                                ? 'bg-purple-500'
                                : 'bg-pink-500'
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.status === 'Active'
                                ? 'bg-green-500'
                                : 'bg-gray-500'
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 dark:text-white">All Sessions</h2>
                <Button
                  onClick={() => handleExport('Sessions')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.topic}</TableCell>
                        <TableCell>{session.teacher}</TableCell>
                        <TableCell>{session.date}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">{session.attendance}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gray-900 dark:text-white">All Events</h2>
                <Button
                  onClick={() => handleExport('Events')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Participants</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.name}</TableCell>
                        <TableCell>{event.organizer}</TableCell>
                        <TableCell>{event.date}</TableCell>
                        <TableCell>
                          <Badge className="bg-purple-500">{event.participants}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
