'use client';

import { FC } from 'react';
import Link from 'next/link';

export const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  const linkClass =
    'text-white/85 hover:text-white hover:underline underline-offset-4 transition-all duration-300';

  return (
    <footer className="bg-[#92251C] text-white">

      <div className="mx-auto w-full max-w-[1280px] lg:max-w-[1400px] xl:max-w-[1500px] 2xl:max-w-[1650px] px-6 md:px-8">

        {/*  TOP FOOTER  */}
        <div className="py-14 md:py-16">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 xl:gap-16">

            {/*  BRAND  */}
            <div>

              <div className="flex items-center gap-3 mb-5">

                <div className="w-12 h-12 flex-shrink-0">
                  <img
                    src="/logo.png"
                    alt="Al Arafa Restaurant"
                    width={48}
                    height={48}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                <h3 className="text-xl font-bold text-white">
                  Al Arafa Restaurant
                </h3>

              </div>

              <p className="max-w-xs text-sm leading-6 text-white/75">
                Authentic South Indian cuisine,
                made with passion.
              </p>

              <Link
                href="/menu"
                className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-white hover:underline underline-offset-4 transition-all duration-300"
              >
                <i className="fa-solid fa-utensils text-xs" />
                View Menu
              </Link>

            </div>


            {/*  QUICK LINKS  */}
            <div>

              <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-white">
                Quick Links
              </h4>

              <ul className="space-y-3 text-sm">

                <li>
                  <Link href="/" className={linkClass}>
                    Home
                  </Link>
                </li>

                <li>
                  <Link href="/menu" className={linkClass}>
                    Menu
                  </Link>
                </li>

                <li>
                  <Link href="/about" className={linkClass}>
                    About
                  </Link>
                </li>

                <li>
                  <Link href="/contact" className={linkClass}>
                    Contact
                  </Link>
                </li>

              </ul>

            </div>


            {/*  VISIT US  */}
            <div>

              <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-white">
                Visit Us
              </h4>

              <div className="space-y-4 text-sm">

                {/* Address */}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=218B+Changi+Rd+Singapore+419737"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-start gap-3 ${linkClass}`}
                >
                  <i className="fa-solid fa-location-dot mt-1 flex-shrink-0 text-white" />

                  <span className="leading-5">
                    218B Changi Rd,
                    <br />
                    Singapore 419737
                  </span>
                </a>


                {/* Phone */}
                <a
                  href="tel:+6589896289"
                  className={`flex items-center gap-3 ${linkClass}`}
                >
                  <i className="fa-solid fa-phone flex-shrink-0 text-white" />
                  <span>+65 8989 6289</span>
                </a>


                {/* Email */}
                <a
                  href="mailto:salemrrbiryanisg@gmail.com"
                  className={`flex items-center gap-3 ${linkClass}`}
                >
                  <i className="fa-solid fa-envelope flex-shrink-0 text-white" />
                  <span>Email Us</span>
                </a>

              </div>

            </div>


            {/*  FOLLOW US  */}
            <div>

              <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-white">
                Follow Us
              </h4>

              <div className="space-y-4">

                {/* Instagram */}
                <a
                  href="https://instagram.com/salemrrbiryanisg"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className={`flex items-center gap-3 text-sm ${linkClass}`}
                >
                  <i className="fa-brands fa-instagram w-4 text-base text-white" />
                  <span>Instagram</span>
                </a>


                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/18xAjy5E9s/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className={`flex items-center gap-3 text-sm ${linkClass}`}
                >
                  <i className="fa-brands fa-facebook-f w-4 text-base text-white" />
                  <span>Facebook</span>
                </a>


                {/* WhatsApp */}
                <a
                  href="https://wa.me/6589896289"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className={`flex items-center gap-3 text-sm ${linkClass}`}
                >
                  <i className="fa-brands fa-whatsapp w-4 text-base text-white" />
                  <span>WhatsApp</span>
                </a>


                {/* X */}
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className={`flex items-center gap-3 text-sm ${linkClass}`}
                >
                  <i className="fa-brands fa-x-twitter w-4 text-base text-white" />
                  <span>X</span>
                </a>

              </div>

            </div>

          </div>

        </div>


        {/*  TRUST STRIP  */}
        <div className="border-t border-white/20 border-b border-white/20 py-5">

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-10 gap-y-4 text-sm">

            <div className="flex items-center gap-2">
              <span className="text-white text-base">★</span>

              <span className="text-white/85">
                <strong className="text-white">4.8</strong>{' '}
                Google Rating
              </span>
            </div>


            <div className="flex items-center gap-2">
              <span className="text-white text-base">♥</span>

              <span className="text-white/85">
                <strong className="text-white">50K+</strong>{' '}
                Customers
              </span>
            </div>


            <div className="flex items-center gap-2">
              <span className="text-white text-base">✦</span>

              <span className="text-white/85">
                <strong className="text-white">Al-Arafa restaurant</strong>{' '}
              
              </span>
            </div>

          </div>

        </div>


        {/*  BOTTOM BAR  */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">

          <p className="text-white/65">
            © {currentYear} Al Arafa Restaurant. All rights reserved.
          </p>


          <div className="flex items-center gap-5">

            <Link
              href="/contact"
              className={linkClass}
            >
              Privacy
            </Link>

            <span className="text-white/40">
              •
            </span>

            <Link
              href="/contact"
              className={linkClass}
            >
              Terms
            </Link>

          </div>


          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
            className="text-white/85 hover:text-white hover:underline underline-offset-4 transition-all duration-300"
          >
            Go To Top
          </button>

        </div>

      </div>

    </footer>
  );
};