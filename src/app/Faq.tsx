"use client";



import { ChevronDown } from "lucide-react";

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
    answer: "We are located at 218B Changi Rd, Singapore 419737.",
  },
];

export default function Faq() {
  return (
    <>
      {/* 
          FAQ
       */}

      <section className="mx-auto bg-transparent max-w-[1000px] px-5 pb-20 sm:px-6 lg:pb-28">
        <div className="text-center">
          <p className="text-sm font-semibold mt-5 uppercase tracking-[0.22em] text-[#8c1712]">
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
    </>
  );
}
