import { pool } from "./pool";

//create donation table if not there
const createDonationTable = async () => {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS donation(name text, number text PRIMARY KEY, amount integer);"
  );
};

export const getDonation = async () => {
  await createDonationTable();
  let result = await pool.query("select * from donation ORDER BY amount DESC;");
  if (result.rowCount) {
    return result.rows;
  } else {
    return [];
  }
};

export const addDonation = async (
  name: string,
  number: number,
  amount: number
) => {
  try {
    await createDonationTable();
    await pool.query("INSERT INTO donation VALUES($1,$2,$3);", [
      name,
      number,
      amount,
    ]);

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};