import React from "react";
import { useRouter } from "next/router";
import AdminPanel from "../pages/components/AdminPanel";
import users from "../data.json"; // Загрузите данные из вашего data.json

const AdminPage: React.FC = () => {
  const router = useRouter();
  const isAuthenticated = true; // Проверьте аутентификацию администратора здесь

  if (!isAuthenticated) {
    // Если не аутентифицирован, перенаправьте на страницу аутентификации
    router.push("/admin/login");
    return null;
  }

  return <AdminPanel users={users} />;
};

export default AdminPage;
