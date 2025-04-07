import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import { AuthStatus } from "@/components/auth-status"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-xl font-bold">RetroSync</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/templates" className="text-sm font-medium hover:underline underline-offset-4">
              Templates
            </Link>
            <Link href="/features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </Link>
          </nav>
          <AuthStatus />
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-purple-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Retrospectives,
                    <br />
                    Made Simple
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Streamline your team's reflection process with guided retrospectives that drive continuous
                    improvement.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-500">No signup required. Start instantly.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-500">Multiple retrospective templates.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-500">Guided 4-step process: Reflect, Group, Vote, Discuss.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-500">Invite team members with a simple link or QR code.</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/create">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Create a Retrospective
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/templates">
                    <Button variant="outline">Explore Templates</Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto">
                <div className="rounded-xl border bg-white shadow-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-purple-600"></div>
                      <span className="text-sm font-medium">1. Reflect</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-purple-600"></div>
                      <span className="text-sm font-medium">2. Group</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-purple-600"></div>
                      <span className="text-sm font-medium">3. Vote</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-1 bg-purple-600 px-2 py-1 rounded-md">
                      <div className="h-3 w-3 rounded-full bg-white"></div>
                      <span className="text-sm font-medium text-white">4. Discuss</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 text-lg">😊</span>
                          <span className="font-medium text-green-700">Glad</span>
                        </div>
                      </div>
                      <div className="text-xs text-green-700 mb-2">Positive experiences</div>
                      <div className="border rounded bg-white p-2 mb-2 text-sm">Great teamwork on the API project</div>
                      <Button variant="outline" size="sm" className="w-full border-green-200 text-green-700">
                        + Add Item
                      </Button>
                    </div>
                    <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600 text-lg">😔</span>
                          <span className="font-medium text-blue-700">Sad</span>
                        </div>
                      </div>
                      <div className="text-xs text-blue-700 mb-2">Negative experiences</div>
                      <div className="border rounded bg-white p-2 mb-2 text-sm">Too many meetings this sprint</div>
                      <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-700">
                        + Add Item
                      </Button>
                    </div>
                    <div className="border rounded-lg p-3 bg-red-50 border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-red-600 text-lg">😠</span>
                          <span className="font-medium text-red-700">Mad</span>
                        </div>
                      </div>
                      <div className="text-xs text-red-700 mb-2">Frustrations and challenges</div>
                      <div className="border rounded bg-white p-2 mb-2 text-sm">Deployment issues on Friday</div>
                      <Button variant="outline" size="sm" className="w-full border-red-200 text-red-700">
                        + Add Item
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-700">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need for Effective Retrospectives
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides all the tools you need to run productive retrospective meetings with your team.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <line x1="10" x2="8" y1="9" y2="9" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Multiple Templates</h3>
                  <p className="text-sm text-gray-500">
                    Choose from Start/Stop/Continue, Glad/Sad/Mad, and more templates, or create your own custom format.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Guided Process</h3>
                  <p className="text-sm text-gray-500">
                    Follow our structured 4-step process: Reflect, Group, Vote, and Discuss to get the most out of your
                    retrospectives.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="m18 16 4-4-4-4" />
                    <path d="m6 8-4 4 4 4" />
                    <path d="m14.5 4-5 16" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Drag & Drop</h3>
                  <p className="text-sm text-gray-500">
                    Easily organize and group similar items with our intuitive drag and drop interface.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M17 6.1H3" />
                    <path d="M21 12.1H3" />
                    <path d="M15.1 18H3" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Voting System</h3>
                  <p className="text-sm text-gray-500">
                    Prioritize discussion topics with our built-in voting system to focus on what matters most.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Easy Sharing</h3>
                  <p className="text-sm text-gray-500">
                    Invite team members with a simple link or QR code to join your retrospective session.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Real-time Collaboration</h3>
                  <p className="text-sm text-gray-500">
                    Work together in real-time with your team members, seeing updates instantly as they happen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gray-50">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex flex-col gap-2 md:gap-4 lg:gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-lg font-bold">RetroSync</span>
            </div>
            <div className="text-gray-500 md:text-sm">© 2025 RetroSync. All rights reserved.</div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Guides
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

