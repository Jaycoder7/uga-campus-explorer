import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { PageLayout } from "@/components/layout/PageLayout"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
          const checkUser = async () => {
              const {
                  data: { session },
              } = await supabase.auth.getSession()
  
              if (session) {
                  // User is logged in, redirect to home
                  navigate("/")
              }
          }
  
          checkUser()
      }, [navigate])

 const handleSignup = async () => {
  setError(null)
  setMessage(null)
  

  if (password !== confirmPassword) {
    setError("Passwords do not match")
    return
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, username: email.split("@")[0] })
});


    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Signup failed")
    } else {
      setMessage("Check your email to verify your account!")
    }
  } catch (err: any) {
    setError(err.message || "Something went wrong")
  }
}


  return (
    <PageLayout title="Create Account">
      <div className="mx-auto mt-12 max-w-md space-y-4">

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          className="w-full bg-primary text-white p-2 rounded"
          onClick={handleSignup}
        >
          Sign Up
        </button>

        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}

      </div>
    </PageLayout>
  )
}
