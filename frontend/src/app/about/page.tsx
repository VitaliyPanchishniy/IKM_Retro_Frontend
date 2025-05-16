"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import Header from "@/components/Header"

export default function AboutPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setIsLoggedIn(userData.isLoggedIn || false)
          setUserName(userData.name || "")
        } catch (e) {
          console.error("Error parsing user data:", e)
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    window.addEventListener("storage", checkAuth)
    window.addEventListener("auth-change", checkAuth)

    return () => {
      window.removeEventListener("storage", checkAuth)
      window.removeEventListener("auth-change", checkAuth)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-16 md:py-24 bg-gradient-to-b from-purple-50 to-white"
        >
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">About RetroIKM</h1>
              <p className="text-xl text-gray-600 mb-8">
                We're on a mission to make team retrospectives more effective, engaging, and actionable.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="py-16"
        >
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 mb-6">
                RetroIKM was born out of frustration with existing retrospective tools that were either too complex or
                too simplistic. We wanted to create a platform that strikes the perfect balance - powerful enough for
                experienced teams, yet intuitive for newcomers to agile methodologies.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Founded in 2022 by a team of agile enthusiasts, RetroIKM has quickly grown to become a trusted tool for
                teams of all sizes, from startups to enterprise organizations. Our focus has always been on creating a
                tool that not only facilitates retrospectives but actually makes them enjoyable and productive.
              </p>
              <p className="text-lg text-gray-700">
                Today, RetroIKM is used by thousands of teams worldwide to improve their processes, foster open
                communication, and drive continuous improvement. We're proud to be part of the agile community and
                remain committed to evolving our platform based on user feedback and emerging best practices.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="py-16 bg-gray-50"
        >
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">The Problems We Solve</h2>

              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">Ineffective Retrospectives</h3>
                  <p className="text-gray-700">
                    Many teams struggle with retrospectives that don't lead to actionable insights or meaningful change.
                    RetroIKM provides structured templates and facilitation tools that help teams focus on what matters
                    and turn insights into action items.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">Limited Participation</h3>
                  <p className="text-gray-700">
                    Traditional retrospectives often suffer from uneven participation, with some team members dominating
                    the conversation while others remain silent. Our platform encourages equal contribution through
                    features like anonymous input and timed sessions.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">Lack of Follow-Through</h3>
                  <p className="text-gray-700">
                    Without proper tracking, action items from retrospectives often get lost or forgotten. RetroIKM
                    integrates with your existing tools to ensure that insights lead to trackable tasks that can be
                    monitored and completed.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">Remote Team Challenges</h3>
                  <p className="text-gray-700">
                    Distributed teams face unique challenges in conducting effective retrospectives. Our platform is
                    designed with remote-first features that make virtual retrospectives just as engaging and productive
                    as in-person sessions.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="py-16"
        >
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-lg text-gray-600">
                The passionate people behind RetroIKM who are dedicated to improving team collaboration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Sarah Chen" />
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-xl">SC</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">Sarah Chen</h3>
                <p className="text-purple-600 mb-2">Co-Founder & CEO</p>
                <p className="text-sm text-gray-600">
                  Former Agile Coach with 10+ years of experience helping teams improve their processes.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="flex flex-col items-center text-center"
              >
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Michael Rodriguez" />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">MR</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">Michael Rodriguez</h3>
                <p className="text-purple-600 mb-2">Co-Founder & CTO</p>
                <p className="text-sm text-gray-600">
                  Full-stack developer with a passion for creating tools that enhance team collaboration.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="flex flex-col items-center text-center"
              >
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Aisha Patel" />
                  <AvatarFallback className="bg-green-100 text-green-700 text-xl">AP</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">Aisha Patel</h3>
                <p className="text-purple-600 mb-2">Head of Product</p>
                <p className="text-sm text-gray-600">
                  Product leader focused on creating intuitive and delightful user experiences.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="py-16 bg-purple-100"
        >
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">Continuous Improvement</h3>
                  <p className="text-gray-700">
                    We practice what we preach by constantly seeking feedback and improving our platform.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">Transparency</h3>
                  <p className="text-gray-700">
                    We believe in open communication with our users about our roadmap and decision-making.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">User-Centered Design</h3>
                  <p className="text-gray-700">
                    Every feature we build starts with understanding the real needs of our users.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">Simplicity</h3>
                  <p className="text-gray-700">
                    We strive to make complex processes simple and accessible to everyone.
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.0 }}
                className="mt-12"
              >
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signup">
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                      Join Us Today
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="border-t py-12 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">RetroIKM</h3>
              <p className="text-sm text-gray-600">Making retrospectives better for teams everywhere.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/features" className="text-gray-600 hover:text-gray-900">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-gray-900">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            <p>© 2023 RetroIKM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
