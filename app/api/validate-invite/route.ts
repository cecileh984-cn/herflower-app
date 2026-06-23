import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { inviteCode } = await request.json();
  const configuredCodes = process.env.HERFLOWER_INVITE_CODES;

  if (!configuredCodes) {
    return NextResponse.json(
      { ok: false, error: "Invite codes are not configured yet." },
      { status: 500 }
    );
  }

  const normalizedInput = String(inviteCode ?? "").trim().toLowerCase();
  const validCodes = configuredCodes
    .split(",")
    .map((code) => code.trim().toLowerCase())
    .filter(Boolean);

  if (!normalizedInput || !validCodes.includes(normalizedInput)) {
    return NextResponse.json(
      { ok: false, error: "This invite code is not valid." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
