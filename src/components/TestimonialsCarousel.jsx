import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const testimonials = [
  {
    quote: "BLAiZE IT made our office network rock-solid. Fast, honest, and reliable service every time.",
    name: "A. Taylor",
    title: "Office Manager, ABC Legal",
  },
  {
    quote: "Helped secure our business and migrated us to the cloud with zero hassle.",
    name: "S. Rogers",
    title: "Owner, Rogers Home Improvement",
  },
  {
    quote: "I can finally relax knowing our IT is handled by true pros.",
    name: "M. Lee",
    title: "Small Business Owner",
  },
];

export default function TestimonialsCarousel() {
  return (
    <section className="py-20 bg-[#232332]">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-gradient-to-r from-blaize-green to-blaize-orange bg-clip-text text-transparent">
        What Our Clients Say
      </h2>
      <Swiper
        slidesPerView={1}
        spaceBetween={32}
        breakpoints={{
          640: { slidesPerView: 1.1 },
          1024: { slidesPerView: 2 },
        }}
        className="max-w-5xl mx-auto"
        loop
        autoplay
      >
        {testimonials.map((t, i) => (
          <SwiperSlide key={i}>
            <div className="bg-blaize-dark rounded-2xl shadow-lg p-8 m-2 flex flex-col items-center">
              <p className="text-lg md:text-xl italic text-white mb-6">&ldquo;{t.quote}&rdquo;</p>
              <span className="font-bold text-blaize-orange">{t.name}</span>
              <span className="text-sm text-white/60">{t.title}</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
