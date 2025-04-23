"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Save, Bell, Lock, Link2, User } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import axios from "axios"

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeSection, setActiveSection] = useState("profile")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  // Проверка авторизации
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login?redirect=/settings")
      return
    }

    try {
      const userData = JSON.parse(storedUser)
      if (!userData.isLoggedIn) {
        router.push("/login?redirect=/settings")
        return
      }
      setUser(userData)
      setFormData({
        ...formData,
        name: userData.name || "",
        email: userData.email || "",
        role: "Team Facilitator",
      })
    } catch (e) {
      console.error("Error parsing user data:", e)
      router.push("/login?redirect=/settings")
      return
    }

    setIsLoading(false)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage("")
    }
  }

  const validateProfileForm = () => {
    let isValid = true
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is not valid"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const validatePasswordForm = () => {
    let isValid = true
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required"
      isValid = false
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required"
      isValid = false
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters"
      isValid = false
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required"
      isValid = false
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateProfileForm()) {
      return
    }

    setIsSaving(true)

    try {
      // Get access token
      const accessToken = localStorage.getItem("accessToken")

      // Try to update profile via API
      try {
        const response = await axios.put(
          "http://localhost:5014/account/update-profile",
          {
            name: formData.name,
            email: formData.email,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )

        console.log("Profile update success", response.data)
      } catch (apiError) {
        console.error("API profile update error:", apiError)
        // Continue with local update for demo purposes
      }

      // Update user in localStorage
      if (user) {
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
        }

        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
        setSuccessMessage("Profile updated successfully")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setErrors({ form: "An error occurred while updating your profile. Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) {
      return
    }

    setIsSaving(true)

    try {
      // Get access token
      const accessToken = localStorage.getItem("accessToken")

      // Try to change password via API
      try {
        const response = await axios.put(
          "http://localhost:5014/account/change-password",
          {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )

        console.log("Password change success", response.data)
      } catch (apiError) {
        console.error("API password change error:", apiError)
        // Continue with local update for demo purposes
      }

      // In a real app, we would verify the current password
      // For this demo, we'll just update the password
      setSuccessMessage("Password changed successfully")

      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      setErrors({ form: "An error occurred while changing your password. Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Remove user data from localStorage
        localStorage.removeItem("user")

        // Redirect to home page
        router.push("/")
      } catch (error) {
        console.error("Error deleting account:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading...</h2>
          <p className="text-gray-500">Please wait while we load your profile settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-1">
                <span className="text-xl font-bold text-indigo-700">
                  Retro<span className="text-purple-600">IKM</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="rounded-full">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full ml-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-64 mb-6 sm:mb-0">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`w-full text-left ${
                    activeSection === "profile"
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                >
                  <User
                    className={`mr-3 h-5 w-5 ${
                      activeSection === "profile" ? "text-purple-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  Profile
                </button>
                <button
                  onClick={() => setActiveSection("notifications")}
                  className={`w-full text-left ${
                    activeSection === "notifications"
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                >
                  <Bell
                    className={`mr-3 h-5 w-5 ${
                      activeSection === "notifications" ? "text-purple-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveSection("security")}
                  className={`w-full text-left ${
                    activeSection === "security"
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                >
                  <Lock
                    className={`mr-3 h-5 w-5 ${
                      activeSection === "security" ? "text-purple-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  Security
                </button>
                <button
                  onClick={() => setActiveSection("integrations")}
                  className={`w-full text-left ${
                    activeSection === "integrations"
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                >
                  <Link2
                    className={`mr-3 h-5 w-5 ${
                      activeSection === "integrations" ? "text-purple-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  Integrations
                </button>
              </nav>
            </div>

            <div className="flex-1 sm:ml-8">
              {activeSection === "profile" && (
                <>
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h2 className="text-lg font-medium text-gray-900">Profile</h2>

                      <form onSubmit={handleSaveProfile} className="mt-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <Avatar className="h-24 w-24">
                                <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
                                  {user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute bottom-0 right-0">
                                <Button
                                  type="button"
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="role">Role</Label>
                              <Input id="role" name="role" value={formData.role} onChange={handleChange} disabled />
                            </div>

                            {successMessage && (
                              <div className="bg-green-50 p-3 rounded-md text-green-600 text-sm">{successMessage}</div>
                            )}

                            {errors.form && (
                              <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{errors.form}</div>
                            )}

                            <div className="flex justify-end">
                              <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSaving}>
                                {isSaving ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="mt-6 bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h2 className="text-lg font-medium text-gray-900">Your Teams</h2>

                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-purple-100 rounded-md flex items-center justify-center text-purple-700 mr-3">
                              P
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Product Team</h3>
                              <p className="text-xs text-gray-500">5 members</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-purple-600">Facilitator</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-700 mr-3">
                              D
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Design Team</h3>
                              <p className="text-xs text-gray-500">12 members</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-600">Member</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeSection === "notifications" && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>

                    <div className="mt-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-500">Receive email notifications about your retrospectives</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">New Participant Alerts</h3>
                          <p className="text-sm text-gray-500">Get notified when someone joins your retrospective</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Comment Notifications</h3>
                          <p className="text-sm text-gray-500">
                            Receive notifications when someone comments on your items
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Weekly Digest</h3>
                          <p className="text-sm text-gray-500">Receive a weekly summary of your team's activity</p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Marketing Updates</h3>
                          <p className="text-sm text-gray-500">Receive updates about new features and improvements</p>
                        </div>
                        <Switch />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button className="bg-purple-600 hover:bg-purple-700">Save Preferences</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "security" && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                      <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input
                            id="current-password"
                            name="currentPassword"
                            type="password"
                            value={formData.currentPassword}
                            onChange={handleChange}
                          />
                          {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleChange}
                          />
                          {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                          />
                          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                        </div>

                        {successMessage && (
                          <div className="bg-green-50 p-3 rounded-md text-green-600 text-sm">{successMessage}</div>
                        )}

                        {errors.form && (
                          <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{errors.form}</div>
                        )}

                        <Button
                          type="button"
                          onClick={handleChangePassword}
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Update Password
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Status: <span className="text-red-600">Disabled</span>
                          </p>
                        </div>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-sm font-medium text-gray-900">Login Sessions</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        These are the devices that have logged into your account.
                      </p>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="text-sm font-medium">Chrome on Windows</p>
                            <p className="text-xs text-gray-500">Last active: Today at 10:43 AM</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Sign Out
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="text-sm font-medium">Safari on iPhone</p>
                            <p className="text-xs text-gray-500">Last active: Yesterday at 6:20 PM</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-sm font-medium text-red-600">Danger Zone</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={handleDeleteAccount}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "integrations" && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900">Connected Apps</h2>

                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center text-white mr-3">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M22.05 11.25h-8.3V2.95c0-.5-.4-.9-.9-.9s-.9.4-.9.9v8.3H3.65c-.5 0-.9.4-.9.9s.4.9.9.9h8.3v8.3c0 .5.4.9.9.9s.9-.4.9-.9v-8.3h8.3c.5 0 .9-.4.9-.9s-.4-.9-.9-.9z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Slack</h3>
                            <p className="text-xs text-gray-500">Connected</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-50 rounded-md flex items-center justify-center mr-3">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Google Workspace</h3>
                            <p className="text-xs text-gray-500">Connected</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-purple-100 rounded-md flex items-center justify-center text-purple-700 mr-3">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.4 0 0 5.4 0 12c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.6 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.4 18.6 0 12 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">GitHub</h3>
                            <p className="text-xs text-gray-500">Not connected</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-700 mr-3">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.3 0H4.7C2.1 0 0 2.1 0 4.7v14.6C0 21.9 2.1 24 4.7 24h14.6c2.6 0 4.7-2.1 4.7-4.7V4.7C24 2.1 21.9 0 19.3 0zM8 19H5V8h3v11zM6.5 6.7c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8zM20 19h-3v-5.6c0-3.4-4-3.1-4 0V19h-3V8h3v1.8c1.4-2.6 7-2.8 7 2.5V19z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">LinkedIn</h3>
                            <p className="text-xs text-gray-500">Not connected</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">© 2023 RetroIKM. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/help" className="text-sm text-gray-500 hover:text-gray-900">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
