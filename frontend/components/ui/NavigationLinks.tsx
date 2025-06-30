"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

interface NavigationLinksProps {
  categories: Array<{ id: number; name: string }>
}

export default function NavigationLinks({ categories }: NavigationLinksProps) {
  const { isAuthenticated, isAdmin, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="flex flex-col md:flex-row gap-2 items-center mt-5 md:mt-0">
      {categories.map(category => (
        <Link
          key={category.id}
          href={`/${category.id}`}
          className="text-white hover:text-green-400 font-bold p-2"
        >{category.name}</Link>
      ))}
      
      {isAdmin && (
        <Link
          href={"/admin/sales"}
          className="rounded bg-green-400 font-bold py-2 px-10"
        >Panel de Administracion</Link>
      )}
      
      {isAuthenticated ? (
        <button
          onClick={handleLogout}
          className="rounded bg-red-600 hover:bg-red-700 font-bold py-2 px-10 text-white transition-colors duration-200"
        >
          Cerrar Sesión
        </button>
      ) : (
        <Link
          href={"/login"}
          className="rounded bg-blue-600 hover:bg-blue-700 font-bold py-2 px-10 text-white transition-colors duration-200"
        >Iniciar Sesión</Link>
      )}
    </nav>
  )
}
