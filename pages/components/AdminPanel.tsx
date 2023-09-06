// AdminPanel.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AdminPanel.module.css";

type User = {
  username: string;
  password: string;
  accessExpiration?: string;
  privilege: boolean;
};

interface AdminPanelProps {
  users: User[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ users }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [userAccessTypes, setUserAccessTypes] = useState<{
    [username: string]: string;
  }>({});
  const [usersWithTimers, setUsersWithTimers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authResponse, adminResponse] = await Promise.all([
          axios.get("/api/checkAuth"),
          axios.get("/api/checkAdmin"),
        ]);

        setIsAuthenticated(authResponse.data.isAuthenticated);
        setIsAdmin(adminResponse.data.isAdmin);

        // Update users with timers
        const updatedUsersWithTimers = users.map((user) => {
          const updatedUser = { ...user };

          if (
            updatedUser.accessExpiration !== undefined &&
            updatedUser.accessExpiration !== "null"
          ) {
            const expirationDate = new Date(updatedUser.accessExpiration);
            const currentDate = new Date();
            if (expirationDate <= currentDate) {
              updatedUser.privilege = false;
            }
          }

          return updatedUser;
        });

        setUsersWithTimers(updatedUsersWithTimers);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAccessChange = async (
    username: string,
    selectedAccessType: string
  ) => {
    try {
      let privilege = selectedAccessType !== "reset";
      let accessExpiration =
        usersWithTimers.find((user) => user.username === username)
          ?.accessExpiration || "";

      if (selectedAccessType === "unlimited") {
        privilege = true;
        const currentDate = new Date();
        const expirationDate = new Date(
          currentDate.getFullYear() + 10,
          currentDate.getMonth(),
          currentDate.getDate()
        );
        accessExpiration = expirationDate.toISOString();
      }

     let a = await axios.post("/api/changePrivilege", {
        username,
        privilege,
        accessType: privilege ? selectedAccessType : "reset",
      });
console.log(a);
if(a.status === 200){
alert(a.data.message);
if(a.data.accessExpiration){
//alert(1)
/*
	calculateRemainingTime(
                a.data.accessExpiration,
                privilege ? selectedAccessType : "reset",
                privilege
              )
              */
}
}
      const updatedUsersWithTimers = usersWithTimers.map((user) =>{
        if(user.username === username){
     //   console.warn(accessExpiration);
          return { ...user, privilege, accessExpiration }
          }else{
          return user;
          }
          }
      );

      // Update usersWithTimers
      setUsersWithTimers(updatedUsersWithTimers);
      const updatedUserAccessTypes = { ...userAccessTypes };
      updatedUserAccessTypes[username] = selectedAccessType;
      setUserAccessTypes(updatedUserAccessTypes);
      // Check if timer has expired and update privilege
      if (!privilege) {
        const expirationDate = new Date(accessExpiration);
        const currentDate = new Date();
        if (expirationDate <= currentDate) {
          const updatedUsers = updatedUsersWithTimers.map((user) =>
            user.username === username ? { ...user, privilege: false } : user
          );
          setUsersWithTimers(updatedUsers);
        }
      }
    } catch (error) {
      console.error("Error changing access:", error);
    }
  };

  function calculateRemainingTime(
    expiration: string,
    accessType: string,
    privilege: boolean
  ) {
  console.warn(expiration);
    if (expiration === "null") {
      return "∞";
    }
    if (!privilege) {
      return "Нет доступа к загрузке";
    }
    if (accessType === "unlimited") {
      return "Неограниченное время";
    }
    const expirationDate = new Date(expiration);
    const currentDate = new Date();
    const timeDifference = expirationDate.getTime() - currentDate.getTime();

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${days} дней, ${hours} часов, ${minutes} минут`;
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/logoutAdmin");
      setIsAdmin(false);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  interface UserAccessFormProps {
    user: User;
    selectedAccessType: string;
    onAccessTypeChange: (accessType: string) => void;
  }

  const UserAccessForm: React.FC<UserAccessFormProps> = ({
    user,
    selectedAccessType,
    onAccessTypeChange,
  }) => {
    const handleAccessTypeChange = (accessType: string) => {
      onAccessTypeChange(accessType);
      const updatedUserAccessTypes = { ...userAccessTypes };
      updatedUserAccessTypes[user.username] = accessType;
      setUserAccessTypes(updatedUserAccessTypes);
    };

    return (
      <div className={styles.userForm}>
        <h2>{user.username}</h2>
        <select
          value={selectedAccessType}
          onChange={(e) => handleAccessTypeChange(e.target.value)}
        >
          <option value="">Выберите тип доступа</option>
          <option value="trial20min">Пробный период 20 минут</option>
          <option value="month">Месяц</option>
          <option value="halfYear">Полгода</option>
          <option value="reset">Сброс времени</option>
          <option value="unlimited">Неограниченное время</option>
        </select>

        <p>
          Осталось времени:{" "}
          {user.accessExpiration
            ? calculateRemainingTime(
                user.accessExpiration,
                selectedAccessType,
                user.privilege
              )
            : "Неограниченное время"}
        </p>
      </div>
    );
  };
  return (
    <div className={styles.adminPanel}>
      {isAuthenticated ? (
        <div>
          <h2>Доступ к загрузке файлов у пользователей</h2>
          {isAdmin ? (
            <>
              <input
                type="text"
                placeholder="Поиск по пользователям"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className={styles.searchInput}
              />
              <div className={styles.userList}>
                {usersWithTimers
                  .filter((user) => user.username.includes(searchText))
                  .map((user) => (
                    <UserAccessForm
                      key={user.username}
                      user={user}
                      selectedAccessType={userAccessTypes[user.username] || ""}
                      onAccessTypeChange={(accessType) => {
                        setUserAccessTypes((prevAccessTypes) => ({
                          ...prevAccessTypes,
                          [user.username]: accessType,
                        }));
                        handleAccessChange(user.username, accessType);
                      }}
                    />
                  ))}
              </div>

              <div className={styles.logoutButtonContainer}>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Выйти
                </button>
              </div>
            </>
          ) : (
            <p>Недостаточно прав для доступа к админ-панели</p>
          )}
        </div>
      ) : (
        <p>Пожалуйста, войдите в систему</p>
      )}
    </div>
  );
};

export default AdminPanel;
