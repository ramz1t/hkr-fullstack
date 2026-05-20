import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@repo/ui/card";
import { Dice6Icon, CoinsIcon, BadgeCheck, Wallet, Code } from "lucide-react";

const features = [
  {
    icon: Dice6Icon,
    title: "Provably Fair Games",
    description:
      "Every game outcome is verifiable — open-source algorithms ensure trust and transparency."
  },
  {
    icon: CoinsIcon,
    title: "Coinflip & Slots",
    description:
      "Double up on a coinflip or spin the reels on classic slots. Choose your game, place your bet."
  },
  {
    icon: BadgeCheck,
    title: "Verifiable Results",
    description:
      "Each bet includes a unique server seed, client seed, and nonce. Verify fairness anytime."
  },
  {
    icon: Wallet,
    title: "Instant Wallet",
    description:
      "Deposit and withdraw instantly. Your balance updates in real time as you play."
  }
];

const team = [
  {
    name: "Adam Pisula",
    role: "Developer",
    github: "https://github.com/adampisula"
  },
  {
    name: "Timur Ramazanov",
    role: "Developer",
    github: "https://github.com/ramz1t"
  },
  {
    name: "Simon Ostini",
    role: "Developer",
    github: "https://github.com/b3h3m0th"
  }
];

const technologies = [
  {
    name: "NestJS",
    url: "https://nestjs.com",
    color: "E0234E",
    logo: "nestjs"
  },
  {
    name: "React",
    url: "https://react.dev",
    color: "61DAFB",
    logo: "react"
  },
  {
    name: "TypeScript",
    url: "https://typescriptlang.org",
    color: "3178C6",
    logo: "typescript"
  },
  {
    name: "Prisma",
    url: "https://prisma.io",
    color: "2D3748",
    logo: "prisma"
  },
  {
    name: "PostgreSQL",
    url: "https://postgresql.org",
    color: "4169E1",
    logo: "postgresql"
  },
  {
    name: "Tailwind CSS",
    url: "https://tailwindcss.com",
    color: "06B6D4",
    logo: "tailwindcss"
  },
  {
    name: "shadcn/ui",
    url: "https://ui.shadcn.com",
    color: "000000",
    logo: "shadcnui"
  },
  {
    name: "Radix UI",
    url: "https://radix-ui.com",
    color: "161618",
    logo: "radixui"
  },
  {
    name: "TanStack Query",
    url: "https://tanstack.com/query",
    color: "FF4154",
    logo: "reactquery"
  }
];

const Home = () => {
  return (
    <>
      <Helmet>
        <title>CasinoApp — Provably Fair Gaming</title>
      </Helmet>
      <section className="relative border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto px-4 py-24 md:py-32 container flex flex-col items-center text-center gap-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-heading">
            Casino<span className="text-primary">App</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            An open-source, provably fair casino platform built with
            transparency at its core. Every shuffle, flip, and spin you can
            verify yourself.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <Button asChild size="lg">
              <Link to="/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/games">Browse Games</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="page-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold tracking-tight font-heading">
            What is CasinoApp?
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            CasinoApp is a full-stack web application developed as a university
            project. It demonstrates a modern casino platform featuring games
            built on a provably fair system. Every bet outcome is generated from
            a combination of server-side and client-side seeds, ensuring neither
            party can manipulate the result. The project showcases a monorepo
            architecture with a NestJS backend, React frontends, and shared
            packages for types, UI components, and game logic.
          </p>
        </div>
      </section>

      <section className="page-container">
        <h2 className="text-3xl font-extrabold tracking-tight font-heading text-center">
          Features
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="size-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="page-container">
        <h2 className="text-3xl font-extrabold tracking-tight font-heading text-center">
          Built With
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {technologies.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform hover:scale-105"
            >
              <img
                src={`https://img.shields.io/badge/${encodeURIComponent(tool.name)}-${tool.color}?style=for-the-badge&logo=${tool.logo}&logoColor=white`}
                alt={tool.name}
                className="h-8"
              />
            </a>
          ))}
        </div>
      </section>

      <section className="page-container border-t border-border">
        <h2 className="text-3xl font-extrabold tracking-tight font-heading text-center">
          Team
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {team.map((member) => (
            <a
              key={member.name}
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card
                size="sm"
                className="w-48 border-border/60 text-center transition-colors hover:border-primary/50 cursor-pointer"
              >
                <CardHeader>
                  <div className="mx-auto mb-2 size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold font-heading text-primary">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <CardTitle className="text-sm">{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
              </Card>
            </a>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto px-4 container flex items-center justify-between text-xs text-muted-foreground">
          <span>CasinoApp &copy; {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1.5">
            <Code className="size-3.5" /> University Project
          </span>
        </div>
      </footer>
    </>
  );
};

export default Home;
