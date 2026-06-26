import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    });
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { storeName, phone1, phone2, instagram } = await req.json();
    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", storeName, phone1, phone2, instagram },
      update: { storeName, phone1, phone2, instagram },
    });
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
