"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isRegister) {
        // Sign up
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authError) {
          setError(authError.message);
        } else {
          // Try to sign in immediately (works if email confirmation is disabled)
          const { error: signInError } =
            await supabase.auth.signInWithPassword({ email, password });

          if (signInError) {
            setMessage(
              "Konto opprettet! Sjekk e-posten din for å bekrefte, eller logg inn direkte."
            );
          } else {
            window.location.href = "/";
          }
        }
      } else {
        // Sign in
        const { error: authError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
          setError(authError.message);
        } else {
          window.location.href = "/";
        }
      }
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            LP
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Livsplanlegg</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ditt personlige styringssystem
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">
                {isRegister ? "Opprett konto" : "Logg inn"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="din@epost.no"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minst 6 tegn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {message && (
                <p className="text-sm text-green-600">{message}</p>
              )}
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password}
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isRegister ? "Opprett konto" : "Logg inn"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {isRegister ? "Har du allerede konto?" : "Har du ikke konto?"}{" "}
                <button
                  type="button"
                  className="text-primary underline hover:no-underline"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                    setMessage(null);
                  }}
                >
                  {isRegister ? "Logg inn" : "Registrer deg"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
