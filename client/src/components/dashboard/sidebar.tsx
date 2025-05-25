import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@shared/schema";
import { 
  Database, 
  Calendar, 
  Clock, 
  Plus, 
  Download, 
  Settings,
  X,
  CalendarDays,
  Flame,
  Ban,
  Facebook,
  Send
} from "lucide-react";

type Section = 
  | "allData" 
  | "todayData" 
  | "facebookData" 
  | "facebookRequest" 
  | "followUp" 
  | "hotData" 
  | "blockData" 
  | "newList" 
  | "requestData" 
  | "holidays" 
  | "adminPanel";

interface SidebarProps {
  currentSection: Section;
  onSectionChange: (section: Section) => void;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  followUpCount: number;
  hotDataCount: number;
  blockDataCount: number;
}

export function Sidebar({ 
  currentSection, 
  onSectionChange, 
  isOpen, 
  onClose, 
  user,
  followUpCount,
  hotDataCount,
  blockDataCount
}: SidebarProps) {
  const sidebarClasses = `
    w-80 bg-white shadow-sm h-screen sticky top-0 transform transition-transform duration-300 ease-in-out
    lg:translate-x-0 lg:relative absolute z-20
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  const navItems = [
    {
      id: "allData" as Section,
      label: "All Data",
      icon: Database,
      color: "text-primary",
    },
    {
      id: "todayData" as Section,
      label: "Today's Data",
      icon: Calendar,
      color: "text-gray-600",
    },
    {
      id: "facebookData" as Section,
      label: "Facebook Data",
      icon: Facebook,
      color: "text-gray-600",
    },
    {
      id: "facebookRequest" as Section,
      label: "Facebook Data Request",
      icon: Send,
      color: "text-gray-600",
    },
    {
      id: "followUp" as Section,
      label: "Follow-Up",
      icon: Clock,
      color: "text-warning",
      count: followUpCount,
    },
    {
      id: "hotData" as Section,
      label: "Hot Data",
      icon: Flame,
      color: "text-success",
      count: hotDataCount,
    },
    {
      id: "blockData" as Section,
      label: "Block Data",
      icon: Ban,
      color: "text-destructive",
      count: blockDataCount,
    },
    {
      id: "newList" as Section,
      label: "New List Data",
      icon: Plus,
      color: "text-gray-600",
    },
    {
      id: "requestData" as Section,
      label: "Request Data",
      icon: Download,
      color: "text-gray-600",
    },
    {
      id: "holidays" as Section,
      label: "Holidays",
      icon: CalendarDays,
      color: "text-gray-600",
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="p-6">
          {/* Close button for mobile */}
          <div className="flex justify-end lg:hidden mb-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Attendance Display */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Login Time</p>
                <p className="text-lg font-bold text-green-900">
                  {user?.loginTime ? new Date(user.loginTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Not recorded'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start h-auto py-3 px-4 ${
                    isActive 
                      ? 'bg-blue-50 text-primary hover:bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onSectionChange(item.id);
                    onClose(); // Close sidebar on mobile when item is selected
                  }}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-primary' : item.color}`} />
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className={`ml-auto text-white ${
                        item.color === 'text-warning' ? 'bg-yellow-500' :
                        item.color === 'text-success' ? 'bg-green-500' :
                        item.color === 'text-destructive' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}
                    >
                      {item.count}
                    </Badge>
                  )}
                </Button>
              );
            })}

            {/* Admin Panel (conditional) */}
            {user && ["tl", "manager", "admin"].includes(user.role) && (
              <div className="border-t pt-4 mt-4">
                <Button
                  variant="ghost"
                  className={`w-full justify-start h-auto py-3 px-4 ${
                    currentSection === "adminPanel" 
                      ? 'bg-blue-50 text-primary hover:bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onSectionChange("adminPanel");
                    onClose();
                  }}
                >
                  <Settings className={`h-5 w-5 mr-3 ${
                    currentSection === "adminPanel" ? 'text-primary' : 'text-gray-600'
                  }`} />
                  <span className="font-medium">Admin Panel</span>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
