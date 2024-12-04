import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

import { backendUrl } from "@/lib/utils";

import { ICard } from "./types";

export function InfoCard(props: { data: ICard }) {
  const { data } = props;
  const [value, setValue] = useState("...");

  useEffect(() => {
    switch (data.name) {
      case "TOTAL_TRANSACTIONS":
        getTotalTransactions();
        break;
      case "TOTAL_SUPPLY":
        getTotalSupply();
        break;
      case "DOLLAR_HOLDERS":
        getDollarHolders();
        break;
      case "DONATED":
        getDonated();
        break;
      case "ORG_INTEGRATED":
        getOrgIntegratedWithGlo();
        break;

      default:
        break;
    }
  }, []);

  const getTotalTransactions = async () => {
    try {
      const res = await axios.get(
        `https://app.glodollar.org/api/total-transactions`
      );
      // const res = await axios.get(`${backendUrl}/api/total-transactions`);
      setValue(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
      return { msg: "..." };
    }
  };
  const getDollarHolders = async () => {
    try {
      const res = await axios.get(
        `https://app.glodollar.org/api/total-holders`
      );
      // const res = await axios.get(`${backendUrl}/api/total-transactions`);
      setValue(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
      return { msg: "..." };
    }
  };

  const getTotalSupply = async () => {
    try {
      const res = await axios.get(`https://app.glodollar.org/api/total-supply`);
      // const res = await axios.get(`${backendUrl}/api/total-transactions`);
      const dividedByAMillion = (parseInt(res.data) / 1_000_000)
        .toFixed(2)
        .toString();
      const withDollarSign = "$"
        .concat(dividedByAMillion.toString())
        .concat("M");
      setValue(withDollarSign);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };
  const getOrgIntegratedWithGlo = async () => {
    setValue("61");
    return "61";
  };
  const getDonated = () => {
    setValue("$11,252");
  };

  return (
    <div
      className={`
        bg-white shadow-sm rounded-lg
         border-white border p-3 flex 
         flex-col items-center justify-center text-center
    `}
    >
      <Image
        src={data.image}
        width={25}
        height={25}
        alt="arrow-right"
        className="flex w-25px max-w-25px h-25px max-h-25px"
      />
      <h2 className="my-0 pb-2 pt-3">{value}</h2>
      <p className="text-sm text-muted font-thin">{data.title}</p>
    </div>
  );
}
