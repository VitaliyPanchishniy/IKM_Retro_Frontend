"use client"

import axios from "axios"
import API from "./api"

// Типы для аутентификации
interface User {
  id?: string
  userName?: string
  email: string
  isLoggedIn: boolean
}

interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// API для работы с аутентификацией
export const authApi = {
  // Вход в систему
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post("http://localhost:5014/api/account/login", {
        email,
        password,
      })

      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  // Регистрация
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post("http://localhost:5014/api/account/register", {
        userName: name,
        email,
        password,
      })

      return response.data
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },

  // Выход из системы
  async logout(): Promise<void> {
    try {
      await API.post("/api/account/logout")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  },

  // Обновление профиля
  async updateProfile(name: string, email: string): Promise<void> {
    try {
      await API.put("/api/account/update-profile", {
        userName: name,
        email,
      })
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  },

  // Смена пароля
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await API.put("/api/account/change-password", {
        currentPassword,
        newPassword,
      })
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    }
  },

  // Получение данных текущего пользователя
  async getCurrentUser(): Promise<User> {
    try {
      const response = await API.get("/api/account/self")
      return response.data
    } catch (error) {
      console.error("Get current user error:", error)
      throw error
    }
  },
}

// Сервис для работы с аутентификацией
export const authService = {
  // Проверка авторизации
  isAuthenticated(): boolean {
    const accessToken = localStorage.getItem("accessToken")
    const user = localStorage.getItem("user")

    if (!accessToken || !user) {
      return false
    }

    try {
      const userData = JSON.parse(user)
      return userData.isLoggedIn === true
    } catch (e) {
      console.error("Error parsing user data:", e)
      return false
    }
  },

  // Получение текущего пользователя
  getCurrentUser(): User | null {
    const user = localStorage.getItem("user")

    if (!user) {
      return null
    }

    try {
      return JSON.parse(user)
    } catch (e) {
      console.error("Error parsing user data:", e)
      return null
    }
  },

  // Сохранение данных пользователя
  saveUserData(userData: User, accessToken: string, refreshToken: string): void {
    localStorage.setItem("user", JSON.stringify({ ...userData, isLoggedIn: true }))
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
  },

  // Выход из системы
  async logout(): Promise<void> {
    await authApi.logout()
  },
}

export const authAxios = API
