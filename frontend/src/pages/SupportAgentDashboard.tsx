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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
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
  school: { name: string };
  messages: Message[];
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  sender: { name: string; role: string };
  createdAt: string;
}

const SupportAgentDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [filterStatus, filterPriority]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('assignedToMe', 'true');
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (filterPriority !== 'ALL') params.append('priority', filterPriority);

      const response = await axios.get(`${API_BASE}/support/tickets?${params}`);
      setTickets(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
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
      // Refresh selected ticket
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

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;

    try {
      await axios.put(`${API_BASE}/support/tickets/${selectedTicket.id}`, {
        status: newStatus,
      });
      toast.success(`Ticket marked as ${newStatus.toLowerCase()}`);
      fetchTickets();
      const updated = tickets.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const getTicketStats = () => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'OPEN').length,
      pending: tickets.filter((t) => t.status === 'PENDING').length,
      inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
    };
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

  const stats = getTicketStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Support Tickets</h1>
        <p className="text-gray-600 mt-2">Manage and respond to your assigned tickets</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{stats.total}</div>
              <p className="text-sm text-gray-600 mt-1">Total Assigned</p>
            </div>
          </CardContent>
        </Card>

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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Filter by Status
              </label>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Filter by Priority
              </label>
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
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading tickets..." />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tickets assigned to you at the moment
            </div>
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
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          {ticket.ticketNumber}
                        </span>
                        <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                          <span className="mr-1">{getStatusIcon(ticket.status)}</span>
                          {ticket.status}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{ticket.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>

                      <div className="flex items-center gap-6 mt-3 text-xs text-gray-600">
                        <span>📍 {ticket.school.name}</span>
                        <span>👤 {ticket.createdBy.name}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {ticket.messages.length} messages
                        </span>
                        <span>
                          {new Date(ticket.createdAt).toLocaleDateString()} at{' '}
                          {new Date(ticket.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(ticket);
                        setDialogOpen(true);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      View
                    </Button>
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
                <div className="flex items-baseline justify-between w-full pr-8">
                  <div>
                    <DialogTitle className="text-2xl">{selectedTicket.title}</DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">{selectedTicket.ticketNumber}</p>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Ticket Details Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Priority
                      </p>
                      <Badge className={`mt-1 ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {selectedTicket.category}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-blue-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      From
                    </p>
                    <p className="text-sm text-gray-900">
                      {selectedTicket.createdBy.name}{' '}
                      <span className="text-gray-500">({selectedTicket.createdBy.email})</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      School: {selectedTicket.school.name}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Messages */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Conversation ({selectedTicket.messages.length})
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                    {selectedTicket.messages.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No messages yet</p>
                    ) : (
                      selectedTicket.messages.map((msg) => (
                        <div key={msg.id} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-gray-900">
                              {msg.sender.name}
                              <span className="text-xs text-gray-500 ml-2">({msg.sender.role})</span>
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(msg.createdAt).toLocaleDateString()}{' '}
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{msg.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Reply Section */}
                <div className="space-y-2 pt-4 border-t">
                  <label className="text-sm font-semibold text-gray-700">Send Reply</label>
                  <Textarea
                    placeholder="Type your response to the customer..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="resize-none h-20 border-gray-300"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageInput.trim()}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendingMessage ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>

                {/* Status Update */}
                <div className="pt-4 border-t">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Update Status
                  </label>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={handleStatusChange}
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportAgentDashboard;
