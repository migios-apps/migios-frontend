import React, { useEffect } from "react"
import confetti from "canvas-confetti"

type SchoolPrideConfettiProps = {
  colors?: string[]
  onComplete?: () => void
}

/**
 * School Pride Confetti Effect
 * Creates a colorful confetti effect that fires from both left and right sides
 * Similar to school pride celebrations with vibrant colors
 */
export const SchoolPrideConfetti: React.FC<SchoolPrideConfettiProps> = ({
  colors = [
    "#3b82f6", // Blue
    "#10b981", // Green
    "#8b5cf6", // Purple
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#6366f1", // Indigo
    "#14b8a6", // Teal
    "#a855f7", // Violet
  ],
  onComplete,
}) => {
  useEffect(() => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      colors: colors,
    }

    const fire = (
      particleRatio: number,
      opts: {
        angle?: number
        spread?: number
        startVelocity?: number
        decay?: number
        scalar?: number
        origin?: { x?: number; y?: number }
      }
    ) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    // Fire from left side (angle 60)
    fire(0.25, {
      angle: 60,
      spread: 26,
      startVelocity: 55,
      origin: { x: 0, y: 0.7 },
    })
    fire(0.2, {
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
    })
    fire(0.35, {
      angle: 60,
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 0, y: 0.7 },
    })
    fire(0.1, {
      angle: 60,
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0, y: 0.7 },
    })
    fire(0.1, {
      angle: 60,
      spread: 120,
      startVelocity: 45,
      origin: { x: 0, y: 0.7 },
    })

    // Fire from right side (angle 120)
    fire(0.25, {
      angle: 120,
      spread: 26,
      startVelocity: 55,
      origin: { x: 1, y: 0.7 },
    })
    fire(0.2, {
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
    })
    fire(0.35, {
      angle: 120,
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 1, y: 0.7 },
    })
    fire(0.1, {
      angle: 120,
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 1, y: 0.7 },
    })
    fire(0.1, {
      angle: 120,
      spread: 120,
      startVelocity: 45,
      origin: { x: 1, y: 0.7 },
    })

    // Call onComplete after a short delay to allow confetti to start
    if (onComplete) {
      setTimeout(() => {
        onComplete()
      }, 100)
    }
  }, [colors, onComplete])

  return null
}

/**
 * Hook to trigger school pride confetti programmatically
 */
export const useSchoolPrideConfetti = () => {
  const trigger = React.useCallback(
    (options?: { colors?: string[]; onComplete?: () => void }) => {
      const colors = options?.colors || [
        "#3b82f6", // Blue
        "#10b981", // Green
        "#8b5cf6", // Purple
        "#f59e0b", // Amber
        "#ec4899", // Pink
        "#06b6d4", // Cyan
        "#84cc16", // Lime
        "#6366f1", // Indigo
        "#14b8a6", // Teal
        "#a855f7", // Violet
      ]
      const onComplete = options?.onComplete

      const count = 200
      const defaults = {
        origin: { y: 0.7 },
        colors: colors,
      }

      const fire = (
        particleRatio: number,
        opts: {
          angle?: number
          spread?: number
          startVelocity?: number
          decay?: number
          scalar?: number
          origin?: { x?: number; y?: number }
        }
      ) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        })
      }

      // Fire from left side (angle 60)
      fire(0.25, {
        angle: 60,
        spread: 26,
        startVelocity: 55,
        origin: { x: 0, y: 0.7 },
      })
      fire(0.2, {
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
      })
      fire(0.35, {
        angle: 60,
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        origin: { x: 0, y: 0.7 },
      })
      fire(0.1, {
        angle: 60,
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        origin: { x: 0, y: 0.7 },
      })
      fire(0.1, {
        angle: 60,
        spread: 120,
        startVelocity: 45,
        origin: { x: 0, y: 0.7 },
      })

      // Fire from right side (angle 120)
      fire(0.25, {
        angle: 120,
        spread: 26,
        startVelocity: 55,
        origin: { x: 1, y: 0.7 },
      })
      fire(0.2, {
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
      })
      fire(0.35, {
        angle: 120,
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        origin: { x: 1, y: 0.7 },
      })
      fire(0.1, {
        angle: 120,
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        origin: { x: 1, y: 0.7 },
      })
      fire(0.1, {
        angle: 120,
        spread: 120,
        startVelocity: 45,
        origin: { x: 1, y: 0.7 },
      })

      // Call onComplete after a short delay
      if (onComplete) {
        setTimeout(() => {
          onComplete()
        }, 100)
      }
    },
    []
  )

  return { trigger }
}

// Export default component for backward compatibility
export const Confetti = SchoolPrideConfetti
