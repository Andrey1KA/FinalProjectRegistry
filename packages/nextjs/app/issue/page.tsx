"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { isAddress } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type TxStatus = "idle" | "loading" | "success" | "error";

const IssuePage: NextPage = () => {
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [detail, setDetail] = useState("");
  const { writeContractAsync, isMining } = useScaffoldWriteContract({
    contractName: "CertificateRegistry",
  });

  const shownStatus: TxStatus = isMining || status === "loading" ? "loading" : status;

  async function issueCertificate() {
    setStatus("loading");
    setDetail("");
    try {
      if (!isAddress(recipient)) {
        throw new Error("Укажите адрес получателя");
      }
      if (title.trim().length === 0) {
        throw new Error("Укажите название");
      }
      const hash = await writeContractAsync({
        functionName: "issueCertificate",
        args: [recipient, title.trim()],
      });
      if (!hash) {
        throw new Error("Транзакция не отправлена");
      }
      setStatus("success");
      setDetail(hash);
    } catch (error) {
      setStatus("error");
      setDetail(error instanceof Error ? error.message : "Ошибка транзакции");
    }
  }

  return (
    <div className="flex items-center flex-col grow pt-10 px-5">
      <h1 className="text-3xl font-bold mb-6">Выдача сертификата</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <label className="form-control">
          <span className="label-text mb-2">Получатель</span>
          <input
            className="input input-bordered"
            placeholder="0x..."
            value={recipient}
            onChange={event => setRecipient(event.target.value)}
          />
        </label>
        <label className="form-control">
          <span className="label-text mb-2">Название</span>
          <input
            className="input input-bordered"
            placeholder="Основы блокчейна"
            value={title}
            onChange={event => setTitle(event.target.value)}
          />
        </label>
        <button className="btn btn-primary" onClick={issueCertificate} disabled={shownStatus === "loading"}>
          {shownStatus === "loading" ? "Загрузка" : "Выдать сертификат"}
        </button>
        {shownStatus === "success" && <p className="text-success">Успех. Транзакция: {detail}</p>}
        {shownStatus === "error" && <p className="text-error">Ошибка. {detail}</p>}
      </div>
    </div>
  );
};

export default IssuePage;
