import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Clock, Loader2, MessageSquare, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdBy: { name: string; email: string };
  assignedToAgent?: { name: string; email: string };
  school: { name: string };
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  sender: { name: string; role: string };
  createdAt: string;
}

interface Stats {
  open: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

type StatusType = 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

const SuperAdminSupportDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats>({
    open: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [assignmentStatus, setAssignmentStatus] = useState<string>('');
  const [assigningTicket, setAssigningTicket] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchStats();
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [filterStatus, filterPriority, filterCategory]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (filterPriority !== 'ALL') params.append('priority', filterPriority);
      if (filterCategory !== 'ALL') params.append('category', filterCategory);

      const response = await axios.get(`${API_BASE}/support/tickets?${params}`);
      setTickets(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/support/tickets/stats/dashboard`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedTicket) return;

    try {
      setSendingMessage(true);
      await axios.post(`${API_BASE}/support/tickets/${selectedTicket.id}/messages`, {
        content: messageInput,
      });
      setMessageInput('');
      toast.success('Message sent');
      fetchTickets();
      if (selectedTicket) {
        const updated = tickets.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusChange = async (newStatus: StatusType) => {
    if (!selectedTicket) return;

    try {
      await axios.put(`${API_BASE}/support/tickets/${selectedTicket.id}`, {
        status: newStatus,
      });
      toast.success(`Ticket marked as ${newStatus.toLowerCase()}`);
      fetchTickets();
      // Update selected ticket
      const updated = tickets.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedTicket || !assignmentStatus) return;

    try {
      setAssigningTicket(true);
      await axios.put(`${API_BASE}/support/tickets/${selectedTicket.id}`, {
        assignedToAgent: assignmentStatus === 'unassign' ? null : assignmentStatus,
      });
      toast.success('Ticket assignment updated');
      fetchTickets();
      setAssignmentStatus('');
      const updated = tickets.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      toast.error('Failed to assign ticket');
    } finally {
      setAssigningTicket(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Loader2 className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'OPEN':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <X className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage all support tickets from your schools</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.open}</div>
              <p className="text-sm text-gray-600 mt-1">Open</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.inProgress}</div>
              <p className="text-sm text-gray-600 mt-1">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-sm text-gray-600 mt-1">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{stats.closed}</div>
              <p className="text-sm text-gray-600 mt-1">Closed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="BILLING">Billing</SelectItem>
                  <SelectItem value="TECHNICAL">Technical</SelectItem>
                  <SelectItem value="ACCOUNT">Account</SelectItem>
                  <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading tickets..." />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tickets found</div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setDialogOpen(true);
                  }}
                  className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-gray-600">{ticket.ticketNumber}</span>
                        <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                          <span className="mr-1">{getStatusIcon(ticket.status)}</span>
                          {ticket.status}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{ticket.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                        <span>📍 {ticket.school.name}</span>
                        <span>👤 {ticket.createdBy.name}</span>
                        {ticket.assignedToAgent && (
                          <span className="text-blue-600">🎯 {ticket.assignedToAgent.name}</span>
                        )}
                        <span>💬 {ticket.messages.length} messages</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between w-full pr-8">
                  <div>
                    <DialogTitle className="text-xl">{selectedTicket.title}</DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">{selectedTicket.ticketNumber}</p>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Ticket Details */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Priority</p>
                      <Badge className={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Category</p>
                      <p className="text-sm text-gray-900">{selectedTicket.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Created By</p>
                      <p className="text-sm text-gray-900">{selectedTicket.createdBy.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">School</p>
                      <p className="text-sm text-gray-900">{selectedTicket.school.name}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-900">{selectedTicket.description}</p>
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Messages ({selectedTicket.messages.length})
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto space-y-3">
                    {selectedTicket.messages.map((msg) => (
                      <div key={msg.id} className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-gray-900">{msg.sender.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* New Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Add message</label>
                  <Textarea
                    placeholder="Type your response..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="resize-none h-20"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageInput.trim()}
                    className="w-full"
                    size="sm"
                  >
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>

                {/* Status & Assignment */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Change Status
                    </label>
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(value) => handleStatusChange(value as StatusType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Assign Agent
                    </label>
                    <div className="flex gap-2">
                      <Select value={assignmentStatus} onValueChange={setAssignmentStatus}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select agent..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassign">Unassign</SelectItem>
                          <SelectItem value="agent-1">Agent 1</SelectItem>
                          <SelectItem value="agent-2">Agent 2</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAssignTicket}
                        disabled={!assignmentStatus || assigningTicket}
                        size="sm"
                        variant="outline"
                      >
                        {assigningTicket ? '...' : 'Assign'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminSupportDashboard;
