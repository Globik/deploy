import React from "react";
import { useRouter } from "next/router";
import AdminPanel from "../pages/components/AdminPanel";
import axios from "axios";
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
var suka = (process.env.NODE_ENV=='production'?'сортировка-номеров.рф':'localhost:3003');
try{
//console.log(window.location.protocol)
  const res = await fetch("https://"+suka+"/api/getUsers");
  console.log(res);
  if(res.status==200){
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
  }catch(e:any){
	  console.log("hier ist ein error ", e)
	  return {
		  props:{
			  users:[]
		  }
	  };
	  
  }
}
export default AdminPage;
