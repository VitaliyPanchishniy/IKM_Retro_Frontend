"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

interface AuthFormsProps {
  initialTab?: "signin" | "signup"
}

export function AuthForms({ initialTab = "signin" }: AuthFormsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<"left" | "right">("right")
  const [isLoading, setIsLoading] = useState(false)

  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  })

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Sync URL with active tab
  useEffect(() => {
    if (pathname === "/login" && activeTab !== "signin") {
      setActiveTab("signin")
    } else if (pathname === "/signup" && activeTab !== "signup") {
      setActiveTab("signup")
    }
  }, [pathname, activeTab])

  const handleTabChange = (tab: "signin" | "signup") => {
    if (tab === activeTab || isAnimating) return

    setIsAnimating(true)
    setDirection(tab === "signin" ? "left" : "right")

    // Start animation
    setTimeout(() => {
      setActiveTab(tab)

      // Update URL without full page reload
      const newPath = tab === "signin" ? "/login" : "/signup"
      router.push(newPath, { scroll: false })

      // End animation
      setTimeout(() => {
        setIsAnimating(false)
      }, 300)
    }, 300)
  }

  const handleSigninChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSigninData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignupData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateSigninForm = () => {
    const newErrors: Record<string, string> = {}

    if (!signinData.email.trim()) {
      newErrors.email = "Email is required"
    }

    if (!signinData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSignupForm = () => {
    const newErrors: Record<string, string> = {}

    if (!signupData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!signupData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!signupData.password) {
      newErrors.password = "Password is required"
    } else if (signupData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateSigninForm()) {
      return
    }

    setIsLoading(true)

    try {
      // In a real app, this would be an API call to authenticate the user
      // For demo purposes, we'll simulate a delay and redirect
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if we have a user with this email in localStorage
      const storedUserData = localStorage.getItem("user")

      if (storedUserData) {
        const userData = JSON.parse(storedUserData)

        if (userData.email === signinData.email) {
          // Update login status
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...userData,
              isLoggedIn: true,
            }),
          )

          // Redirect to dashboard after successful login
          router.push("/dashboard")
          return
        }
      }

      // If we get here, login failed
      setErrors({ form: "Invalid email or password" })
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ form: "An error occurred during login. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateSignupForm()) {
      return
    }

    setIsLoading(true)

    try {
      // In a real app, this would be an API call to register the user
      // For demo purposes, we'll simulate a delay and redirect
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Store user data in localStorage (in a real app, this would be handled by a proper auth system)
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          isLoggedIn: true,
        }),
      )

      // Redirect to dashboard after successful signup
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup error:", error)
      setErrors({ form: "An error occurred during signup. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="md:w-1/2 p-8">
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-0 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange("signin")}
            className={`py-2 text-center font-medium transition-all duration-300 ${
              activeTab === "signin" ? "bg-white rounded-md shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabChange("signup")}
            className={`py-2 text-center font-medium transition-all duration-300 ${
              activeTab === "signup" ? "bg-white rounded-md shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="relative overflow-hidden">
          {/* Sign In Form */}
          <div
            className={`transition-all duration-300 ${
              activeTab === "signin"
                ? "translate-x-0 opacity-100"
                : direction === "left"
                  ? "translate-x-full opacity-0 absolute inset-0"
                  : "-translate-x-full opacity-0 absolute inset-0"
            }`}
          >
            <h2 className="text-2xl font-bold mb-1">Welcome back!</h2>
            <p className="text-gray-600">Sign in to access your workspace</p>

            <div className="mt-6 mb-6">
              <Button variant="outline" className="w-full justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                Continue with Google
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <form onSubmit={handleSignin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={signinData.email}
                    onChange={handleSigninChange}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-purple-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={signinData.password}
                    onChange={handleSigninChange}
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>

                {errors.form && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{errors.form}</div>}

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <p>
                Don't have an account?{" "}
                <button onClick={() => handleTabChange("signup")} className="text-purple-600 hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          </div>

          {/* Sign Up Form */}
          <div
            className={`transition-all duration-300 ${
              activeTab === "signup"
                ? "translate-x-0 opacity-100"
                : direction === "right"
                  ? "translate-x-full opacity-0 absolute inset-0"
                  : "-translate-x-full opacity-0 absolute inset-0"
            }`}
          >
            <h2 className="text-2xl font-bold mb-1">Create an account</h2>
            <p className="text-gray-600">Sign up to get started with RetroKM</p>

            <div className="mt-6 mb-6">
              <Button variant="outline" className="w-full justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                Continue with Google
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={signupData.name}
                    onChange={handleSignupChange}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={signupData.email}
                    onChange={handleSignupChange}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-purple-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-purple-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {errors.form && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{errors.form}</div>}

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <p>
                Already have an account?{" "}
                <button onClick={() => handleTabChange("signin")} className="text-purple-600 hover:underline">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
