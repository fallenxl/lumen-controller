import Database from "better-sqlite3";

export const getDatabase = () => {
  return new Database("../database/data.db", { verbose: console.log });
}