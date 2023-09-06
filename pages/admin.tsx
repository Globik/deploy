import React from "react";
import { useRouter } from "next/router";
import AdminPanel from "../pages/components/AdminPanel";

//import users from "../data.json"; // Загрузите данные из вашего data.json


type User = {
  username: string;
  password: string;
  accessExpiration?: string;
  privilege: boolean;
};

interface Fucker{
	users: User[];
}

//const AdminPage: React.FC = (users) => {
const AdminPage=(props: Fucker)=>{
const {users}=props;
  const router = useRouter();
  const isAuthenticated = true; // Проверьте аутентификацию администратора здесь

  if (!isAuthenticated) {
    // Если не аутентифицирован, перенаправьте на страницу аутентификации
    router.push("/admin/login");
    return null;
  }

  return <AdminPanel users={users} />;
};

export async function getServerSideProps() {
console.log('***FUCKER ***', process.env.NODE_ENV);
var suka = (process.env.NODE_ENV=='production'?'http://сортировка-номеров.рф':'http://localhost:3000');
try{
  const res = await fetch(suka+"/api/getUsers");
  //alert(res)
  if(res.ok){
	  const us = await res.json();
	 // console.log("***US*** ", us);
	  const users=us.users;
	 // console.log("*** USERS *** ")
	  return {
		  props:{
			  users
		  }
	  };
  }
  }catch(e){
	  console.log("hier ist ein error ", e)
	  return {
		  props:{
			  users:[]
		  }
	  };
	  
  }
}
export default AdminPage;
