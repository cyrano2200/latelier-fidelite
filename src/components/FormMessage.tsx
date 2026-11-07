export function FormMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (error) return <div className="alert-error">{error}</div>;
  if (success) return <div className="alert-success">{success}</div>;
  return null;
}
