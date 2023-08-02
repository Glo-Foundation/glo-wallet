import { User } from "@prisma/client";
import { GoogleSpreadsheet } from "google-spreadsheet";

const EMAIL_COLUMN = "Email (ID: id-2c29c00d)";
const EA_COLUMN = "Added to website?";

export const fetchEarlyAdoptersEmails = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!,
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByTitle["HeyFlow Early adopters"];

  const rows = await sheet.getRows();

  const emails = rows
    .filter((row) => row[EA_COLUMN] === "yes" && row[EMAIL_COLUMN].length)
    .map((row) => row[EMAIL_COLUMN]);

  const uniqueEmails = new Set<string>(emails);

  return uniqueEmails;
};

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

export const addNewGloAppUserToSheet = async (user: User) => {
  const CREATEDAT_COLUMN = "createdAt";
  const ADDRESS_COLUMN = "address";
  const EMAIL_COLUMN = "email";

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_GLO_APP_USERS_SHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!,
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];

  const row = {
    [CREATEDAT_COLUMN]: user.createdAt.toDateString()!,
    [ADDRESS_COLUMN]: user.address!,
    [EMAIL_COLUMN]: user.email!,
  };
  await sheet.addRow(row);
};
