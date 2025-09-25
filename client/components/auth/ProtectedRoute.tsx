import { PropsWithChildren, useMemo, useState } from "react";

export default function ProtectedRoute({ requiredRole, children }: PropsWithChildren<{ requiredRole: "student" | "teacher" }>) {
  const [role, setRole] = useState<string | null>(() => localStorage.getItem("kv8-role"));
  const [error, setError] = useState<string | null>(null);

  const authorized = role === requiredRole;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = String(formData.get("key") || "").trim();
    if (requiredRole === "teacher" && key === "EDUCATOR8") {
      localStorage.setItem("kv8-role", "teacher");
      setRole("teacher");
      return;
    }
    if (requiredRole === "student" && key === "LEARNER8") {
      localStorage.setItem("kv8-role", "student");
      setRole("student");
      return;
    }
    setError("Invalid access key.");
  };

  if (authorized) return <>{children}</>;

  return (
    <div className="min-h-[50vh] grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-md bg-white border rounded-2xl shadow-sm p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900 text-center">Enter Access Key</h2>
          <p className="text-sm text-slate-600 text-center">Access to this section requires a valid key.</p>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Access Key</span>
          <input
            name="key"
            type="password"
            placeholder="Enter access key"
            className="h-11 rounded-md border px-3"
            onChange={() => setError(null)}
            autoComplete="off"
            required
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full h-11 rounded-md bg-slate-900 text-white font-medium hover:bg-slate-800">Continue</button>
      </form>
    </div>
  );
}
