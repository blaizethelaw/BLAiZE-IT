# BLAiZE IT Solutions

 codex/update-readme.md-introduction-and-instructions
BLAiZE IT Solutions delivers comprehensive managed IT services, cybersecurity
consulting, cloud migration expertise, and reliable home networking support. Our
focus is on keeping your technology running smoothly and securely so you can
concentrate on your business.

## Getting Started

Install dependencies and launch the development server:

```bash
npm install
npm run dev
```

To create an optimized production build, run:
=======
BLAiZE IT is a single-page application that showcases the services of **BLAiZE IT Solutions**, an IT consultancy offering support for both businesses and home users. The site is built with [React](https://react.dev/) and styled using [Tailwind CSS](https://tailwindcss.com/). Routing is handled with **React Router** and the interface includes animations via **Framer Motion** and carousels via **Swiper**.

## Features

- **Modern design** powered by Tailwind CSS with custom colours matching the BLAiZE IT brand
- **Responsive layout** that works on desktop and mobile
- **Service and testimonial carousels** implemented with Swiper and animated with Framer Motion
- **Booking** and **contact** forms connected to Formspree for easy enquiries
- **Progressive Web App** support using a service worker and `manifest.webmanifest`
- **React Router** navigation with dedicated pages for each section: Home, Services, About, Booking, Testimonials and Contact

## Getting Started

### Prerequisites

- Node.js (version 18 or newer is recommended)
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The site will be available at `http://localhost:5173` by default. Any file changes will trigger hot module reloading.

### Build for production
 main

```bash
npm run build
```

 codex/update-readme.md-introduction-and-instructions
=======
The compiled assets will be output to the `dist/` directory. You can preview the build with:

```bash
npm run preview
```

 main
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
 codex/create-detailed-readme-for-website
        ├── ContactPage.jsx
        ├── HomePage.jsx
        ├── ServicesPage.jsx
        └── TestimonialsPage.jsx
```

## Deployment

The project is ready to be deployed on any static hosting provider. A sample `vercel.json` configuration is included for deploying to [Vercel](https://vercel.com/). The service worker (`public/sw.js`) enables offline caching of the main page, while `manifest.webmanifest` allows installation on mobile devices as a PWA.

## Customisation

You can adjust the theme colours and drop shadows in **tailwind.config.js**. The logo images live in `public/` and are referenced in the pages and components. All site content can be modified through the React components located in `src/pages` and `src/components`.

---

© 2024 BLAiZE IT Solutions — IT Solutions for Business and Home
=======
        ├── TestimonialsPage.jsx
        └── ContactPage.jsx
 codex/update-readme.md-introduction-and-instructions
```
=======
 codex/add-license-file-and-update-readme
        new line

## License

This project is licensed under the [MIT License](./LICENSE).
=======

## Running Tests

Install dependencies and run:

```bash
npm test
```

This will execute Jest unit tests for React components.


 main
