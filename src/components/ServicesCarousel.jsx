import React, { useEffect, useState } from "react";
import "swiper/css";

const services = [
  { title: "Managed IT Services", desc: "Comprehensive, proactive support for small business and home.", icon: "💼" },
  { title: "Cybersecurity", desc: "Protect your data with next-gen threat prevention and response.", icon: "🛡️" },
  { title: "Cloud Migrations", desc: "Move seamlessly to the cloud (Microsoft 365, Google, AWS).", icon: "☁️" },
  { title: "Smart Home & Networking", desc: "Setup, optimize, and secure your home or office network.", icon: "🏡" },
  { title: "IT Consulting", desc: "Get expert advice to scale, modernize, and secure your tech.", icon: "💡" },
];

export default function ServicesCarousel() {
  const [SwiperComp, setSwiper] = useState(null);
  const [SwiperSlideComp, setSwiperSlide] = useState(null);
  const [motion, setMotion] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([import("swiper/react"), import("framer-motion")]).then(([swiper, framer]) => {
      // ESM/CJS interop: use .default if present
      const SwiperModule = swiper?.Swiper ? swiper : swiper.default ?? swiper;
      if (mounted) {
        setSwiper(() => SwiperModule.Swiper);
        setSwiperSlide(() => SwiperModule.SwiperSlide);
        setMotion(() => framer.motion);
      }
    });
    return () => { mounted = false; };
  }, []);

  if (!SwiperComp || !SwiperSlideComp || !motion) return null;
  const Swiper = SwiperComp;
  const SwiperSlide = SwiperSlideComp;

  return (
    <section className="relative py-20 bg-[#1d1d22]">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        <span className="bg-gradient-to-r from-blaize-green to-blaize-orange bg-clip-text text-transparent">
          What We Do Best
        </span>
      </h2>
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        breakpoints={{
          640: { slidesPerView: 1.2 },
          1024: { slidesPerView: 2.5 },
        }}
        className="max-w-5xl mx-auto"
      >
        {services.map((service, i) => (
          <SwiperSlide key={service.title}>
            <motion.div
              className="bg-[#232332] rounded-2xl shadow-xl p-8 m-2 flex flex-col items-center hover:scale-105 transition-transform"
              whileHover={{ y: -8, boxShadow: "0 16px 40px 0 #2167d155" }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.7, type: "spring" }}
              viewport={{ once: true }}
            >
              <span className="text-5xl mb-5">{service.icon}</span>
              <h3 className="text-xl font-bold mb-2 text-blaize-orange">{service.title}</h3>
              <p className="text-white/80">{service.desc}</p>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
