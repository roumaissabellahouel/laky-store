import Link from "next/link";

export default function StoreFooter() {
  return (
    <footer className="bg-[#1A1714] text-[#FAF6F1] pt-16 pb-8">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <span className="font-display text-[22px] font-medium tracking-[-0.01em]">
                ✦ Laky
              </span>
              <span className="block font-display text-[10px] font-light tracking-[0.18em] uppercase text-[#7A6E66] mt-0.5">
                Accessoires
              </span>
            </div>
            <p className="text-[13px] font-sans font-light text-[#7A6E66] leading-[1.7] mt-4 max-w-[220px]">
              Bijoux en acier inoxydable, conçus pour durer. Livraison partout en Algérie.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://instagram.com/laky_accessoires"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7A6E66] hover:text-[#C9A86C] transition-colors text-[13px] font-sans"
              >
                Instagram
              </a>
              <span className="text-[#3A2820]">·</span>
              <a
                href="https://wa.me/213552049798"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7A6E66] hover:text-[#C9A86C] transition-colors text-[13px] font-sans"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h4 className="text-[11px] font-sans font-medium tracking-[0.14em] uppercase text-[#C9A86C] mb-5">
              Boutique
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Bagues", href: "/categories/bagues" },
                { label: "Colliers", href: "/categories/colliers" },
                { label: "Bracelets", href: "/categories/bracelets" },
                { label: "Boucles d'oreilles", href: "/categories/boucles-oreilles" },
                { label: "Nouveautés", href: "/categories/nouveautes" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] font-sans font-light text-[#7A6E66] hover:text-[#FAF6F1] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="text-[11px] font-sans font-medium tracking-[0.14em] uppercase text-[#C9A86C] mb-5">
              Aide
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/track" className="text-[13px] font-sans font-light text-[#7A6E66] hover:text-[#FAF6F1] transition-colors">
                  Suivi de commande
                </Link>
              </li>
              <li>
                <a href="https://wa.me/213552049798" target="_blank" rel="noopener noreferrer" className="text-[13px] font-sans font-light text-[#7A6E66] hover:text-[#FAF6F1] transition-colors">
                  Contact WhatsApp
                </a>
              </li>
              <li>
                <Link href="/search" className="text-[13px] font-sans font-light text-[#7A6E66] hover:text-[#FAF6F1] transition-colors">
                  Recherche
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-sans font-medium tracking-[0.14em] uppercase text-[#C9A86C] mb-5">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/213552049798"
                  className="text-[13px] font-sans font-light text-[#7A6E66] hover:text-[#FAF6F1] transition-colors"
                >
                  0552 049 798
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/213553207491"
                  className="text-[13px] font-sans font-light text-[#7A6E66] hover:text-[#FAF6F1] transition-colors"
                >
                  0553 207 491
                </a>
              </li>
              <li className="mt-4">
                <span className="text-[13px] font-sans font-light text-[#7A6E66]">
                  Algérie
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-[#3A2820] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] font-sans font-light text-[#4A3E38]">
            © {new Date().getFullYear()} Laky Accessoires · Tous droits réservés
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://wa.me/213552049798"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-sans font-light text-[#4A3E38] hover:text-[#7A6E66] transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="https://instagram.com/laky_accessoires"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-sans font-light text-[#4A3E38] hover:text-[#7A6E66] transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
