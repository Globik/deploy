import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Phone Parser</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-inner-logo">Sortnum</div>
          <Link href="/parsing">
            <button className="navbar-inner-content">
              <h2>Перейти к номерам</h2>
              <Image
                src="/images/arrow.png"
                alt="arrow"
                width={50}
                height={50}
              />
            </button>
          </Link>
        </div>
      </header>
      <div style={{ display: 'block' }}>
        <div className="intro">
          <div className="intro-left">
            <h1>Сортировка базы номеров по регионам</h1>
            <p>
              Загружайте номера телефонов ваших потенциальных клиентов общим
              списком и получите разделение номеров по регионам России для
              запуска точечной рекламы по ним.
            </p>
            <p>Идеально для маркетологов, таргетологов и специалистов по Автообзвону.</p>
            <p>Посмотрите, как это работает.</p>
          </div>
          <div className="intro-right">
            <img src="./images/manager.png" alt="manager" />
          </div>
        </div>

        <div className="steps">
          <h2 className="steps-title">Как использовать наш сайт</h2>
          <div className="steps-content">
            <StepRow
              count="01"
              imageSrc="/images/steps/work-procces-1.svg.svg"
              title="Загрузка вашего файла с номерами"
              content="Запустите приложение и загрузите файл со списком номеров, который вы хотите отсортировать. Мы поддерживаем .xlsx форматы файлов для вашего удобства."
            />
            <StepRow
              count="02"
              imageSrc="/images/steps/work-procces-2.svg.svg"
              title="Ожидание ответа сортировки"
              content="Наше приложение выполнит сортировку номеров автоматически. Оно обрабатывает большие объемы данных и обеспечивает быстрый и точный результат."
            />
            <StepRow
              count="03"
              imageSrc="/images/steps/work-procces-3.svg.svg"
              title="Получение результата"
              content="Приложение предоставит вам отсортированный список номеров в .xlsx формате. Вы сможете использовать эту информацию для своих нужд."
            />
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-content-icons">
            <SocialLink href="https://wa.me/+79187301076" imageSrc="/images/social/img5.svg" alt="social5" />
            <SocialLink href="https://t.me/sortnum" imageSrc="/images/social/img3.svg" alt="social3" />
          </div>
          <div className="footer-content-logo">Sortnum</div>
        </div>
      </footer>
    </>
  );
};

interface StepRowProps {
  count: string;
  imageSrc: string;
  title: string;
  content: string;
}

const StepRow: React.FC<StepRowProps> = ({ count, imageSrc, title, content }) => {
  return (
    <div className="steps-row">
      <div className="steps-row-image">
        <img src={imageSrc} alt={title} />
      </div>
      <div className="steps-info">
        <p className="steps-info-count">{count}</p>
        <div className="steps-info-content">
          <h3>{title}</h3>
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
};

interface SocialLinkProps {
  href: string;
  imageSrc: string;
  alt: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, imageSrc, alt }) => {
  return (
    <Link href={href}>
      <img src={imageSrc} alt={alt} />
    </Link>
  );
};

export default HomePage;
