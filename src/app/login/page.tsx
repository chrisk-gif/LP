"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual Supabase auth
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setMagicLinkSent(true);
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
          <Tabs defaultValue="password">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Logg inn</CardTitle>
              <CardDescription>
                Velg hvordan du vil logge inn
              </CardDescription>
              <TabsList className="mt-2 grid w-full grid-cols-2">
                <TabsTrigger value="password">Passord</TabsTrigger>
                <TabsTrigger value="magic-link">Magisk lenke</TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* Password login */}
            <TabsContent value="password">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-post</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-email"
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
                    <Label htmlFor="login-password">Passord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Ditt passord"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
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
                    Logg inn
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs text-muted-foreground"
                  >
                    Glemt passord?
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* Magic link login */}
            <TabsContent value="magic-link">
              {magicLinkSent ? (
                <CardContent className="py-8 text-center">
                  <Mail className="mx-auto mb-4 h-10 w-10 text-primary" />
                  <p className="font-medium">Sjekk e-posten din!</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Vi har sendt en innloggingslenke til{" "}
                    <span className="font-medium text-foreground">
                      {email}
                    </span>
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-4"
                    onClick={() => setMagicLinkSent(false)}
                  >
                    Send på nytt
                  </Button>
                </CardContent>
              ) : (
                <form onSubmit={handleMagicLink}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="magic-email">E-post</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="magic-email"
                          type="email"
                          placeholder="din@epost.no"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vi sender deg en lenke du kan bruke til å logge inn uten
                      passord.
                    </p>

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading || !email}
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Send innloggingslenke
                    </Button>
                  </CardFooter>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          Har du ikke konto?{" "}
          <Button variant="link" className="h-auto p-0 text-xs">
            Registrer deg
          </Button>
        </p>
      </div>
    </div>
  );
}
