import { MedParkLogoCompact } from "./medpark-logo"

export function BrandFooter() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <MedParkLogoCompact />

          <div className="flex flex-col items-center gap-2 text-center md:items-end md:text-right">
            <p className="text-sm text-muted-foreground">© 2025 MedPark Hospital Parking Management System</p>
            <p className="text-xs text-muted-foreground">
              Streamlining hospital parking operations with care and efficiency
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
