import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useNavigate } from "react-router-dom"
import { fetchWithAuth } from "@/lib/apiClient"
import { PageLayout } from "@/components/layout/PageLayout"

export default function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            return
        }
        console.log("Login successful, syncing user data...")
        await fetchWithAuth("http://localhost:3000/api/users/sync", {
            method: "POST",
        })
        navigate("/")
    }

    return (
        <PageLayout title="Login">
            <div className="space-y-4 max-w-md">
                <input
                    className="w-full border p-2"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="w-full border p-2"
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="w-full bg-primary text-white p-2 rounded"
                    onClick={handleLogin}
                >
                    Login
                </button>

                {error && <p className="text-red-500">{error}</p>}
            </div>
        </PageLayout>
    )
}
