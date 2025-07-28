"use client"

import type React from "react"
import { useState } from "react"

import { Bell, BarChart3, Package, FileText, LogOut, User, Settings, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: { id: string; name: string; email: string; role: "admin" | "staff" }
  onLogout: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  isDarkTheme: boolean
  onThemeChange: (isDark: boolean) => void
}

export function DashboardLayout({
  children,
  user,
  onLogout,
  activeTab,
  onTabChange,
  isDarkTheme,
  onThemeChange,
}: DashboardLayoutProps) {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showAddStaff, setShowAddStaff] = useState(false)

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Package },
    { id: "shipments", label: "Shipments", icon: Truck },
    { id: "alerts", label: "Alerts", icon: Bell, badge: 3 },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "logs", label: "Activity Logs", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">InventoryPro</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange("alerts")}
              className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              <Bell className="h-4 w-4 mr-2 text-gray-700 dark:text-white" />
              <span className="text-gray-700 dark:text-white">Notifications</span>
              <Badge variant="destructive" className="ml-2">
                3
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full dark:hover:bg-gray-700">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="dark:bg-gray-600 dark:text-white">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 dark:bg-gray-800 dark:border-gray-700" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none dark:text-white">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground dark:text-gray-400">{user.email}</p>
                    <Badge variant="secondary" className="w-fit mt-1 dark:bg-gray-700 dark:text-white">
                      {user.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:border-gray-700" />
                <DropdownMenuItem
                  onClick={() => onThemeChange(!isDarkTheme)}
                  className="dark:hover:bg-gray-700 dark:text-white"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Dark Theme</span>
                    <Switch checked={isDarkTheme} onCheckedChange={onThemeChange} />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowEditProfile(true)}
                  className="dark:hover:bg-gray-700 dark:text-white"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem
                    onClick={() => setShowAddStaff(true)}
                    className="dark:hover:bg-gray-700 dark:text-white"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Add New Staff/Admin Account</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="dark:border-gray-700" />
                <DropdownMenuItem onClick={onLogout} className="dark:hover:bg-gray-700 dark:text-white">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 transition-colors">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <Badge variant="destructive" className="ml-1">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">{children}</main>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Edit Profile</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Update your profile information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right dark:text-white">
                Name
              </Label>
              <Input
                id="name"
                defaultValue={user.name}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right dark:text-white">
                Email
              </Label>
              <Input
                id="email"
                defaultValue={user.email}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEditProfile(false)} className="dark:bg-blue-600 dark:hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Staff/Admin Dialog */}
      {user.role === "admin" && (
        <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Add New Staff/Admin Account</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Create a new user account for the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newUserName" className="text-right dark:text-white">
                  Name
                </Label>
                <Input id="newUserName" className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newUserEmail" className="text-right dark:text-white">
                  Email
                </Label>
                <Input
                  id="newUserEmail"
                  type="email"
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newUserRole" className="text-right dark:text-white">
                  Role
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="staff" className="dark:text-white dark:hover:bg-gray-700">
                      Staff
                    </SelectItem>
                    <SelectItem value="admin" className="dark:text-white dark:hover:bg-gray-700">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newUserPassword" className="text-right dark:text-white">
                  Password
                </Label>
                <Input
                  id="newUserPassword"
                  type="password"
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowAddStaff(false)} className="dark:bg-blue-600 dark:hover:bg-blue-700">
                Create Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
