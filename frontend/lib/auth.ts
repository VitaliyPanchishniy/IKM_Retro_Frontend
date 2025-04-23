import axios from "axios"

// Function to refresh the access token using the refresh token
export async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken")

    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await axios.post("http://localhost:5014/account/refresh-token", {
      refreshToken,
    })

    const { accessToken, refreshToken: newRefreshToken } = response.data

    // Update tokens in localStorage
    localStorage.setItem("accessToken", accessToken)

    // If a new refresh token is provided, update it as well
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken)
    }

    return accessToken
  } catch (error) {
    console.error("Failed to refresh access token:", error)

    // If refresh fails, log the user out
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.setItem("user", JSON.stringify({ isLoggedIn: false }))

    // Redirect to login page
    window.location.href = "/login"

    throw error
  }
}

// Create an axios instance with interceptors to handle token refresh
export const authAxios = axios.create({
  baseURL: "http://localhost:5014",
})

// Add request interceptor
authAxios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Add response interceptor
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const newAccessToken = await refreshAccessToken()

        // Update the Authorization header with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        // Retry the original request
        return authAxios(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Function to check if user is authenticated
export function isAuthenticated() {
  const accessToken = localStorage.getItem("accessToken")
  const user = localStorage.getItem("user")

  if (!accessToken || !user) {
    return false
  }

  try {
    const userData = JSON.parse(user)
    return userData.isLoggedIn === true
  } catch (error) {
    return false
  }
}

// Function to get current user data
export function getCurrentUser() {
  const user = localStorage.getItem("user")

  if (!user) {
    return null
  }

  try {
    return JSON.parse(user)
  } catch (error) {
    return null
  }
}
