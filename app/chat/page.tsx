"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  getDocs,
  where,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  GraduationCap,
  User,
  Bot,
  LogOut,
  Send,
  Settings,
  HelpCircle,
  Clock,
  MessageSquare,
  Zap,
  FileText,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  BookOpen,
  CreditCard,
  Shield,
  Minimize2,
  Maximize2,
  Globe,
  Heart,
  Code,
  Github,
} from "lucide-react";
import { set } from "date-fns";

interface Message {
  id: string | number;
  role: string;
  content: string;
  timestamp?: any;
  uid: string;
}

export default function ChatPage() {
  // Custom state to replace useChat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [userID, setUserID] = useState<string>("");
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Custom input change handler
  const handleInputChange = (e: any) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (isAuthenticated && userID) {
        try {
          const q = query(
            collection(db, "Messages"),
            where("uid", "==", userID),
            orderBy("timestamp")
          );

          const snapshot = await getDocs(q);

          const msg: Message[] = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            role: doc.data().role,
            content: doc.data().content,
            timestamp: doc.data().timestamp,
            uid: doc.data().uid,
          }));

          setMessages(msg);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
  }, [isAuthenticated, userID]);

  // Custom submit handler
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found");
      return;
    }

    const currentUserID = user.uid;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      uid: currentUserID,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("https://comsis.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          user_id: currentUserID,
        }),
      });

      const text = await res.text();
      let response;
      try {
        response = JSON.parse(text);
      } catch (error) {
        console.error("JSON Parse Error:", error);
        throw new Error("Invalid JSON response");
      }

      const botResponse = response?.output;

      if (!botResponse) {
        console.error("No response from AI");
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
          uid: currentUserID,
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botResponse,
        timestamp: new Date(),
        uid: currentUserID,
      };
      setIsLoading(false);
      setMessages((prev) => [...prev, aiMessage]);

      await addDoc(collection(db, "Messages"), {
        role: "user",
        content: currentInput,
        timestamp: serverTimestamp(),
        uid: currentUserID,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      await addDoc(collection(db, "Messages"), {
        role: "assistant",
        content: botResponse,
        timestamp: serverTimestamp(),
        uid: currentUserID,
      });
    } catch (error) {
      console.error("Error:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
        uid: auth.currentUser?.uid || "",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const getUserID = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserID(user.uid);
      }
    };
    getUserID();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        setIsAuthenticated(true);
        setUserID(user.uid); // Set userID here too
      } else {
        setIsAuthenticated(false);
        setUserID(""); // Clear userID
        router.push("/login");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const categories = [
    {
      id: "all",
      name: "All Support",
      icon: MessageSquare,
      color: "bg-slate-100 text-slate-700",
    },
    {
      id: "portal",
      name: "Student Portal",
      icon: UserCheck,
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: "registration",
      name: "Course Registration",
      icon: BookOpen,
      color: "bg-green-100 text-green-700",
    },
    {
      id: "fees",
      name: "School Fees",
      icon: CreditCard,
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: "technical",
      name: "Technical Issues",
      icon: AlertCircle,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  const quickActions = [
    {
      category: "portal",
      text: "I can't log into my student portal",
      icon: UserCheck,
    },
    { category: "portal", text: "I forgot my portal password", icon: Shield },
    {
      category: "registration",
      text: "How do I register for courses?",
      icon: BookOpen,
    },
    {
      category: "registration",
      text: "Course registration is not working",
      icon: AlertCircle,
    },
    {
      category: "fees",
      text: "I can't pay my school fees online",
      icon: CreditCard,
    },
    {
      category: "fees",
      text: "Where can I download my payment receipt?",
      icon: FileText,
    },
    {
      category: "technical",
      text: "The university website is not loading",
      icon: Globe,
    },
    {
      category: "technical",
      text: "I'm having network connectivity issues",
      icon: AlertCircle,
    },
  ];

  const filteredActions =
    selectedCategory === "all"
      ? quickActions
      : quickActions.filter(
          (action: any) => action.category === selectedCategory
        );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying your account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header - keep as is */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-2 sm:p-2.5 rounded-xl shadow-lg">
                <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                  UniSupport AI
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Community Assistant
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-slate-800">
                  UniSupport AI
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden lg:flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 border-green-200"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    AI Online
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Made by Students</span>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900"
                >
                  <a
                    href="https://github.com/Bumblebig/UniSupport"
                    target="_blank"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </Button>

                <Separator
                  orientation="vertical"
                  className="h-6 hidden sm:block"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 bg-transparent text-xs sm:text-sm"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - use remaining height */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 p-3 sm:p-6">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-3 sm:gap-6 flex-1 min-h-0">
            {/* Mobile Sidebar Toggle */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full mb-3 bg-white/80"
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="h-4 w-4 mr-2" />
                    Hide Categories
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Show Categories
                  </>
                )}
              </Button>
            </div>

            {/* Sidebar - Mobile: collapsible, Desktop: conditional */}
            {isExpanded && (
              <div className="lg:col-span-1 space-y-3 sm:space-y-6 order-2 lg:order-1">
                {/* Categories */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-sm sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      Support Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 sm:space-y-2">
                    {categories.map((category: any) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all duration-200 flex items-center gap-2 sm:gap-3 ${
                            selectedCategory === category.id
                              ? `${category.color} shadow-sm`
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            {category.name}
                          </span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-sm sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                      Common Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 sm:space-y-2 max-h-48 sm:max-h-none overflow-y-auto">
                    {filteredActions.map((action: any, index: number) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => setInput(action.text)}
                          className="w-full text-left p-2 sm:p-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 flex items-start gap-2 sm:gap-3"
                        >
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm leading-relaxed">
                            {action.text}
                          </span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Chat Area - Fixed height with internal scrolling */}
            <div
              className={`${
                isExpanded ? "lg:col-span-3" : "lg:col-span-4"
              } flex flex-col min-h-0 order-1 lg:order-2`}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm flex flex-col h-full min-h-0">
                {/* Chat Header - Fixed */}
                <CardHeader className="border-b border-slate-200/60 pb-3 sm:pb-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="h-8 w-8 sm:h-12 sm:w-12">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                          <Bot className="h-4 w-4 sm:h-6 sm:w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-sm sm:text-lg font-semibold text-slate-800">
                          Student Support AI
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                          <span className="hidden sm:inline">
                            Community Assistant • Peer Support
                          </span>
                          <span className="sm:hidden">Online</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages Area - Scrollable */}
                <div className="flex-1 min-h-0 relative">
                  <div
                    className="absolute inset-0 overflow-y-auto p-3 sm:p-6"
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {messages.length === 0 && (
                      <div className="text-center py-6 sm:py-12">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 sm:p-8 rounded-3xl w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
                          <Bot className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">
                          Welcome to UniSupport AI!
                        </h3>
                        <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-4">
                          I'm an AI assistant created by a fellow student to
                          help with common academic IT issues. I can assist with
                          portal problems, course registration, payment issues,
                          and more.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto px-4">
                          {quickActions
                            .slice(0, 4)
                            .map((action: any, index: number) => {
                              const Icon = action.icon;
                              return (
                                <button
                                  key={index}
                                  onClick={() => setInput(action.text)}
                                  className="text-left p-3 sm:p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all duration-200 group"
                                >
                                  <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                                    </div>
                                    <div>
                                      <div className="text-xs sm:text-sm font-medium text-slate-800 mb-1">
                                        Quick Help
                                      </div>
                                      <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {action.text}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 sm:space-y-6">
                      {messages.map((message: Message, index: number) => (
                        <div
                          key={message.id}
                          className={`flex gap-2 sm:gap-4 ${
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mt-1 flex-shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                                <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-5 py-3 sm:py-4 ${
                              message.role === "user"
                                ? "bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg"
                                : "bg-white border border-slate-200 text-slate-800 shadow-sm"
                            }`}
                          >
                            <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-sm">
                              {message.content}
                            </div>
                            <div
                              className={`text-xs mt-2 sm:mt-3 flex items-center gap-2 ${
                                message.role === "user"
                                  ? "text-indigo-100"
                                  : "text-slate-500"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              {/* Replace this line: */}
                              {/* {new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })} */}

                              {/* With this: */}
                              {message.timestamp
                                ? // Handle Firestore Timestamp objects
                                  typeof message.timestamp === "object" &&
                                  message.timestamp.toDate
                                  ? message.timestamp
                                      .toDate()
                                      .toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                  : // Handle regular Date objects
                                  message.timestamp instanceof Date
                                  ? message.timestamp.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : // Handle timestamp strings
                                  typeof message.timestamp === "string"
                                  ? new Date(
                                      message.timestamp
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : // Fallback
                                    "Just now"
                                : "Just now"}

                              {message.role === "assistant" && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="hidden sm:inline">
                                    Student AI
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {message.role === "user" && (
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mt-1 flex-shrink-0">
                              <AvatarFallback className="bg-slate-600 text-white">
                                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex gap-2 sm:gap-4">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mt-1 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                              <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-white border border-slate-200 rounded-2xl px-3 sm:px-5 py-3 sm:py-4 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                              </div>
                              <span className="text-slate-600 text-xs sm:text-sm">
                                AI is thinking...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Area - Fixed at bottom */}
                <div className="border-t border-slate-200/60 p-3 sm:p-6 flex-shrink-0">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-3 sm:space-y-4"
                  >
                    <div className="flex gap-2 sm:gap-3">
                      <div className="flex-1 relative">
                        <Textarea
                          value={input}
                          onChange={handleInputChange}
                          placeholder="Ask about student portals, course registration, school fees, or any academic IT issue..."
                          className="min-h-[50px] sm:min-h-[60px] bg-white border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 resize-none pr-12 sm:pr-16 text-sm"
                          disabled={isLoading}
                          rows={2}
                        />
                        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-slate-500">
                          {input.length}/1000
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-4 sm:px-6 py-2 sm:py-3 h-auto shadow-lg transition-all duration-200"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <span className="hidden sm:inline">
                          Press Shift + Enter for new line
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="hidden sm:inline">Connected</span>
                      </div>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
