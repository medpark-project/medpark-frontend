import Image from "next/image"

export function MedParkLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-12 h-12 flex items-center justify-center">
        <Image
          src="/images/medpark-logo-official.svg"
          alt="MedPark Logo"
          width={48}
          height={48}
          className="object-contain text-foreground"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-foreground">MedPark</span>
        
      </div>
    </div>
  )
}

export function MedParkLogoCompact({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 flex items-center justify-center">
        <Image
          src="/images/medpark-logo-official.svg"
          alt="MedPark Logo"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
      <span className="text-lg font-bold text-foreground">MedPark</span>
    </div>
  )
}
