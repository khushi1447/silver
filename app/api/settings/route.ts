import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getAdminPayload } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const settingSchema = z.object({
  category: z.string().min(1),
  key: z.string().min(1),
  value: z.string(),
  description: z.string().optional(),
  dataType: z.enum(["string", "number", "boolean", "json"]).default("string"),
  isPublic: z.boolean().default(false),
});

const bulkUpsertSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
      category: z.string().min(1),
      description: z.string().optional(),
      dataType: z.enum(["string", "number", "boolean", "json"]).default("string"),
      isPublic: z.boolean().default(false),
    })
  ),
});

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminPayload();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category) where.category = category;
    if (!admin) where.isPublic = true;

    const settings = await prisma.setting.findMany({
      where,
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    const grouped = settings.reduce((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push({
        id: s.id,
        key: s.key,
        value: s.value,
        description: s.description,
        dataType: s.dataType,
        isPublic: s.isPublic,
        updatedAt: s.updatedAt,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({ settings: grouped, categories: Object.keys(grouped) });
  } catch (err) {
    console.error("Settings GET error:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();

    // Bulk upsert
    if (body.settings) {
      const { settings } = bulkUpsertSchema.parse(body);
      const results = await Promise.all(
        settings.map((s) =>
          prisma.setting.upsert({
            where: { key: s.key },
            update: { value: s.value, description: s.description, dataType: s.dataType, isPublic: s.isPublic },
            create: { category: s.category, key: s.key, value: s.value, description: s.description, dataType: s.dataType, isPublic: s.isPublic },
          })
        )
      );
      return NextResponse.json({ message: "Settings saved", count: results.length });
    }

    // Single create
    const data = settingSchema.parse(body);
    const setting = await prisma.setting.upsert({
      where: { key: data.key },
      update: { value: data.value, description: data.description, dataType: data.dataType, isPublic: data.isPublic },
      create: { category: data.category, key: data.key, value: data.value, description: data.description, dataType: data.dataType, isPublic: data.isPublic },
    });

    return NextResponse.json({ message: "Setting saved", setting }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError)
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    console.error("Settings POST error:", err);
    return NextResponse.json({ error: "Failed to save setting" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { settings } = bulkUpsertSchema.parse(body);

    const results = await Promise.all(
      settings.map((s) =>
        prisma.setting.upsert({
          where: { key: s.key },
          update: { value: s.value, description: s.description, dataType: s.dataType, isPublic: s.isPublic },
          create: { category: s.category, key: s.key, value: s.value, description: s.description, dataType: s.dataType, isPublic: s.isPublic },
        })
      )
    );

    return NextResponse.json({ message: "Settings updated", count: results.length });
  } catch (err) {
    if (err instanceof z.ZodError)
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    console.error("Settings PUT error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
