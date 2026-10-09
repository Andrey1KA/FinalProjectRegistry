"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

const CertificatesPage: NextPage = () => {
  const [idText, setIdText] = useState("1");
  const { targetNetwork } = useTargetNetwork();
  const id = /^\d+$/.test(idText) ? BigInt(idText) : null;

  const { data: count } = useScaffoldReadContract({
    contractName: "CertificateRegistry",
    functionName: "certificateCount",
  });

  const canRead = id !== null && count !== undefined && id > 0n && id <= count;
  const certificateId = id ?? 0n;

  const { data: authentic } = useScaffoldReadContract({
    contractName: "CertificateRegistry",
    functionName: "isAuthentic",
    args: [certificateId],
    query: { enabled: canRead },
  });

  const { data: certificate } = useScaffoldReadContract({
    contractName: "CertificateRegistry",
    functionName: "getCertificate",
    args: [certificateId],
    query: { enabled: canRead },
  });

  return (
    <div className="flex items-center flex-col grow pt-10 px-5">
      <h1 className="text-3xl font-bold mb-6">Проверка сертификата</h1>
      <p className="mb-6">Выдано сертификатов: {count === undefined ? "..." : count.toString()}</p>
      <label className="form-control w-full max-w-md mb-6">
        <span className="label-text mb-2">Номер</span>
        <input className="input input-bordered" value={idText} onChange={event => setIdText(event.target.value)} />
      </label>
      {id === null ? (
        <p>Введите номер</p>
      ) : canRead && certificate ? (
        <div className="bg-base-100 border border-base-300 rounded-xl p-6 w-full max-w-md">
          <p className="mb-2">
            Подлинность: <b>{authentic ? "подтверждена" : "не найден"}</b>
          </p>
          <p className="mb-2">Название: {certificate.title}</p>
          <p className="mb-2">Получатель:</p>
          <Address address={certificate.recipient} chain={targetNetwork} />
        </div>
      ) : (
        <p>Сертификат с таким номером ещё не выдан.</p>
      )}
    </div>
  );
};

export default CertificatesPage;
