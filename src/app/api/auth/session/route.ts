import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
    const session = await getSession();
    return NextResponse.json(session, {
        headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
    });
}
