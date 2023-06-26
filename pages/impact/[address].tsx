import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";

import EnoughToBuy from "@/components/EnoughToBuy";
import { getBalance, getTotalYield, getUSFormattedNumber } from "@/utils";

type Props = {
  balance: number;
};

export default function Impact({ balance }: Props) {
  const router = useRouter();
  const { address } = router.query;

  const totalDays = 365;
  const yearlyInterestRate = 0.024;
  const yearlyYield = getTotalYield(yearlyInterestRate, balance, totalDays);
  const yearlyYieldFormatted =
    yearlyYield > 0 ? `$0 - $${yearlyYield.toFixed(2)}` : "$0";
  const formattedBalance = getUSFormattedNumber(balance);

  return (
    <div className="mt-4 px-6">
      <div className="bg-white rounded-[20px] pt-4">
        <div className="flex flex-col space-y-2 p-4 mb-4">
          <div className="self-center text-sm text-pine-700/90 mb-1.5">
            Address
          </div>
          <div className="flex flex-row font-semibold justify-center mb-4">
            <div className="text-xs items-baseline">{address}</div>
          </div>
          <div className="self-center text-sm text-pine-700/90 mb-1.5">
            Balance
          </div>
          <div className="flex flex-row font-semibold justify-center">
            <div className="flex flex-row text-[2.625rem] items-baseline">
              ${formattedBalance}
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-impact-bg text-impact-fg rounded-[24px] mx-1 mb-1 px-5 pb-3">
          <div className="overflow-hidden">
            <div className="h-4 w-4 bg-white -rotate-45 transform origin-top-left translate-x-40"></div>
          </div>
          <div className="flex w-full justify-between items-center space-y-2">
            <div className="flex items-center">
              <Image
                className="pb-[2px] mr-2"
                src="/glo-logo.svg"
                alt="glo"
                height={28}
                width={28}
              />
              {yearlyYieldFormatted} / year
            </div>
            <EnoughToBuy yearlyYield={yearlyYield} />
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({
  params,
}: GetServerSidePropsContext) {
  const { address } = params;
  const balance = await getBalance(address as string);
  const formattedBalance = balance.div(10n ** 18n).toNumber();
  return {
    props: {
      balance: formattedBalance,
    },
  };
}
