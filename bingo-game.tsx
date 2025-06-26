"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Play, Volume2, VolumeX } from "lucide-react"

export default function BingoGame() {
  const [drawnNumbers, setDrawnNumbers] = useState<Set<number>>(new Set())
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const LETTERS = ["B", "I", "N", "G", "O"]
  const COLUMN_RANGES = [
    [1, 15],   // B
    [16, 30],  // I
    [31, 45],  // N
    [46, 60],  // G
    [61, 75],  // O
  ]

  const totalNumbers = 75
  const availableNumbers = Array.from({ length: totalNumbers }, (_, i) => i + 1)
  const undrawnNumbers = availableNumbers.filter((num) => !drawnNumbers.has(num))

  function getLetterForNumber(number: number): string {
    if (number >= 1 && number <= 15) return "B"
    if (number >= 16 && number <= 30) return "I"
    if (number >= 31 && number <= 45) return "N"
    if (number >= 46 && number <= 60) return "G"
    if (number >= 61 && number <= 75) return "O"
    return ""
  }

  const speakNumber = useCallback((number: number) => {
    if (!soundEnabled) return
    const letter = getLetterForNumber(number)
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`O número sorteado é ${letter}, ${number}`)
      utterance.lang = "pt-BR"
      utterance.rate = 0.8
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }, [soundEnabled])

  const playSound = useCallback(() => {
    if (!soundEnabled) return
    try {
      const audio = new Audio("/sounds/bingo-pop.mp3")
      audio.volume = 0.5
      audio.play().catch(() => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      })
    } catch (error) {
      console.log("Audio not available")
    }
  }, [soundEnabled])

  const drawNumber = useCallback(() => {
    if (undrawnNumbers.length === 0 || isDrawing) return

    setIsDrawing(true)
    playSound()
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * undrawnNumbers.length)
      const newNumber = undrawnNumbers[randomIndex]

      setCurrentNumber(newNumber)
      setDrawnNumbers((prev) => new Set([...prev, newNumber]))

      setTimeout(() => speakNumber(newNumber), 300)

      setIsDrawing(false)
    }, 2000)
  }, [undrawnNumbers, isDrawing, playSound, speakNumber])

  const resetGame = useCallback(() => {
    setDrawnNumbers(new Set())
    setCurrentNumber(null)
    setIsDrawing(false)
  }, [])

  const getNumberStatus = (number: number) => {
    if (number === currentNumber) return "current"
    if (drawnNumbers.has(number)) return "drawn"
    return "undrawn"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-15">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">BINGO WEB</h1>
        </div>

        {/* Bingo Ball Display */}
        <div className="flex justify-center mb-8">
          <div
            className={`
              w-32 h-32 md:w-40 md:h-40 rounded-full
              bg-gradient-to-tr from-yellow-400 via-yellow-300 to-orange-500
              border-3 border-white
              shadow-lg shadow-yellow-600/80
              flex items-center justify-center
              relative
              transition-transform duration-500
              ${isDrawing ? "animate-bounce scale-110" : ""}
            `}
          >
            <div
              className="
                w-25 h-25 md:w-28 md:h-28
                bg-white rounded-full
                flex items-center justify-center
                border-[2px] border-yellow-500
              "
            >
              <span className="text-5xl md:text-7xl font-extrabold text-gray-900 select-none">
                {isDrawing ? "?" : currentNumber || "?"}
              </span>
            </div>
            <div
              className="absolute top-4 left-6 w-10 h-6 rounded-full bg-white opacity-60 pointer-events-none"
              style={{ filter: "blur(8px)" }}
            ></div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={drawNumber}
            disabled={undrawnNumbers.length === 0 || isDrawing}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 text-lg shadow-lg transform transition-all hover:scale-105"
          >
            <Play className="w-5 h-5 mr-2" />
            {isDrawing ? "Sorteando..." : "Sortear Número"}
          </Button>

          <Button
            onClick={resetGame}
            variant="outline"
            size="lg"
            className="bg-white/20 border-white text-white hover:bg-white/30 font-bold py-4 px-8 text-lg shadow-lg backdrop-blur-sm"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reiniciar Jogo
          </Button>

          <Button
            onClick={() => setSoundEnabled((prev) => !prev)}
            variant="outline"
            size="lg"
            className={`font-bold py-4 px-8 text-lg shadow-lg backdrop-blur-sm ${
              soundEnabled
                ? "bg-yellow-400 text-black hover:bg-yellow-500"
                : "bg-white/20 text-white border-white hover:bg-white/30"
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-5 h-5 mr-2" />
              </>
            ) : (
              <>
                <VolumeX className="w-5 h-5 mr-2" />
                
              </>
            )}
          </Button>
        </div>

        <div className="text-center mb-8">
          <p className="text-white/90 text-lg">
            Números sorteados: {drawnNumbers.size} de {totalNumbers}
          </p>
        </div>

        {/* Numbers Grid */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-5xl mx-auto text-white font-bold select-none">
          {LETTERS.map((letter, colIdx) => {
            const [start, end] = COLUMN_RANGES[colIdx]
            const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i)

            return (
              <div
              key={letter}
              className="flex items-center mb-3 pb-3 border-b border-white/20"
            >
                <div className="w-12 text-center text-3xl font-extrabold mr-6 select-none">{letter}</div>
                <div className="flex gap-3 flex-wrap flex-1">
                  {numbers.map((number) => {
                    const status = getNumberStatus(number)
                    return (
                      <div
  key={number}
  className={`
    aspect-square rounded-lg flex items-center justify-center
    font-bold transition-all duration-300
    w-8 h-8 text-xs
    sm:w-10 sm:h-10 sm:text-sm
    md:w-12 md:h-12 md:text-base
    ${
      status === "current"
        ? "bg-yellow-400 text-gray-800 animate-pulse scale-110 shadow-lg ring-4 ring-yellow-300"
        : status === "drawn"
        ? "bg-green-500 text-white shadow-md"
        : "bg-white/20 text-white/60 hover:bg-white/30"
    }
  `}
>
  {number}
</div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {undrawnNumbers.length === 0 && (
          <div className="text-center mt-8">
            <div className="bg-yellow-400 text-gray-800 rounded-2xl p-6 shadow-2xl inline-block">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">🎉 PARABÉNS!</h2>
              <p className="text-lg">Todos os números foram sorteados!</p>
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-white/80 text-sm">
          <p>Clique em "Sortear Número" para sortear um novo número</p>
          <p>Os números sorteados aparecerão em verde na grade</p>
        </div>
      </div>
    </div>
  )
}
