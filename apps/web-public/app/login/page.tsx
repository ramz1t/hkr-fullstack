import { LoginForm } from "./login-form";
import type { Metadata } from "next";

const HEADERS = [
  "It's your time to win.",
  "Fortune favors the bold.",
  "One spin away from everything.",
  "Your jackpot is waiting.",
  "The house never wins against you.",
  "Tonight, luck is on your side."
];

export const metadata: Metadata = {
  title: "Login | CasinoApp"
};

export default function LoginPage() {
  const header = HEADERS[Math.floor(Math.random() * HEADERS.length)];

  return (
    <div className="min-h-screen flex-col-reverse md:flex-row flex">
      <div className="flex flex-col justify-between md:w-1/2 bg-primary/10 border-r border-border p-12">
        <div className="max-md:hidden text-2xl font-extrabold tracking-tight font-heading">
          CasinoApp
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-2xl md:text-5xl font-extrabold leading-tight font-heading">
            {header}
          </p>
          <p className="text-muted-foreground text-lg">
            Join thousands of players. Play smart. Win big.
          </p>
        </div>
      </div>

      <div className="flex flex-col flex-1 items-center justify-center p-8 gap-8">
        <div className="md:hidden text-2xl font-extrabold font-heading">
          CasinoApp
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
