import { useAxios } from "@repo/hooks/use-axios";
import { Button } from "@repo/ui/button";
import {
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmpty
} from "@repo/ui/table";
import { UUID } from "@repo/ui/uuid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  RefreshCw,
  ShieldAlert,
  UserCheck,
  UserX,
  UsersIcon
} from "lucide-react";
import { Input } from "@repo/ui/input";
import { StatCard } from "./StatCard";
import type { ApiResponse, UserDto } from "@repo/types";
import { Helmet } from "react-helmet-async";
import type { AxiosError } from "axios";

const Users = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

  // Fetch users query
  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery<UserDto[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/users`);
      return res.data?.data || [];
    }
  });

  // Ban user mutation
  const banMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axios.patch(`${baseUrl}/users/${userId}/ban`);
    },
    onSuccess: () => {
      toast.success("User access revoked successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: AxiosError<ApiResponse<unknown>>) => {
      toast.error(err?.response?.data?.error?.message || "Failed to ban user");
    }
  });

  // Unban user mutation
  const unbanMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axios.patch(`${baseUrl}/users/${userId}/unban`);
    },
    onSuccess: () => {
      toast.success("User access restored successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: AxiosError<ApiResponse<unknown>>) => {
      toast.error(
        err?.response?.data?.error?.message || "Failed to unban user"
      );
    }
  });

  // Filtered users based on search term
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const bannedUsers = users.filter((u) => u.isBanned).length;
  const activeUsers = totalUsers - bannedUsers;

  return (
    <div className="p-4 mx-auto container space-y-5">
      <Helmet>
        <title>Users | CasinoAdmin</title>
      </Helmet>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Accounts"
          value={totalUsers}
          icon={UsersIcon}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Access"
          value={activeUsers}
          icon={UserCheck}
          isLoading={isLoading}
          colorClass="text-green-500"
        />
        <StatCard
          title="Suspended / Banned"
          value={bannedUsers}
          icon={UserX}
          isLoading={isLoading}
          colorClass="text-destructive"
        />
      </div>

      {/* Main Table Interface */}
      <div className="border-border/60 shadow-xl bg-card/60 backdrop-blur-xl overflow-hidden">
        <div className="p-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg font-heading">Registered Users</h3>

          {/* Search Input */}
          <div className="flex items-center gap-5">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
            >
              <RefreshCw
                className={`size-4 ${isRefetching ? "animate-spin text-primary" : ""}`}
              />
              <span>Refresh Data</span>
            </Button>
            <div className="relative w-full sm:w-72">
              <Input
                type="text"
                placeholder="Search by email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table View Container */}
        <Table>
          <TableHeader>
            <TableHeaderRow>
              <TableHead>Account ID</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeaderRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableEmpty>
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                </div>
              </TableEmpty>
            ) : isError ? (
              <TableEmpty className="text-destructive">
                <div className="flex flex-col items-center justify-center gap-2">
                  <ShieldAlert className="size-6" />
                  <span className="text-xs font-semibold">
                    Failed to fetch network records. Ensure administrative
                    privileges are active.
                  </span>
                </div>
              </TableEmpty>
            ) : filteredUsers.length === 0 ? (
              <TableEmpty>No users found matching query criteria.</TableEmpty>
            ) : (
              filteredUsers.map((u) => {
                const isTargetingThisUser =
                  (banMutation.isPending && banMutation.variables === u.id) ||
                  (unbanMutation.isPending && unbanMutation.variables === u.id);

                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <UUID value={u.id} />
                    </TableCell>

                    <TableCell>{u.email}</TableCell>

                    <TableCell>
                      <span
                        className={`px-2.5 py-0.5 border text-xs font-semibold tracking-wide uppercase ${
                          u.role === "ADMIN"
                            ? "inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.role}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {u.isBanned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20">
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-500/10 text-green-500 text-xs font-semibold border border-green-500/20">
                          Active
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {u.role === "ADMIN" ? (
                        <span className="text-[11px] text-muted-foreground/60 italic block py-1.5">
                          Protected Admin
                        </span>
                      ) : u.isBanned ? (
                        <Button
                          variant="outline"
                          onClick={() => unbanMutation.mutate(u.id)}
                          disabled={isTargetingThisUser}
                        >
                          {isTargetingThisUser ? "Updating..." : "Unban User"}
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => banMutation.mutate(u.id)}
                          disabled={isTargetingThisUser}
                        >
                          {isTargetingThisUser ? "Updating..." : "Ban User"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Users;
