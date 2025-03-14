import Database from "better-sqlite3";

export const GET = async () => {
    const db = new Database("../database/data.db");
    const rows = db.prepare("SELECT * FROM telemetry").all();
    db.close();

    return new Response(JSON.stringify(rows), {
        headers: { "Content-Type": "application/json" },
    });
};
