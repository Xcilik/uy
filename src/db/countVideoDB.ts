import pool from "./pool";

// create createCountVideoTable table if not there
const createCountVideoTable = async () => {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS countvideo(memberjid text , groupjid text, count integer, PRIMARY KEY (memberjid, groupjid));"
  );
};

export interface GetCountVideo {
  memberjid: string;
  count: number;
  name: string;
}

export const getCountVideo = async (
  groupjid: string
): Promise<GetCountVideo[]> => {
  try {
    const result = await pool.query(
      "SELECT cv.memberjid,cv.count,cmn.name FROM countvideo cv LEFT JOIN countmembername cmn ON cv.memberjid=cmn.memberjid WHERE groupjid=$1 ORDER BY count DESC;",
      [groupjid]
    );
    if (result.rowCount) {
      return result.rows;
    }
    return [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const setCountVideo = async (
  memberjid: string,
  groupjid: string
): Promise<boolean> => {
  if (!groupjid.endsWith("@g.us")) return false;

  try {
    const res = await pool.query(
      "UPDATE countvideo SET count = count+1 WHERE memberjid=$1 AND groupjid=$2;",
      [memberjid, groupjid]
    );

    // not updated. time to insert
    if (res.rowCount === 0) {
      await pool.query("INSERT INTO countvideo VALUES($1,$2,$3);", [
        memberjid,
        groupjid,
        1,
      ]);
    }
    return true;
  } catch (err) {
    console.log(err);
    await createCountVideoTable();
    return false;
  }
};

// module.exports.setCountVideo = async (memberjid, groupjid) => {
//   if (!groupjid.endsWith("@g.us")) return;
//   let result;
//   try {
//     result = await pool.query(
//       "select * from countvideo WHERE memberjid=$1 AND groupjid=$2;",
//       [memberjid, groupjid]
//     );
//   } catch (err) {
//     await createCountVideoTable();
//     result = await pool.query(
//       "select * from countvideo WHERE memberjid=$1 AND groupjid=$2;",
//       [memberjid, groupjid]
//     );
//   }

//   //present
//   if (result.rows.length) {
//     let count = result.rows[0].count;

//     await pool.query(
//       "UPDATE countvideo SET count = count+1 WHERE memberjid=$1 AND groupjid=$2;",
//       [memberjid, groupjid]
//     );
//
//     return count + 1;
//   } else {
//     await pool.query("INSERT INTO countvideo VALUES($1,$2,$3);", [
//       memberjid,
//       groupjid,
//       1,
//     ]);
//
//     return 1;
//   }
// };