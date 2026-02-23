// Simple icon wrapper using Lucide React as fallback
import React from 'react';
import * as LucideIcons from 'lucide-react';

// Map icon names to Lucide icons
const iconMap: Record<string, React.ComponentType<any>> = {
  AlertCircle: LucideIcons.AlertCircle,
  ArrowDown: LucideIcons.ArrowDown,
  ArrowLeft: LucideIcons.ArrowLeft,
  ArrowRight: LucideIcons.ArrowRight,
  ArrowRight01: LucideIcons.ArrowRight,
  ArrowUp: LucideIcons.ArrowUp,
  Award: LucideIcons.Award,
  BarChart01: LucideIcons.BarChart3,
  BookOpen: LucideIcons.BookOpen,
  Building2: LucideIcons.Building2,
  Calendar: LucideIcons.Calendar,
  CheckCircle: LucideIcons.CheckCircle,
  CheckSquare: LucideIcons.CheckSquare2,
  ChevronDown: LucideIcons.ChevronDown,
  ChevronLeft: LucideIcons.ChevronLeft,
  ChevronRight: LucideIcons.ChevronRight,
  ChevronUp: LucideIcons.ChevronUp,
  Circle: LucideIcons.Circle,
  ClipboardList: LucideIcons.ClipboardList,
  Clock: LucideIcons.Clock,
  Copy: LucideIcons.Copy,
  CreditCard: LucideIcons.CreditCard,
  DollarSign: LucideIcons.DollarSign,
  Download01: LucideIcons.Download,
  Dot: LucideIcons.Dot,
  Edit02: LucideIcons.Edit2,
  Eye: LucideIcons.Eye,
  EyeOff: LucideIcons.EyeOff,
  File: LucideIcons.File,
  FileText: LucideIcons.FileText,
  Filter: LucideIcons.Filter,
  GripVertical: LucideIcons.GripVertical,
  LayoutDashboard: LucideIcons.LayoutDashboard,
  Layers: LucideIcons.Layers,
  Loading01: LucideIcons.Loader,
  Mail: LucideIcons.Mail,
  MapPin: LucideIcons.MapPin,
  MoreHorizontal: LucideIcons.MoreHorizontal,
  MoreVertical: LucideIcons.MoreVertical,
  PanelLeft: LucideIcons.PanelLeft,
  Pause: LucideIcons.Pause,
  PieChart01: LucideIcons.PieChart,
  Phone01: LucideIcons.Phone,
  Plus: LucideIcons.Plus,
  RotateCcw: LucideIcons.RotateCcw,
  Save: LucideIcons.Save,
  Search: LucideIcons.Search,
  Send: LucideIcons.Send,
  Settings: LucideIcons.Settings,
  Share01: LucideIcons.Share2,
  Ticket: LucideIcons.Ticket,
  TrendingDown: LucideIcons.TrendingDown,
  TrendingUp: LucideIcons.TrendingUp,
  Trophy: LucideIcons.Trophy,
  Trash01: LucideIcons.Trash2,
  Upload01: LucideIcons.Upload,
  Users: LucideIcons.Users,
  XClose: LucideIcons.X,
  Bell: LucideIcons.Bell,
  User: LucideIcons.User,
  LogOut: LucideIcons.LogOut,
};

// Export icons using Lucide as fallback
export const createIcon = (name: string) => {
  const LucideIcon = iconMap[name];
  if (LucideIcon) {
    return LucideIcon;
  }
  // Fallback to a generic icon if not found
  return LucideIcons.Circle;
};

// Export all icons
export const AlertCircle = iconMap.AlertCircle || LucideIcons.AlertCircle;
export const ArrowDown = iconMap.ArrowDown || LucideIcons.ArrowDown;
export const ArrowLeft = iconMap.ArrowLeft || LucideIcons.ArrowLeft;
export const ArrowRight = iconMap.ArrowRight || LucideIcons.ArrowRight;
export const ArrowRight01 = iconMap.ArrowRight01 || LucideIcons.ArrowRight;
export const ArrowUp = iconMap.ArrowUp || LucideIcons.ArrowUp;
export const Award = iconMap.Award || LucideIcons.Award;
export const BarChart01 = iconMap.BarChart01 || LucideIcons.BarChart3;
export const BookOpen = iconMap.BookOpen || LucideIcons.BookOpen;
export const Building2 = iconMap.Building2 || LucideIcons.Building2;
export const Calendar = iconMap.Calendar || LucideIcons.Calendar;
export const CheckCircle = iconMap.CheckCircle || LucideIcons.CheckCircle;
export const CheckSquare = iconMap.CheckSquare || LucideIcons.CheckSquare2;
export const ChevronDown = iconMap.ChevronDown || LucideIcons.ChevronDown;
export const ChevronLeft = iconMap.ChevronLeft || LucideIcons.ChevronLeft;
export const ChevronRight = iconMap.ChevronRight || LucideIcons.ChevronRight;
export const ChevronUp = iconMap.ChevronUp || LucideIcons.ChevronUp;
export const Circle = iconMap.Circle || LucideIcons.Circle;
export const ClipboardList = iconMap.ClipboardList || LucideIcons.ClipboardList;
export const Clock = iconMap.Clock || LucideIcons.Clock;
export const Copy = iconMap.Copy || LucideIcons.Copy;
export const CreditCard = iconMap.CreditCard || LucideIcons.CreditCard;
export const DollarSign = iconMap.DollarSign || LucideIcons.DollarSign;
export const Download01 = iconMap.Download01 || LucideIcons.Download;
export const Dot = iconMap.Dot || LucideIcons.Dot;
export const Edit02 = iconMap.Edit02 || LucideIcons.Edit2;
export const Eye = iconMap.Eye || LucideIcons.Eye;
export const EyeOff = iconMap.EyeOff || LucideIcons.EyeOff;
export const File = iconMap.File || LucideIcons.File;
export const FileText = iconMap.FileText || LucideIcons.FileText;
export const Filter = iconMap.Filter || LucideIcons.Filter;
export const GripVertical = iconMap.GripVertical || LucideIcons.GripVertical;
export const LayoutDashboard = iconMap.LayoutDashboard || LucideIcons.LayoutDashboard;
export const Layers = iconMap.Layers || LucideIcons.Layers;
export const Loading01 = iconMap.Loading01 || LucideIcons.Loader;
export const Mail = iconMap.Mail || LucideIcons.Mail;
export const MapPin = iconMap.MapPin || LucideIcons.MapPin;
export const MoreHorizontal = iconMap.MoreHorizontal || LucideIcons.MoreHorizontal;
export const MoreVertical = iconMap.MoreVertical || LucideIcons.MoreVertical;
export const PanelLeft = iconMap.PanelLeft || LucideIcons.PanelLeft;
export const Pause = iconMap.Pause || LucideIcons.Pause;
export const PieChart01 = iconMap.PieChart01 || LucideIcons.PieChart;
export const Phone01 = iconMap.Phone01 || LucideIcons.Phone;
export const Plus = iconMap.Plus || LucideIcons.Plus;
export const RotateCcw = iconMap.RotateCcw || LucideIcons.RotateCcw;
export const Save = iconMap.Save || LucideIcons.Save;
export const Search = iconMap.Search || LucideIcons.Search;
export const Send = iconMap.Send || LucideIcons.Send;
export const Settings = iconMap.Settings || LucideIcons.Settings;
export const Share01 = iconMap.Share01 || LucideIcons.Share2;
export const Ticket = iconMap.Ticket || LucideIcons.Ticket;
export const TrendingDown = iconMap.TrendingDown || LucideIcons.TrendingDown;
export const TrendingUp = iconMap.TrendingUp || LucideIcons.TrendingUp;
export const Trophy = iconMap.Trophy || LucideIcons.Trophy;
export const Trash01 = iconMap.Trash01 || LucideIcons.Trash2;
export const Upload01 = iconMap.Upload01 || LucideIcons.Upload;
export const Users = iconMap.Users || LucideIcons.Users;
export const XClose = iconMap.XClose || LucideIcons.X;
export const Bell = iconMap.Bell || LucideIcons.Bell;
export const User = iconMap.User || LucideIcons.User;
export const LogOut = iconMap.LogOut || LucideIcons.LogOut;
