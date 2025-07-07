"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthErrorCodes,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/app/firebase"; // Adjust the import path as necessary
import {
  GraduationCap,
  Users,
  BookOpen,
  Heart,
  CheckCircle2,
  ArrowRight,
  Github,
  HeadphonesIcon,
  Zap,
  UserCheck,
  CreditCard,
  Code,
  Coffee,
} from "lucide-react";

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const router = useRouter();

  const getFirebaseErrorMessage = (code: any) => {
    switch (code) {
      case AuthErrorCodes.EMAIL_EXISTS:
        return "The email address is already in use by another account.";
      case AuthErrorCodes.INVALID_EMAIL:
        return "The email address is not valid.";
      case AuthErrorCodes.WEAK_PASSWORD:
        return "The password is too weak. Please enter a stronger password.";
      case AuthErrorCodes.USER_DELETED:
        return "No account found with this email address.";
      case AuthErrorCodes.INVALID_PASSWORD:
        return "Incorrect password. Please try again.";
      case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
        return "Too many failed login attempts. Please try again later.";
      case AuthErrorCodes.USER_DISABLED:
        return "This account has been disabled.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/invalid-credential":
        return "The provided credentials are invalid. Please check your email and password.";
      default:
        return "An unknown error occurred. Please try again.";
    }
  };

  const reset = () => {
    setLoginData({ email: "", password: "" });
    setSignupData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const { email, password } = loginData;
      await signInWithEmailAndPassword(auth, email, password);
      reset();
      router.push("/chat");
    } catch (err: any) {
      console.log(err);
      if (err?.code) {
        const errorMessage = getFirebaseErrorMessage(err.code);
        console.log(errorMessage);
        setError(errorMessage);
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const { email, password, name } = signupData;
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          mail: email,
          name: name,
          createdAt: new Date(),
          uid: user.uid,
        });
      }

      reset();
      router.push("/chat");
    } catch (err: any) {
      console.log(err);
      if (err?.code) {
        const errorMessage = getFirebaseErrorMessage(err.code);
        console.log(errorMessage);
        setError(errorMessage);
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Remove the Head component */}
      {/* <Head>
        <title>UniSupport AI</title>
        <meta name="description" content="This is the login page" />
      </Head> */}
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-2.5 rounded-xl shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  UniSupport AI
                </h1>
                <p className="text-sm text-slate-600">
                  Community-Driven Academic Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Made by Students</span>
              </div>
              <a href="https://github.com/Bumblebig/UniSupport" target="_blank">
                <div className="flex items-center gap-2 cursor-pointer">
                  <Github className="h-4 w-4" />
                  <span>Open Source</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Information */}
          <div className="space-y-8">
            <div className="space-y-4">
              {/* <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <Code className="h-4 w-4" />
                Final Year Project
              </div> */}
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                AI Support Assistant
                <span className="block text-indigo-600">
                  for Fellow Students
                </span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                A community-driven platform created by a Unilorin student, for
                Unilorin students. Get instant help with academic IT issues,
                portal problems, and technical questions - no official
                affiliation, just peer support.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Portal Issues
                </h3>
                <p className="text-sm text-slate-600">
                  Login problems, password resets, access difficulties
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Academic Help
                </h3>
                <p className="text-sm text-slate-600">
                  Course registration, academic systems guidance
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Payment Support
                </h3>
                <p className="text-sm text-slate-600">
                  School fees, payment issues, receipt problems
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <HeadphonesIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  24/7 Available
                </h3>
                <p className="text-sm text-slate-600">
                  Always here when you need help
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200/60">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Coffee className="h-5 w-5 text-indigo-600" />
                About This Project
              </h3>
              <div className="space-y-2 text-sm text-slate-700">
                <p>• Created as a final year project to help fellow students</p>
                <p>• Not affiliated with the University of Ilorin or COMSIT</p>
                <p>• Open-source community tool for peer-to-peer support</p>
                <p>
                  • Designed to complement (not replace) official support
                  channels
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Free to Use</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Student Made</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Community Driven</span>
              </div>
            </div>
          </div>

          {/* Right side - Login/Signup form */}
          <div className="lg:pl-8">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-2xl shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Join the Community
                </CardTitle>
                <CardDescription className="text-slate-600 text-base">
                  Sign in or create an account to access the AI support
                  assistant
                </CardDescription>
              </CardHeader>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mx-6 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-slate-700 font-medium"
                        >
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={loginData.email}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              email: e.target.value,
                            })
                          }
                          placeholder="Enter your email"
                          className="h-12 bg-white/90 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-slate-700 font-medium"
                        >
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Enter your password"
                          className="h-12 bg-white/90 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                          required
                        />
                      </div>

                      {error && (
                        <Alert
                          variant="destructive"
                          className="bg-red-50 border-red-200 text-red-800"
                        >
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* <Separator />

                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-900">
                            Demo Account (For Testing)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div>
                            <span className="text-slate-600">Email:</span>
                            <div className="font-mono bg-white px-2 py-1 rounded border mt-1">
                              demo@student.com
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-600">Password:</span>
                            <div className="font-mono bg-white px-2 py-1 rounded border mt-1">
                              demo123
                            </div>
                          </div>
                        </div>
                      </div> */}
                    </CardContent>

                    <CardFooter className="pt-2">
                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold shadow-lg transition-all duration-200"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing In...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Sign In
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup}>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-slate-700 font-medium"
                        >
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={signupData.name}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter your full name"
                          className="h-12 bg-white/90 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-email"
                          className="text-slate-700 font-medium"
                        >
                          Email Address
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={signupData.email}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              email: e.target.value,
                            })
                          }
                          placeholder="Enter your email"
                          className="h-12 bg-white/90 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-password"
                          className="text-slate-700 font-medium"
                        >
                          Password
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={signupData.password}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Create a password"
                          className="h-12 bg-white/90 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="confirm-password"
                          className="text-slate-700 font-medium"
                        >
                          Confirm Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={signupData.confirmPassword}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Confirm your password"
                          className="h-12 bg-white/90 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                          required
                        />
                      </div>

                      {error && (
                        <Alert
                          variant="destructive"
                          className="bg-red-50 border-red-200 text-red-800"
                        >
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800">
                        <p className="font-medium mb-1">
                          Community Guidelines:
                        </p>
                        <p>
                          By creating an account, you agree to use this platform
                          respectfully and understand it's a student project,
                          not an official service.
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2">
                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold shadow-lg transition-all duration-200"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating Account...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Create Account
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>

            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-slate-600">
                Questions about this project?
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                  <a href="https://github.com/Bumblebig/UniSupport">
                    View on GitHub
                  </a>
                </button>
                <span className="text-slate-400">•</span>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                  <a href="mailto:bumblebig16@gmail.com">Contact Developer</a>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/70 backdrop-blur-sm border-t border-slate-200/60 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-6">
              <span>{new Date().getFullYear()} UniSupport AI</span>
              <span>•</span>
              <button className="hover:text-slate-900">Open Source</button>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 border-green-200"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Community Project
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
