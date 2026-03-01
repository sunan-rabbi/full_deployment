"use client";
import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { userAPI } from "@/lib/api";
import UserList from "@/components/UserList";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import CreateUserModal from "@/components/CreateUserModal";

export default function Home() {

  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchLocalUsers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getLocalUsers();

      if (data.success) {
        setLocalUsers(data.data);
      }

    } catch (error) {
      console.error("Error fetching local users:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchLocalUsers();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">User Database Sync</h1>
          <p className="text-muted-foreground">
            Manage and sync users between local and online databases
          </p>
        </div>

        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-2">
            <Button
              onClick={fetchLocalUsers}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setCreateModalOpen(true);
              }}
              variant="default"
              disabled={loading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </div>
        </div>
        <UserList
          users={localUsers}
          title={`Local Users (${localUsers.length})`}
        />
      </div>

      <CreateUserModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => { fetchLocalUsers() }}
      />
    </div>
  );
}
