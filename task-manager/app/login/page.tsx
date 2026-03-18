import LoginForm from "@/app/components/LoginForm";

export const metadata = {
  title: "Login | Task Manager",
  description: "Login to your Task Manager account",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <LoginForm />

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Demo Account:</strong> You can create a new account to test the application.
          </p>
        </div>
      </div>
    </main>
  );
}
