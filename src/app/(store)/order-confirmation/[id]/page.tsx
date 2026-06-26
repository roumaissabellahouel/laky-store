import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      orderNumber: true, total: true, firstName: true,
      items: { select: { productName: true, quantity: true, price: true } },
    },
  }).catch(() => null);

  const displayNumber = order?.orderNumber ?? `#${id.slice(-8).toUpperCase()}`;
  const total = order ? Number(order.total) : null;

  return (
    <div className="bg-[#FAF6F1] min-h-screen flex items-center justify-center px-5 py-16">
      <div className="max-w-[520px] w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(201,168,108,0.12)] border border-[rgba(201,168,108,0.30)] flex items-center justify-center mx-auto mb-8">
          <span className="text-[28px] text-[#C9A86C]">✦</span>
        </div>

        <h1 className="font-display font-medium text-[#1A1714] text-[2.5rem] md:text-[3rem] tracking-[-0.03em] leading-[1.1] mb-4">
          Commande confirmée.
        </h1>

        <p className="text-[14px] md:text-[15px] font-sans font-light text-[#7A6E66] leading-[1.75] mb-8">
          Merci pour votre commande ! Notre équipe la traitera dans les plus brefs
          délais. Vous serez contactée par téléphone pour confirmer la livraison.
        </p>

        <div className="bg-white rounded-lg border border-[#E8E0D6] p-6 mb-8 text-left" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.06)" }}>
          <span className="text-label text-[#7A6E66]">Numéro de commande</span>
          <p className="font-display italic text-[1.3rem] text-[#1A1714] font-normal mt-1">
            {displayNumber}
          </p>

          {order && order.items.length > 0 && (
            <div className="mt-5 pt-5 border-t border-[#E8E0D6] space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-[13px] font-sans">
                  <span className="text-[#7A6E66]">{item.productName} × {item.quantity}</span>
                  <span className="text-[#1A1714]">{(Number(item.price) * item.quantity).toLocaleString("fr-DZ")} DZD</span>
                </div>
              ))}
              {total !== null && (
                <div className="flex justify-between text-[13px] font-sans font-medium pt-2 border-t border-[#E8E0D6]">
                  <span className="text-[#1A1714]">Total</span>
                  <span className="font-display italic text-[15px] text-[#1A1714]">{total.toLocaleString("fr-DZ")} DZD</span>
                </div>
              )}
            </div>
          )}

          <p className="mt-4 text-[13px] font-sans font-light text-[#7A6E66]">
            Notez ce numéro pour suivre votre commande.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/track"
            className="flex-1 h-[48px] rounded-full bg-[#1A1714] text-[#FAF6F1] flex items-center justify-center text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all duration-200"
          >
            Suivre ma commande
          </Link>
          <Link
            href="/"
            className="flex-1 h-[48px] rounded-full border border-[#E8E0D6] text-[#1A1714] flex items-center justify-center text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:border-[#C9A86C] hover:text-[#C9A86C] transition-all duration-200"
          >
            Retour boutique
          </Link>
        </div>

        <a
          href="https://wa.me/213552049798"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 text-[13px] font-sans font-light text-[#7A6E66] hover:text-[#C9A86C] transition-colors"
        >
          📱 Besoin d&apos;aide ? Contactez-nous sur WhatsApp
        </a>
      </div>
    </div>
  );
}
