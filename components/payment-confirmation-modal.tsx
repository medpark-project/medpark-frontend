"use client"

import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  onReturnHome?: () => void
}

export function PaymentConfirmationModal({ isOpen, onClose, message, onReturnHome }: PaymentConfirmationModalProps) {
  const handleClose = () => {
    onClose()
    if (onReturnHome) {
      onReturnHome()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="sm:max-w-md mx-auto bg-white rounded-lg shadow-xl border-0 p-0">
        <div className="flex flex-col items-center text-center p-8 space-y-6">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-900 font-inter">Payment Successful!</h2>

          {/* Message */}
          <p className="text-gray-600 text-base leading-relaxed max-w-sm font-inter">{message}</p>

          {/* Action Button */}
          <Button
            onClick={handleClose}
            className="w-full bg-[#A0E7E5] hover:bg-[#8DD8D6] text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Return to Homepage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Example usage with predefined messages
export const PaymentConfirmationMessages = {
  casualUser: (ticketId: string) =>
    `Your payment for ticket ${ticketId} has been processed. You have 15 minutes to exit the parking lot. Thank you!`,

  monthlyParker: (month: string) =>
    `Your payment for the ${month} monthly bill has been processed. Thank you for staying with us!`,

  custom: (message: string) => message,
}
