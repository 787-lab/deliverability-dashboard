import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="app-card mx-auto mt-12 max-w-md p-8 text-sm text-muted">Loading…</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
