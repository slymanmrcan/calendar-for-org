import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Dosya bulunamadı" },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (örn: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Dosya boyutu 5MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü (MIME type)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Sadece resim dosyaları yüklenebilir" },
        { status: 400 }
      );
    }

    // Ekstra Güvenlik: Dosya uzantısı kontrolü
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return NextResponse.json(
            { success: false, message: "Geçersiz dosya uzantısı. Sadece .jpg, .png, .webp, .gif yüklenebilir." },
            { status: 400 }
        );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dosya ismini güvenli hale getir ve timestamp ekle
    // Türkçe karakterleri ve boşlukları temizle
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.]/g, "_")
      .toLowerCase();
    const filename = `${Date.now()}-${safeName}`;

    // public/uploads klasörüne kaydet
    // Docker içinde /app/public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, buffer);

    // URL döndür
    const url = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Dosya yüklenemedi" },
      { status: 500 }
    );
  }
}
