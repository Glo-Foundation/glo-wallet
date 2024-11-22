import "react-tooltip/dist/react-tooltip.css";
import { Charity, CharityChoice } from "@prisma/client";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";

import CharityCard from "@/components/Modals/CharityCard";
import CharityManageModal from "@/components/Modals/CharityManageModal";
import { getCurrentSelectedCharity } from "@/fetchers";
import { ModalContext } from "@/lib/context";
import { CHARITY_MAP } from "@/lib/utils";
import { getTotalYield } from "@/utils";

interface Props {
  yearlyYield: number;
}

export default function Recipients({ yearlyYield }: Props) {
  const { openModal } = useContext(ModalContext);
  const [selected, setSelected] = useState({} as { [key: string]: boolean });
  const [search, setSearch] = useState("");
  const [fundingChoices, setFundingChoices] = useState<{
    [key: string]: number;
  }>({});
  const [totalYield, setTotalYield] = useState(0);

  // Fetch and set funding choices on component mount
  useEffect(() => {
    fetch("/api/funding/getChoices")
      .then((res) => res.json())
      .then((data) => {
        setFundingChoices(data.possibleFundingChoices);
      })
      .catch((error) => {
        console.error("Error fetching funding choices:", error);
      });
  }, []);

  useEffect(() => {
    const x = document.getElementById("Smallchat");
    x?.classList.add("invisible");
    return () => {
      x?.classList.remove("invisible");
    };
  }, []);

  const selectedKeys = Object.entries(selected)
    .filter((x) => x[1])
    .map((x) => x[0]);
  const { data: selectedCharities } = useSWR<CharityChoice[]>(
    "/charity",
    getCurrentSelectedCharity
  );

  const selectedCharitiesNames = selectedCharities
    ? selectedCharities.map((x) => x.name)
    : [];
  const selectedCharitiesMap = Object.entries(CHARITY_MAP).filter((x) =>
    selectedCharitiesNames.includes(x[0] as Charity)
  );
  const searchPhrase = search.toLowerCase();

  const availableCharitiesMap = Object.entries(CHARITY_MAP).filter(
    (x) =>
      !selectedCharitiesNames.includes(x[0] as Charity) &&
      (!search.length ||
        x[1].description.toLowerCase().includes(searchPhrase) ||
        x[1].name.toLowerCase().includes(searchPhrase))
  );
  const percentMap: { [id: string]: number } =
    selectedCharities?.reduce(
      (acc, cur) => ({ ...acc, [cur.name]: cur.percent }),
      {}
    ) || {};
  // Calculate total yield when funding choices or selected charities change
  console.log(fundingChoices);
  useEffect(() => {
    if (Object.keys(fundingChoices).length && selectedCharities) {
      let calculatedYield = 0;

      Object.keys(fundingChoices).forEach((cause: any) => {
        if (selectedCharitiesNames.includes(cause)) {
          calculatedYield += getTotalYield(fundingChoices[cause]);
        }
      });

      setTotalYield(calculatedYield);
    }
  }, [fundingChoices, selectedCharities]);

  return (
    <>
      <div className="bg-white rounded-[20px] p-4">
        <section className="text-center p-2">
          <div className="flex justify-between">
            <h3 className="pt-0">My recipients</h3>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                openModal(
                  <CharityManageModal
                    percentMap={{ ...percentMap }}
                    yearlyYield={yearlyYield}
                  />
                );
              }}
            >
              <Image
                src={"/gear.svg"}
                width={16}
                height={16}
                alt="choose public good to fund"
              />
              <p className="ml-2 text-sm">Manage</p>
            </div>
          </div>
          <p className="text-sm py-4 copy text-left">
            You fund up to <b>${yearlyYield.toFixed(2) || 0} </b>
            of the <b> ${totalYield.toFixed(2) || 0}/year </b>
            we donate to these causes.
          </p>
        </section>
        <section>
          {selectedCharitiesMap.map(([key, charity]) => (
            <CharityCard
              key={key}
              iconPath={charity.iconPath}
              name={charity.name}
              description={charity.description}
              type={charity.type}
              percent={percentMap[key]}
            />
          ))}
        </section>
      </div>
      <div className="bg-white rounded-[20px] p-4">
        <section className="text-left p-2">
          <h3 className="pt-0">Explore recipients</h3>
          <p className="text-sm py-4 copy">You can pick as many as you want.</p>
        </section>

        <section className="text-left pb-4 relative">
          <Image
            className="ml-2 mt-1.5 absolute left-0"
            src="/search.svg"
            width={16}
            height={16}
            alt="search"
          />
          <input
            className="pl-7 w-full rounded-full bg-white border-2 rounded-xl border-pine-100"
            placeholder={"Search..."}
            value={search}
            data-testid="submit-email-input"
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>
        <section>
          {availableCharitiesMap.map(([key, charity]) => (
            <CharityCard
              key={key}
              iconPath={charity.iconPath}
              name={charity.name}
              description={charity.description}
              type={charity.type}
              selected={selected[key]}
              onClick={() =>
                setSelected({ ...selected, [key]: !selected[key] })
              }
            />
          ))}
        </section>
      </div>
      {!!selectedKeys.length && (
        <div className="flex p-2 justify-between content-center bg-white fixed bottom-0 left-0 right-0">
          <p>
            {selectedKeys.length} recipient{selectedKeys.length > 1 ? "s" : ""}{" "}
            selected
          </p>
          <div className="flex">
            <button
              className="primary-button h-8 border-2 bg-white mr-2"
              onClick={() => setSelected({})}
            >
              Cancel
            </button>
            <button
              className="primary-button h-8"
              onClick={() =>
                openModal(
                  <CharityManageModal
                    percentMap={{
                      ...percentMap,
                      ...selectedKeys.reduce(
                        (acc, cur) => ({ ...acc, [cur]: 0 }),
                        {}
                      ),
                    }}
                    isAddNewMode={true}
                    yearlyYield={yearlyYield}
                    onClose={() => setSelected({})}
                  />
                )
              }
            >
              Add
            </button>
          </div>
        </div>
      )}
    </>
  );
}
