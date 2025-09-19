import { getUsers } from "@/lib/services/admin"
import UsersClient from "./users-client"

export default async function AdminUsersPage() {
  const { data, error } = await getUsers()
  
  return <UsersClient initialUsers={data || []} initialError={error} />
}