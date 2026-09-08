"use client";

import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Sparkles, Users, Calendar, Phone, MessageCircle } from "lucide-react";
import { PartyHallForm } from "@/components/party-hall/PartyHallForm";

// Contact information
const CONTACT_INFO = {
  phone: "+65 8989 8088",
  whatsapp: "+65 8989 8088",
};

export default function PartyHallPage() {
  const handleCall = () => {
    window.location.href = `tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`;
  };

  const handleWhatsApp = () => {
    const whatsappNumber = CONTACT_INFO.whatsapp
      .replace(/\s/g, "")
      .replace("+", "");
    const message = encodeURIComponent(
      "Hi, I would like to inquire about booking the party hall.",
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-6">
        <div
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Party Hall
          </h1>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
        <div className=" space-y-6 py-8">
          <Card className="  from-white to-primary/5">
            {/* bg-gradient-to-br */}
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Make a Reservation for Your Special Event
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Al Arafa Restaurant is proud to offer a beautiful party hall for
                  your special occasions.{" "}
                </p>
              </div>
              <PartyHallForm
                onNext={() => {
                  // Handle next action (e.g., navigate to a confirmation page)
                }}
                onSkip={() => {
                  // Handle skip action (e.g., navigate to the main menu)
                }}
              />
            </CardContent>
          </Card>

          {/* Coming Soon Banner */}
          {/* <Card className="border-primary/20 bg-gradient-to-br from-white to-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Coming Soon!
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  We're excited to announce that Al Arafa Restaurant will soon be
                  offering a beautiful party hall for your special occasions.
                  Perfect for celebrations, gatherings, and memorable events
                  with authentic South Indian cuisine.
                </p>
              </div>
            </CardContent>
          </Card> */}

          {/* What to Expect Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">What to Expect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Spacious Venue */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Spacious Venue
                  </h3>
                  <p className="text-sm text-gray-600">
                    A comfortable space designed to accommodate your guests and
                    create lasting memories
                  </p>
                </div>

                {/* Flexible Booking */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Flexible Booking
                  </h3>
                  <p className="text-sm text-gray-600">
                    Convenient booking options to suit your event schedule and
                    requirements
                  </p>
                </div>

                {/* Complete Catering */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Complete Catering
                  </h3>
                  <p className="text-sm text-gray-600">
                    Our signature biryanis and authentic South Indian delicacies
                    for your celebration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="max-w-4xl space-y-6 py-8">
          {/* Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Interested in Booking?</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Get in touch with us to learn more about our party hall and
                reserve your date
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {CONTACT_INFO.phone}
                    </p>
                    <Button
                      onClick={handleCall}
                      variant="outline"
                      size="sm"
                      className="text-primary border-primary hover:bg-primary hover:text-white"
                    >
                      Call Now
                    </Button>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#25D366]/50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366]/10">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      WhatsApp
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {CONTACT_INFO.whatsapp}
                    </p>
                    <Button
                      onClick={handleWhatsApp}
                      variant="outline"
                      size="sm"
                      className="text-[#25D366] border-[#25D366] hover:bg-[#25D366] hover:text-white"
                    >
                      Chat on WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
