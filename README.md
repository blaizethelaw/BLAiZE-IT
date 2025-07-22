# BLAiZE IT Solutions

BLAiZE IT Solutions provides managed IT services, cybersecurity consulting, cloud migration assistance and home networking support. This repository contains the single page website used to showcase the company's offerings.

## Features

- **React** front end styled with **Tailwind CSS**
- Animated sections using **Framer Motion**
- Service and testimonial carousels powered by **Swiper**
- Booking and contact forms via Formspree
- Progressive Web App setup with a service worker and `manifest.webmanifest`
- Immersive starfield background rendered on an HTML canvas
- Interactive 3D scene powered by **Three.js**
- Sleek custom cursor with trailing effect
- Animated holographic grid overlay for a high-tech vibe

## Getting Started

### Prerequisites
- Node.js 18 or newer
- npm

### Install dependencies
```bash
npm install
```

### Start the development server
```bash
npm run dev
```
The site will be available at `http://localhost:5173`.

### Build for production
```bash
npm run build
```
The compiled assets will be output to `dist/`. You can preview the build locally with:
```bash
npm run preview
```

## Folder Structure
```
blaize-it/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── public/
│   ├── blaize-logo.png
│   ├── manifest.webmanifest
│   └── sw.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── AboutSection.jsx
    │   ├── BookingButton.jsx
    │   ├── ContactSection.jsx
    │   ├── HeroSection.jsx
    │   ├── Navbar.jsx
    │   ├── SectionDivider.jsx
    │   ├── ServicesCarousel.jsx
    │   └── TestimonialsCarousel.jsx
    └── pages/
        ├── AboutPage.jsx
        ├── BookingPage.jsx
        ├── ContactPage.jsx
        ├── HomePage.jsx
        ├── ServicesPage.jsx
        └── TestimonialsPage.jsx
```

## Deployment
A sample `vercel.json` configuration is provided for deploying to [Vercel](https://vercel.com/). The service worker enables offline caching of the main page, while the web manifest allows installation as a PWA.

## Customisation
Adjust colours and shadows in `tailwind.config.js` as needed. All site content can be edited in the React components under `src/components` and `src/pages`.

## Running Tests
```bash
npm test
```
This runs Jest unit tests for the React components.

## License
This project is licensed under the [MIT License](./LICENSE).
