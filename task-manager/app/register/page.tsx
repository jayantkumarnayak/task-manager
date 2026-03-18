import RegisterForm from "@/app/components/RegisterForm";

export const metadata = {
  title: "Register | Task Manager",
  description: "Create a Task Manager account",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        <RegisterForm />

        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            <strong>Getting Started:</strong> Register with your email and start managing tasks today!
          </p>
        </div>
      </div>
    </main>
  );
}
