"use client";

import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="flex items-center flex-col grow pt-10 px-5">
      <h1 className="text-center text-4xl font-bold mb-4">Реестр сертификатов</h1>
      <p className="text-center text-lg max-w-xl mb-10">
        Выдача и проверка учебных сертификатов. Каждый сертификат хранится в блокчейне и его можно проверить по номеру.
      </p>
      <div className="flex gap-6 flex-col md:flex-row">
        <Link href="/certificates" className="btn btn-primary">
          Проверить сертификат
        </Link>
        <Link href="/issue" className="btn btn-secondary">
          Выдать сертификат
        </Link>
      </div>
    </div>
  );
};

export default Home;
