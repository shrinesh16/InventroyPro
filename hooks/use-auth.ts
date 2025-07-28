"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "staff"
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("inventory-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (email: string, password: string) => {
    // Mock authentication
    let userData: User | null = null

    if (email === "admin@company.com" && password === "admin123") {
      userData = {
        id: "1",
        name: "Admin User",
        email: "admin@company.com",
        role: "admin",
      }
    } else if (email === "staff@company.com" && password === "staff123") {
      userData = {
        id: "2",
        name: "Staff User",
        email: "staff@company.com",
        role: "staff",
      }
    }

    if (userData) {
      setUser(userData)
      localStorage.setItem("inventory-user", JSON.stringify(userData))
    } else {
      alert("Invalid credentials")
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("inventory-user")
  }

  return { user, login, logout }
}
