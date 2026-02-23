import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Validation schema for updating settings
const updateSettingSchema = z.object({
  value: z.string().min(1, "Value is required"),
  description: z.string().optional(),
  dataType: z.enum(["string", "number", "boolean", "json"]).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: settingKey } = await params;
    const session = await getServerSession(authOptions);
    
    const setting = await prisma.setting.findUnique({
      where: { key: settingKey },
    });
    
    if (!setting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }
    
    // Check if user can access this setting
    if (!setting.isPublic && !session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      id: setting.id,
      key: setting.key,
      value: setting.value,
      category: setting.category,
      description: setting.description,
      dataType: setting.dataType,
      isPublic: setting.isPublic,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching setting:", error);
    return NextResponse.json(
      { error: "Failed to fetch setting" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: settingKey } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const validatedData = updateSettingSchema.parse(body);
    
    // Check if setting exists
    const existingSetting = await prisma.setting.findUnique({
      where: { key: settingKey },
    });
    
    if (!existingSetting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }
    
    // Update setting
    const updatedSetting = await prisma.setting.update({
      where: { key: settingKey },
      data: validatedData,
    });
    
    return NextResponse.json({
      message: "Setting updated successfully",
      setting: {
        id: updatedSetting.id,
        key: updatedSetting.key,
        value: updatedSetting.value,
        category: updatedSetting.category,
        dataType: updatedSetting.dataType,
        isPublic: updatedSetting.isPublic,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: settingKey } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if setting exists
    const existingSetting = await prisma.setting.findUnique({
      where: { key: settingKey },
    });
    
    if (!existingSetting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }
    
    // Delete setting
    await prisma.setting.delete({
      where: { key: settingKey },
    });
    
    return NextResponse.json({
      message: "Setting deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting setting:", error);
    return NextResponse.json(
      { error: "Failed to delete setting" },
      { status: 500 }
    );
  }
} 