import React from "react";

export default function ServicesPage() {
  const services = [
    {
      title: "Network Security",
      desc: "Next-gen firewall, endpoint security, ransomware defense, and compliance monitoring.",
      icon: "🛡️",
    },
    {
      title: "Cloud Solutions",
      desc: "Migrate and manage your business on secure, scalable cloud platforms.",
      icon: "☁️",
    },
    {
      title: "IT Consulting",
      desc: "Infrastructure planning, remote work strategy, scaling, and compliance.",
      icon: "💡",
    },
    {
      title: "Device Management",
      desc: "Remote monitoring and support for every workstation, server, and mobile device.",
      icon: "💻",
    },
    {
      title: "Disaster Recovery",
      desc: "Automated backups, offsite recovery, and business continuity.",
      icon: "🌀",
    },
    {
      title: "Smart Home Setup",
      desc: "WiFi, security cameras, automation, and support for homeowners.",
      icon: "🏡",
    },
  ];
  return (
    <div className="py-20 px-6 md:px-0 max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blaize-green via-blaize-yellow to-blaize-orange text-transparent bg-clip-text">
        Services
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {services.map((s, i) => (
          <div key={i} className="bg-zinc-900 rounded-xl p-6 border border-blaize-green/30 shadow-glow hover:scale-105 hover:border-blaize-yellow transition-transform">
            <div className="text-4xl mb-4">{s.icon}</div>
            <h3 className="text-2xl font-semibold mb-2 text-blaize-green">{s.title}</h3>
            <p className="text-white/80">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
