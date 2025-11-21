export function PageLoader() {
  return (
    <div className="bg-background flex h-screen w-full items-center justify-center">
      <div className="animate-in fade-in flex flex-col items-center gap-3 duration-300">
        <div className="relative h-12 w-12">
          <div className="border-primary/30 border-t-primary absolute inset-0 animate-spin rounded-full border-4" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-foreground text-base font-medium">
            Memuat aplikasi...
          </p>
          <p className="text-muted-foreground text-xs">Mohon tunggu sebentar</p>
        </div>
      </div>
    </div>
  )
}
