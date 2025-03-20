import { NextResponse } from "next/server";
import { getDatabase } from "@/database/database";
export async function GET() {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM devices").all();
    db.close();
    return NextResponse.json({ devices: rows });
}

export async function PATCH(request:Request) {
    const db = getDatabase();
    const { name, location, valveStatus, devEui } = await request.json();
    db.prepare("UPDATE devices SET name = ?, location = ?, valveStatus = ? WHERE devEui = ?").run(name, location, valveStatus, devEui);
    db.close();
    return NextResponse.json({ success: true });
}

export async function DELETE(request:Request) {
    const db = getDatabase();
    const { devEui } = await request.json();
    db.prepare("DELETE FROM devices WHERE devEui = ?").run(devEui);
    db.close();
    return NextResponse.json({ success: true });
}