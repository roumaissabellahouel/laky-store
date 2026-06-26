import StoreHeader from "@/components/layout/StoreHeader";
import StoreFooter from "@/components/layout/StoreFooter";
import { prisma } from "@/lib/prisma";

async function getNavCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      select: { name: true, slug: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getNavCategories();
  return (
    <>
      <StoreHeader categories={categories} />
      <main className="flex-1 pt-[68px] md:pt-[76px]">{children}</main>
      <StoreFooter />
    </>
  );
}
