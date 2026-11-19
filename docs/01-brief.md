# Salon Queue Management System

## 1. Problem Statement
On weekends, customers often wait 1–2 hours in salons with no visibility into when their turn will arrive. This uncertainty leads to customer walkouts, frustration, and disputes over arrival order. The salon requires a transparent, real-time queue management system to eliminate guesswork and streamline customer flow.

## 2. Target Users
- **Customer**: Joins the queue remotely using their phone, selects desired services and barber preference, and monitors their live turn progress.
- **Receptionist/Owner**: Oversees queue operations, registers walk-in customers, calls the next customer in line, marks no-shows, and manages overall salon capacity.
- **Barber**: Accesses an individual workstation view to see assigned customers and track service progress with start and completion actions.

## 3. Project Objectives
Deliver a functional, polished web application solving salon queue bottlenecks. The core objective is to provide an intuitive, responsive user experience backed by reliable real-time synchronization across customer phones, receptionist tablets, barber workstations, and public displays.

## 4. Core Features
- **Remote Customer Check-In**: Customers join the queue from their mobile browser by selecting one or more services and choosing either a specific barber or "Any barber".
- **Real-Time Turn Tracking & Alerts**: Customers track their live queue position and estimated waiting time on their personal status screen, receiving a prominent "You're next!" alert when their turn approaches.
- **Reception & Walk-in Handling**: Receptionists add walk-in clients, call the next customer in queue, and mark absent clients as no-show.
- **Barber Service Management**: Dedicated interface for each barber displaying their current customer, equipped with explicit Start and Done actions to progress states.
- **Waiting-Area TV Display**: Public status screen optimized for wall-mounted TVs, indicating which customer is currently with each barber and displaying the next 5 tokens in line.
- **Salon Administration**: Owners configure service catalog details (names, service durations, prices) and manage the roster of active barbers on duty.
- **Queue Control & Automatic Cutoff**: Owners can manually open or close the queue at any time; online queue entry automatically closes 30 minutes before salon closing time.
- **Bilingual Localization**: Seamless language toggle supporting both English and Gujarati across all interfaces via a centralized language file.

## 5. Application Screens
- **Home**: `/`
- **Join Queue**: `/join`
- **My Status**: `/status/:id`
- **Reception Dashboard**: `/reception`
- **Barber View**: `/barber/:name`
- **Waiting Area TV**: `/display`
- **Owner Settings**: `/admin`

## 6. Out of Scope
- Online payments
- Future-date appointments
- SMS or WhatsApp notifications
- Loyalty or reward programs
- Multiple salon branches

## 7. Design and Technology
- **Visual Direction**: Editorial, high-fashion monochrome aesthetic inspired by minimalist luxury barbershop design. High-contrast typography (sophisticated serif display headlines paired with clean modernist sans-serif body), generous whitespace, striking black-and-white photography, crisp architectural dividers, refined cards, and mobile-first responsive layouts.
- **Color Palette**:
  - Stark Black: `#0A0A0A` / `#000000`
  - Crisp Pure White: `#FFFFFF`
  - Subtle Neutral Grays: `#F5F5F5` / `#E5E5E5` (borders and surface tints) and `#171717` (elevated dark surfaces)
  - Secondary Text Gray: `#737373`
  - Accent / Interaction: High-contrast monochrome inversions (solid stark black buttons with pure white text and crisp borders) with subtle minimal status dots.
- **Language Support**: English and Gujarati driven by a single centralized language dictionary.
- **Frontend Stack**: React, Vite, Tailwind CSS.
- **Local Development**: Run locally using `npm run dev`.
- **Hosting Targets**: Vercel for frontend hosting; Render or Railway if backend services are required.
- **Storage & Synchronization**: Simplest practical storage solution selected by the coding agent to keep customer phones, receptionist tablets, and the waiting-area TV synchronized without requiring manual database schema creation or custom API architecture.
