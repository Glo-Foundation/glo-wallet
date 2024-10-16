import { User } from "@prisma/client";
import { GoogleSpreadsheet } from "google-spreadsheet";

const REFERRER_COLUMN = "Email-referrer (ID: id-f95ed0c6)";
const REFERRED_COLUMN = "Email2referred (ID: id-aa2d37b2)";

export const getReferrer = async (email: string) => {
  const doc = new GoogleSpreadsheet(process.env.REFERRALS_GOOGLE_SHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!,
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];

  const rows = await sheet.getRows();

  const referrer = rows.find((row) => row[REFERRED_COLUMN] === email);

  return referrer ? referrer[REFERRER_COLUMN] : null;
};
