import { GetServerSideProps } from "next";
import fs from "fs";
import path from "path";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FileUploader from "../pages/components/FileUpload";
import Link from "next/link";

interface User {
  username: string;
  password: string;
  privilege: boolean;
}

const dataFilePath = path.join(process.cwd(), "data.json");

interface ParsingProps {
  user: User;
}

const ParsingPage = ({ user }: ParsingProps) => {
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-inner-logo">Sortnum</div>
          <Link href="/">
            <button className="navbar-inner-content">
              <h2>Перейти Домой</h2>
              <img src="./images/arrow.png" alt="arrow" />
            </button>
          </Link>
        </div>
      </header>
      {user.privilege ? (
        <FileUploader />
      ) : (
        <>
          <div className="test2">Вы успешно зарегистрировались!</div>
          <div className="test3">
            Чтобы получить доступ к программе обратитесь к техподдержке <Link href="https://t.me/sortnum">Telegram</Link>, <br /> В сообщении укажите свой логин на который
            регистрировались. <br /> Ваш логин: <p style={{color: "red", display: "inline"}}>{user.username}</p>
          </div>
        </>
      )}
      <footer
        className="footer"
        style={{ width: "100%", position: "fixed", bottom: "0" }}
      >
        <div className="footer-content">
          <div className="footer-content-icons">
            <Link href="https://wa.me/+79187301076">
              <img src="./images/social/img5.svg" alt="social5" />
            </Link>
            <Link href="https://t.me/sortnum">
              <img src="./images/social/img3.svg" alt="social3" />
            </Link>
          </div>
          <div className="footer-content-logo">Sortnum</div>
        </div>
      </footer>
    </>
  );
};

export default ParsingPage;

export const getServerSideProps: GetServerSideProps<ParsingProps> = async (
  context
) => {
  try {
    const rawData = await fs.promises.readFile(dataFilePath, "utf-8");
    const users: User[] = JSON.parse(rawData);

    const username = context.req.cookies.username || "";

    const user = users.find((u) => u.username === username);

    if (!user) {
      return {
        redirect: {
          destination: "/auth",
          permanent: false,
        },
      };
    }

    return {
      props: {
        user,
      },
    };
  } catch (error) {
    console.error("Error during getServerSideProps:", error);
    return {
      notFound: true,
    };
  }
};
