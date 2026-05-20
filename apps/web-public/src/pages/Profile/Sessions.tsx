import { Helmet } from "react-helmet-async";
import { useSessions, useTerminateSession } from "../../api/sessions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@repo/ui/card";
import { Button } from "@repo/ui/button";

function parseUA(ua: string): { browser: string; os: string } {
  let browser = "Unknown Browser";
  if (/Edg\//.test(ua)) {
    const m = ua.match(/Edg\/([\d]+)/);
    browser = `Edge ${m?.[1] ?? ""}`.trim();
  } else if (/OPR\//.test(ua)) {
    const m = ua.match(/OPR\/([\d]+)/);
    browser = `Opera ${m?.[1] ?? ""}`.trim();
  } else if (/Chrome\//.test(ua)) {
    const m = ua.match(/Chrome\/([\d]+)/);
    browser = `Chrome ${m?.[1] ?? ""}`.trim();
  } else if (/Firefox\//.test(ua)) {
    const m = ua.match(/Firefox\/([\d]+)/);
    browser = `Firefox ${m?.[1] ?? ""}`.trim();
  } else if (/Safari\//.test(ua)) {
    const m = ua.match(/Version\/([\d]+)/);
    browser = `Safari ${m?.[1] ?? ""}`.trim();
  }

  let os = "Unknown OS";
  if (/Windows NT/.test(ua)) {
    const ver = ua.match(/Windows NT ([\d.]+)/)?.[1];
    const names: Record<string, string> = {
      "10.0": "10 / 11",
      "6.3": "8.1",
      "6.2": "8",
      "6.1": "7"
    };
    os = `Windows ${names[ver ?? ""] ?? ver ?? ""}`.trim();
  } else if (/Android/.test(ua)) {
    const m = ua.match(/Android ([\d.]+)/);
    os = `Android ${m?.[1] ?? ""}`.trim();
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    const m = ua.match(/OS ([\d_]+)/);
    os = `iOS ${(m?.[1] ?? "").replace(/_/g, ".")}`;
  } else if (/Mac OS X/.test(ua)) {
    const m = ua.match(/Mac OS X ([\d_.]+)/);
    os = `macOS ${(m?.[1] ?? "").replace(/_/g, ".")}`;
  } else if (/Linux/.test(ua)) {
    os = "Linux";
  }

  return { browser, os };
}

const Sessions = () => {
  const { data, isLoading, error } = useSessions();
  const { mutate: terminate, isPending } = useTerminateSession();
  return (
    <section className="page-container">
      <Helmet>
        <title>Sessions | CasinoApp</title>
      </Helmet>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight font-heading">
          All Sessions
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your sessions across browsers and devices here
        </p>
      </div>
      <ul className="gap-5 grid md:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded bg-muted" />
          ))
        ) : error ? (
          <p className="text-destructive">
            {data?.error?.message ?? "Failed to get sessions"}
          </p>
        ) : (
          data &&
          data.data?.map((session) => (
            <li key={session.id}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {session.userAgent
                      ? parseUA(session.userAgent).browser
                      : "Unknown Browser"}
                    {" | "}
                    {session.userAgent
                      ? parseUA(session.userAgent).os
                      : "Unknown OS"}
                  </CardTitle>
                </CardHeader>
                {session.userAgent && (
                  <CardContent className="flex flex-col gap-1 text-xs text-muted-foreground grow">
                    {session.userAgent}
                  </CardContent>
                )}
                <CardFooter>
                  <Button
                    disabled={isPending}
                    variant="destructive"
                    onClick={() => void terminate(session.id)}
                  >
                    Terminate
                  </Button>
                </CardFooter>
              </Card>
            </li>
          ))
        )}
      </ul>
    </section>
  );
};

export default Sessions;
