import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"

export default function UserButton() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Check session on mount
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)
      setLoading(false)

      // Listen to auth changes (login/logout)
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate("/login")
  }

  if (loading) return null

  return (
    <div className="fixed top-4 right-4">
      {user ? (
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={handleLogout}
        >
          Logout
        </button>
      ) : (
        <button
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      )}
    </div>
  )
}
