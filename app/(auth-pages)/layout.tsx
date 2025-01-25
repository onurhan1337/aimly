import { EqualApproximately, Goal } from "lucide-react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md m-4 bg-white dark:bg-zinc-950 dark:border dark:border-zinc-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-white flex items-center justify-center gap-2">
            <Goal className="w-8 h-8" />
            Welcome
          </h1>
          <p className="mt-2 text-sm text-zinc-950 dark:text-gray-300">
            Manage your account
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
