import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <div className="text-3xl font-semibold">Facility not found</div>
      <p className="text-sm text-muted">That facility isn&apos;t in the monitored portfolio.</p>
      <Link href="/" className="mt-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white">
        Back to portfolio
      </Link>
    </div>
  );
}
