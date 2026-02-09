"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Loader2,
  RefreshCw,
  ChevronDown,
  FileText,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  status: "PENDING" | "APPROVED" | "DENIED" | "SUSPENDED";
  role: "USER" | "ADMIN";
  dailyVideoQuota: number;
  dailyImageQuota: number;
  videosGeneratedToday: number;
  imagesGeneratedToday: number;
  subscriptionTier: string;
  adminTier: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  mode: string | null;
  resourceType: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}

interface Counts {
  total: number;
  pending: number;
  approved: number;
  denied: number;
  suspended: number;
}

type Tab = "users" | "audit";
type StatusFilter = "all" | "PENDING" | "APPROVED" | "DENIED" | "SUSPENDED";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  APPROVED: "bg-green-500/10 text-green-600 border-green-500/20",
  DENIED: "bg-red-500/10 text-red-600 border-red-500/20",
  SUSPENDED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-3 w-3" />,
  APPROVED: <CheckCircle className="h-3 w-3" />,
  DENIED: <XCircle className="h-3 w-3" />,
  SUSPENDED: <Ban className="h-3 w-3" />,
};

export default function AdminPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [counts, setCounts] = useState<Counts>({
    total: 0,
    pending: 0,
    approved: 0,
    denied: 0,
    suspended: 0,
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  // Check admin status and fetch data
  useEffect(() => {
    async function checkAdminAndFetch() {
      if (!session) return;

      try {
        // Fetch users to check admin status
        const res = await fetch("/api/admin/users");

        if (res.status === 403) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (res.ok) {
          setIsAdmin(true);
          const data = await res.json();
          setUsers(data.users || []);
          if (data.counts) {
            setCounts(data.counts);
          }
        }
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      checkAdminAndFetch();
    }
  }, [session]);

  // Fetch users with filter
  const fetchUsers = async (filter: StatusFilter) => {
    setLoading(true);
    try {
      const url =
        filter === "all"
          ? "/api/admin/users"
          : `/api/admin/users?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    if (newTab === "audit" && auditLogs.length === 0) {
      fetchAuditLogs();
    }
  };

  // Handle status filter change
  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    fetchUsers(filter);
  };

  // Update user status
  const updateUserStatus = async (
    userId: string,
    newStatus: "PENDING" | "APPROVED" | "DENIED" | "SUSPENDED"
  ) => {
    setUpdatingUser(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Update local state
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
        // Update counts
        fetchUsers(statusFilter);
      }
    } catch (err) {
      console.error("Failed to update user:", err);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Update user admin tier override
  const updateAdminTier = async (userId: string, adminTier: string | null) => {
    setUpdatingUser(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminTier }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, adminTier } : u))
        );
      }
    } catch (err) {
      console.error("Failed to update admin tier:", err);
    } finally {
      setUpdatingUser(null);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in Required</h1>
        <p className="text-muted-foreground mb-6">
          Please sign in to access the admin dashboard.
        </p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have permission to access the admin dashboard.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage users and view system activity
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => (tab === "users" ? fetchUsers(statusFilter) : fetchAuditLogs())}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
          onClick={() => handleFilterChange("all")}
        >
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counts.total}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "PENDING" ? "ring-2 ring-yellow-500" : ""}`}
          onClick={() => handleFilterChange("PENDING")}
        >
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "APPROVED" ? "ring-2 ring-green-500" : ""}`}
          onClick={() => handleFilterChange("APPROVED")}
        >
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Approved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "DENIED" ? "ring-2 ring-red-500" : ""}`}
          onClick={() => handleFilterChange("DENIED")}
        >
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Denied
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{counts.denied}</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === "SUSPENDED" ? "ring-2 ring-gray-500" : ""}`}
          onClick={() => handleFilterChange("SUSPENDED")}
        >
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-gray-500" />
              Suspended
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600">{counts.suspended}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={tab === "users" ? "default" : "outline"}
          onClick={() => handleTabChange("users")}
        >
          <Users className="h-4 w-4 mr-2" />
          Users
        </Button>
        <Button
          variant={tab === "audit" ? "default" : "outline"}
          onClick={() => handleTabChange("audit")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Audit Logs
        </Button>
      </div>

      {/* Tab Content */}
      {tab === "users" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter === "all" ? "All Users" : `${statusFilter} Users`}
            </CardTitle>
            <CardDescription>
              Click on status cards above to filter users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {u.email}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={STATUS_COLORS[u.status]}
                        >
                          {STATUS_ICONS[u.status]}
                          <span className="ml-1">{u.status}</span>
                        </Badge>
                        {u.role === "ADMIN" && (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {u.adminTier && (
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                            <FlaskConical className="h-3 w-3 mr-1" />
                            Test
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {u.adminTier ?? u.subscriptionTier ?? "free"}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          Joined: {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          Images: {u.imagesGeneratedToday}/{u.dailyImageQuota}
                        </span>
                        <span>
                          Videos: {u.videosGeneratedToday}/{u.dailyVideoQuota}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingUser === u.id}
                        >
                          {updatingUser === u.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Actions
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {u.status !== "APPROVED" && (
                          <DropdownMenuItem
                            onClick={() => updateUserStatus(u.id, "APPROVED")}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {u.status !== "DENIED" && (
                          <DropdownMenuItem
                            onClick={() => updateUserStatus(u.id, "DENIED")}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Deny
                          </DropdownMenuItem>
                        )}
                        {u.status !== "SUSPENDED" && (
                          <DropdownMenuItem
                            onClick={() => updateUserStatus(u.id, "SUSPENDED")}
                            className="text-gray-600"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                        {u.status !== "PENDING" && (
                          <DropdownMenuItem
                            onClick={() => updateUserStatus(u.id, "PENDING")}
                            className="text-yellow-600"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Set Pending
                          </DropdownMenuItem>
                        )}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">
                          Tier Override
                        </div>
                        {["trial", "starter", "pro", "agency"].map((tier) => (
                          <DropdownMenuItem
                            key={tier}
                            onClick={() => updateAdminTier(u.id, tier)}
                            className={u.adminTier === tier ? "font-bold" : ""}
                          >
                            <FlaskConical className="h-4 w-4 mr-2" />
                            Set {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </DropdownMenuItem>
                        ))}
                        {u.adminTier && (
                          <DropdownMenuItem
                            onClick={() => updateAdminTier(u.id, null)}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Clear Override
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "audit" && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              Recent system activity and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 border rounded-lg text-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.action}</Badge>
                        {log.mode && (
                          <Badge variant="secondary">{log.mode}</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1">
                        {log.userName || log.userEmail || "System"} •{" "}
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                      {log.metadata && (
                        <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
