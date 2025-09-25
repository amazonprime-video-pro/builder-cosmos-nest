import { DemoResponse } from "@shared/api";
import Layout from "@/components/shared/Layout";

export default function Index() {
  const navigateTo = (path: string) => {
    window.location.assign(path);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = String(formData.get("key") || "").trim();
    if (key === "LEARNER8") {
      localStorage.setItem("kv8-role", "student");
      navigateTo("/student");
      return;
    }
    if (key === "EDUCATOR8") {
      localStorage.setItem("kv8-role", "teacher");
      navigateTo("/teacher");
      return;
    }
    alert("Invalid key. Use LEARNER8 or EDUCATOR8.");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            KV ITBP Class 8 Homework & Classwork Portal
          </h1>
          <p className="text-slate-600">Secure role-based access for students and teachers</p>
        </div>
        <div className="mt-8 sm:mt-12 grid place-items-center">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md bg-white border rounded-2xl shadow-lg p-6 sm:p-8 space-y-5"
          >
            <div className="space-y-1">
              <label htmlFor="key" className="text-sm font-medium text-slate-700">
                Enter Login Key
              </label>
              <input
                id="key"
                name="key"
                type="password"
                placeholder="Enter access key"
                className="w-full h-12 rounded-lg border px-4 text-base outline-none focus:ring-2 focus:ring-slate-300"
                autoComplete="off"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full h-12 rounded-lg bg-slate-900 text-white text-base font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
