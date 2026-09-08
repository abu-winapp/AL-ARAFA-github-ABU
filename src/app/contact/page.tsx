
/**
 * Contact Us Page
 * Al Arafa Cuisine
 */

import type { Metadata } from "next";
import {
  MapPin,
  Phone,
  Mail,
  Clock3,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us - Al Arafa Cuisine",
  description:
    "Contact Al Arafa Cuisine in Singapore for reservations, enquiries, dining and catering.",
};

const ContactHero = "/images/contactushero.png";

const RESTAURANT = {
  name: "Al Arafa Cuisine",
  address: "218B Changi Rd, Singapore 419737",
  phone: "+65 XXXX XXXX",
  email: "info@alarafacuisine.com",

  hours: [
    { day: "Monday – Thursday", time: "11:00 AM – 11:00 PM" },
    { day: "Friday – Saturday", time: "11:00 AM – 12:00 AM" },
    { day: "Sunday", time: "11:00 AM – 11:00 PM" },
  ],
};

const FAQS = [
  {
    question: "Do I need to make a reservation?",
    answer:
      "Reservations are recommended, especially during weekends and peak dining hours. Please contact our team to check availability.",
  },
  {
    question: "Do you accommodate large groups?",
    answer:
      "Yes. We welcome family gatherings, celebrations and larger groups. Please contact us in advance so we can arrange your dining experience.",
  },
  {
    question: "Do you provide catering?",
    answer:
      "We offer catering options for selected occasions and events. Contact our team to discuss your requirements.",
  },
  {
    question: "Do you accommodate dietary requirements?",
    answer:
      "Please let our team know about your dietary requirements when making your enquiry, and we will do our best to assist.",
  },
  {
    question: "Where are you located?",
    answer:
      "We are located at 218B Changi Rd, Singapore 419737.",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#211716]">

      {/* 
          HERO
       */}

      <section className="relative overflow-hidden bg-[#4d0907] text-white">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${ContactHero})`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#430705]/95 via-[#650b08]/80 to-[#74100c]/25" />

        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#4d0907]/80 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[400px] w-full max-w-[1650px] items-center px-5 sm:px-6 lg:px-8">

          <div className="max-w-[680px] py-16">

            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#f4d27a] sm:text-sm">
              Al-Arafa Restaurant
            </p>

            <h1 className="text-5xl font-extrabold text-[#ffffff] leading-[0.95] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-[76px]">
              Contact Us
            </h1>



            <p className="mt-7 max-w-[560px] text-justify text-base leading-8 text-white/85 sm:text-lg">
              Whether you are planning a family dinner, a special celebration,
              or simply looking for a memorable meal, we would love to hear
              from you.
            </p>

          </div>
        </div>

        {/* Curved transition */}

        <div className="absolute -bottom-1 left-0 right-0 z-20">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="block h-[70px] w-full sm:h-[85px] md:h-[100px]"
            aria-hidden="true"
          >
            <path
              d="
                M0,45
                C180,110 360,115 540,105
                C760,92 890,55 1080,35
                C1230,18 1340,18 1440,0
                L1440,120
                L0,120
                Z
              "
              fill="#faf7f2"
            />
          </svg>
        </div>

      </section>


      {/* 
          CONTACT + FORM
       */}

      <section className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">

        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">

          {/* LEFT SIDE */}

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8c1712]">
              Get In Touch
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#3f0806] sm:text-5xl">
              We’re here to welcome you.
            </h2>

            <p className="mt-6 max-w-xl text-justify text-base leading-8 text-gray-600">
              Have a question about dining with us, planning a celebration,
              or arranging catering? Our team is happy to assist you.
            </p>


            {/* Contact details */}

            <div className="mt-10 space-y-7">

              <div className="flex gap-5">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#e5c77c]/60 bg-[#fffdf9]">
                  <MapPin className="h-5 w-5 text-[#8c1712]" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Visit Us
                  </p>

                  <p className="mt-1 text-base font-medium text-gray-900">
                    {RESTAURANT.address}
                  </p>
                </div>

              </div>


              <div className="flex gap-5">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#e5c77c]/60 bg-[#fffdf9]">
                  <Phone className="h-5 w-5 text-[#8c1712]" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Reservations
                  </p>

                  <p className="mt-1 text-base font-medium text-gray-900">
                    {RESTAURANT.phone}
                  </p>
                </div>

              </div>


              <div className="flex gap-5">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#e5c77c]/60 bg-[#fffdf9]">
                  <Mail className="h-5 w-5 text-[#8c1712]" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Email
                  </p>

                  <p className="mt-1 text-base font-medium text-gray-900">
                    {RESTAURANT.email}
                  </p>
                </div>

              </div>

            </div>


            {/* Opening hours */}

            <div className="mt-12 border-t border-[#ded7ce] pt-8">

              <div className="flex items-center gap-3">

                <Clock3 className="h-5 w-5 text-[#8c1712]" />

                <h3 className="text-lg font-semibold text-[#3f0806]">
                  Opening Hours
                </h3>

              </div>

              <div className="mt-5 space-y-3">

                {RESTAURANT.hours.map((item) => (
                  <div
                    key={item.day}
                    className="flex max-w-md justify-between gap-5 border-b border-[#e8e1d8] pb-3 text-sm"
                  >
                    <span className="text-gray-600">
                      {item.day}
                    </span>

                    <span className="font-medium text-gray-900">
                      {item.time}
                    </span>
                  </div>
                ))}

              </div>

            </div>

          </div>


          {/* RIGHT SIDE — FORM */}

          <div className="border border-[#e2d9ce] bg-white p-6 shadow-[0_20px_60px_rgba(60,20,10,0.06)] sm:p-9 lg:p-12">

            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8c1712]">
              Send An Enquiry
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#3f0806] sm:text-4xl">
              Let’s make your visit special.
            </h2>

            <p className="mt-4 text-justify text-sm leading-7 text-gray-500">
              Tell us a little about your enquiry and our team will get back
              to you.
            </p>


            <form className="mt-9 space-y-6">

              <div className="grid gap-6 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Your name"
                    className="h-12 w-full border border-gray-200 bg-[#fcfaf7] px-4 text-sm outline-none transition focus:border-[#8c1712]"
                  />
                </div>


                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Phone
                  </label>

                  <input
                    type="tel"
                    placeholder="Your phone number"
                    className="h-12 w-full border border-gray-200 bg-[#fcfaf7] px-4 text-sm outline-none transition focus:border-[#8c1712]"
                  />
                </div>

              </div>


              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 w-full border border-gray-200 bg-[#fcfaf7] px-4 text-sm outline-none transition focus:border-[#8c1712]"
                />
              </div>


              <div className="grid gap-6 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Preferred Date
                  </label>

                  <input
                    type="date"
                    className="h-12 w-full border border-gray-200 bg-[#fcfaf7] px-4 text-sm outline-none transition focus:border-[#8c1712]"
                  />
                </div>


                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Number of Guests
                  </label>

                  <select
                    className="h-12 w-full border border-gray-200 bg-[#fcfaf7] px-4 text-sm outline-none transition focus:border-[#8c1712]"
                  >
                    <option>Select guests</option>
                    <option>1 – 2</option>
                    <option>3 – 5</option>
                    <option>6 – 10</option>
                    <option>10+</option>
                  </select>
                </div>

              </div>


              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Enquiry Type
                </label>

                <select
                  className="h-12 w-full border border-gray-200 bg-[#fcfaf7] px-4 text-sm outline-none transition focus:border-[#8c1712]"
                >
                  <option>Select enquiry type</option>
                  <option>Table Reservation</option>
                  <option>Private Dining</option>
                  <option>Catering</option>
                  <option>Celebration</option>
                  <option>General Enquiry</option>
                </select>
              </div>


              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Message
                </label>

                <textarea
                  rows={5}
                  placeholder="Tell us how we can assist you..."
                  className="w-full resize-none border border-gray-200 bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#8c1712]"
                />
              </div>


              <button
                type="submit"
                className="group flex h-13 w-full items-center justify-center gap-3 bg-[#4d0907] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#650b08]"
              >
                Send Enquiry

                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>

            </form>

          </div>

        </div>

      </section>


      {/* 
          FIND US
       */}

      <section className="border-y border-[#e5ddd3] bg-[#f3eee7]">

        <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">

          {/* Map */}

          <div className="min-h-[400px] bg-[#ddd8d0]">

            {/* Replace this with Google Maps / Mapbox */}

            <iframe
              title="Al Arafa Cuisine Location"
              src="https://www.google.com/maps?q=218B%20Changi%20Rd,%20Singapore%20419737&output=embed"
              className="h-full min-h-[400px] w-full border-0 grayscale-[25%]"
              loading="lazy"
            />

          </div>


          {/* Location content */}

          <div className="flex items-center px-6 py-16 sm:px-10 lg:px-16">

            <div className="max-w-lg">

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8c1712]">
                Find Us
              </p>

              <h2 className="mt-4 text-4xl font-bold text-[#3f0806] sm:text-5xl">
                Come dine with us.
              </h2>

              <p className="mt-6 text-justify text-base leading-8 text-gray-600">
                Located on Changi Road, Al Arafa Cuisine brings together
                Arabian, North Indian and South Indian flavours in a warm
                dining environment.
              </p>

              <div className="mt-8 flex items-start gap-4">

                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#8c1712]" />

                <p className="font-medium leading-7 text-gray-900">
                  {RESTAURANT.address}
                </p>

              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=218B+Changi+Rd+Singapore+419737"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex items-center gap-2 border-b border-[#8c1712] pb-1 text-sm font-semibold uppercase tracking-[0.14em] text-[#8c1712]"
              >
                Get Directions

                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* 
          PRIVATE DINING / CATERING
       */}

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">

        <div className="relative overflow-hidden bg-[#4d0907] px-7 py-16 text-center text-white sm:px-12 lg:px-20 lg:py-20">

          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full border border-[#e9bd5b]/20" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full border border-[#e9bd5b]/10" />

          <div className="relative z-10 mx-auto max-w-3xl">

            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f4d27a]">
              Special Occasions
            </p>

            <h2 className="mt-4 text-4xl text-[#ffffff] font-bold sm:text-5xl">
              Planning something special?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-justify text-base leading-8 text-white/75">
              From family celebrations to private gatherings and catering,
              let us help create an experience your guests will remember.
            </p>

            <a
              href="#enquiry"
              className="mt-8 inline-flex items-center gap-3 border border-[#e9bd5b] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-[#f4d27a] transition hover:bg-[#e9bd5b] hover:text-[#4d0907]"
            >
              Make An Enquiry
              <ArrowUpRight className="h-4 w-4" />
            </a>

          </div>

        </div>

      </section>


      {/* 
          FAQ
       */}

      <section className="mx-auto max-w-[1000px] px-5 pb-20 sm:px-6 lg:pb-28">

        <div className="text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8c1712]">
            Good To Know
          </p>

          <h2 className="mt-4 text-4xl font-bold text-[#3f0806] sm:text-5xl">
            Frequently Asked Questions
          </h2>

        </div>


        <div className="mt-12 border-t border-[#ded7ce]">

          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group border-b border-[#ded7ce]"
            >

              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-base font-semibold text-[#3f0806] sm:text-lg">

                {faq.question}

                <ChevronDown className="h-5 w-5 shrink-0 text-[#8c1712] transition-transform group-open:rotate-180" />

              </summary>

              <p className="max-w-3xl pb-6 pr-10 text-justify text-sm leading-7 text-gray-600">
                {faq.answer}
              </p>

            </details>
          ))}

        </div>

      </section>


      {/* 
          FINAL CTA
       */}

      <section className="bg-[#3b0705] px-5 py-20 text-center text-white">

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f4d27a]">
          Al-Arafa Cuisine
        </p>

        <h2 className="mt-4 text-[#ffffff] text-4xl font-bold sm:text-5xl">
          Your table awaits.
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-justify text-base leading-8 text-white/70">
          Gather your loved ones and discover the flavours of Arabian,
          North Indian and South Indian cuisine.
        </p>

        <a
          href={`tel:${RESTAURANT.phone}`}
          className="mt-8 inline-flex items-center gap-3 bg-[#e9bd5b] px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#3b0705] transition hover:bg-[#f4d27a]"
        >
          Call For Reservations
          <Phone className="h-4 w-4" />
        </a>

      </section>

    </main>
  );
}
