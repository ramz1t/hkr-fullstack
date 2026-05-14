import { useAuth } from "@repo/hooks/use-auth";
import { useAxios } from "@repo/hooks/use-axios";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Ban,
  CheckCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

interface AdminUserView {
  id: string;
  email: string;
  role: string;
  isBanned: boolean;
  name?: string;
  dob?: string;
  createdAt?: string;
}

const Dashboard = () => {
  const {} = useAuth();
  const axios = useAxios();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users query
  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<AdminUserView[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await axios.get("/api/users");
      return res.data;
    },
  });

  // Ban user mutation
  const banMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axios.patch(`/api/users/${userId}/ban`);
    },
    onSuccess: () => {
      toast.success("User access revoked successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to ban user");
    },
  });

  // Unban user mutation
  const unbanMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axios.patch(`/api/users/${userId}/unban`);
    },
    onSuccess: () => {
      toast.success("User access restored successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to unban user");
    },
  });

  // Filtered users based on search term
  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const bannedUsers = users.filter((u) => u.isBanned).length;
  const activeUsers = totalUsers - bannedUsers;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-500">
      {/* Premium Administrative Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-card/80 via-card/40 to-background p-6 rounded-2xl border border-border/60 shadow-sm backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
              Operations Center
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="size-2 rounded-full bg-green-500 inline-block animate-pulse"></span> Live DB Sync
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-heading">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse registered platform accounts, monitor operational statuses, and enforce access restrictions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="gap-2 border-primary/20 hover:bg-primary/5 h-10 px-4 rounded-xl"
          >
            <RefreshCw className={`size-4 ${isRefetching ? "animate-spin text-primary" : ""}`} />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/40 border-border/50 backdrop-blur-md shadow-sm hover:border-primary/20 transition-all">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Accounts
            </CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{isLoading ? "-" : totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered users database</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/50 backdrop-blur-md shadow-sm hover:border-green-500/20 transition-all">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Access
            </CardTitle>
            <UserCheck className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-green-500">{isLoading ? "-" : activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Accounts in good standing</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/50 backdrop-blur-md shadow-sm hover:border-destructive/20 transition-all">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Suspended / Banned
            </CardTitle>
            <UserX className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-destructive">{isLoading ? "-" : bannedUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Access globally revoked</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Interface */}
      <Card className="border-border/60 shadow-xl bg-card/60 backdrop-blur-xl overflow-hidden rounded-2xl">
        <div className="p-4 md:p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg font-heading">Registered Users Directory</h3>
            <p className="text-xs text-muted-foreground">Displaying secure credentials and associated records</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Table View Container */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-6">Account ID</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">DOB</th>
                <th className="py-3.5 px-6">Registered</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span className="text-xs">Loading authorized user datasets...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-destructive">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="size-6" />
                      <span className="text-xs font-semibold">Failed to fetch network records. Ensure administrative privileges are active.</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <p className="text-sm font-medium">No users found matching query criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isTargetingThisUser =
                    banMutation.isPending && banMutation.variables === u.id ||
                    unbanMutation.isPending && unbanMutation.variables === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-muted/20 transition-colors ${u.isBanned ? "bg-destructive/5" : ""}`}
                    >
                      {/* ID Column */}
                      <td className="py-3.5 px-6 font-mono text-xs text-muted-foreground max-w-[120px] truncate" title={u.id}>
                        {u.id}
                      </td>

                      {/* Email Column */}
                      <td className="py-3.5 px-6 font-medium text-foreground">
                        {u.email}
                      </td>

                      {/* Role Column */}
                      <td className="py-3.5 px-6">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                          u.role === "ADMIN" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Name Column (Acceptance Criteria placeholder support) */}
                      <td className="py-3.5 px-6 text-muted-foreground text-xs italic">
                        {u.name || "N/A"}
                      </td>

                      {/* DOB Column (Acceptance Criteria placeholder support) */}
                      <td className="py-3.5 px-6 text-muted-foreground text-xs italic">
                        {u.dob || "N/A"}
                      </td>

                      {/* Registered Timestamps Column */}
                      <td className="py-3.5 px-6 text-muted-foreground text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "System Default"}
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-6 text-center">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20">
                            <Ban className="size-3" /> Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold border border-green-500/20">
                            <CheckCircle className="size-3" /> Active
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-6 text-right">
                        {u.role === "ADMIN" ? (
                          <span className="text-[11px] text-muted-foreground/60 italic block py-1.5">Protected Admin</span>
                        ) : u.isBanned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white transition-all rounded-lg"
                            onClick={() => unbanMutation.mutate(u.id)}
                            disabled={isTargetingThisUser}
                          >
                            {isTargetingThisUser ? "Updating..." : "Unban User"}
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 px-3 text-xs bg-destructive/90 hover:bg-destructive transition-all rounded-lg shadow-sm"
                            onClick={() => banMutation.mutate(u.id)}
                            disabled={isTargetingThisUser}
                          >
                            {isTargetingThisUser ? "Updating..." : "Ban User"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border/40 bg-muted/10 text-center text-xs text-muted-foreground">
          Showing fully authenticated database records accessed via secure HMAC signed session tokens.
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
