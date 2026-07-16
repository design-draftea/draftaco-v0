#!/usr/bin/env swift

import CoreImage
import Foundation
import ImageIO
import Vision

enum PlayerBackgroundError: LocalizedError {
  case invalidArguments
  case unreadableImage(String)
  case missingForeground(String)
  case missingColorSpace

  var errorDescription: String? {
    switch self {
    case .invalidArguments:
      return "Uso: swift scripts/remove-player-background.swift <entrada> <saida.png>"
    case .unreadableImage(let path):
      return "Nao foi possivel abrir a imagem: \(path)"
    case .missingForeground(let path):
      return "Nenhum primeiro plano foi detectado na imagem: \(path)"
    case .missingColorSpace:
      return "Nao foi possivel criar o espaco de cor sRGB"
    }
  }
}

func run() throws {
  guard CommandLine.arguments.count == 3 else {
    throw PlayerBackgroundError.invalidArguments
  }

  let inputPath = CommandLine.arguments[1]
  let outputPath = CommandLine.arguments[2]
  let inputURL = URL(fileURLWithPath: inputPath)
  let outputURL = URL(fileURLWithPath: outputPath)

  guard
    let source = CGImageSourceCreateWithURL(inputURL as CFURL, nil),
    let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
  else {
    throw PlayerBackgroundError.unreadableImage(inputPath)
  }

  let request = VNGenerateForegroundInstanceMaskRequest()
  let handler = VNImageRequestHandler(cgImage: image)
  try handler.perform([request])

  guard let observation = request.results?.first, !observation.allInstances.isEmpty else {
    throw PlayerBackgroundError.missingForeground(inputPath)
  }

  let maskBuffer = try observation.generateScaledMaskForImage(
    forInstances: observation.allInstances,
    from: handler
  )
  let inputImage = CIImage(cgImage: image)
  let maskImage = CIImage(cvPixelBuffer: maskBuffer).cropped(to: inputImage.extent)
  let transparentBackground = CIImage(color: .clear).cropped(to: inputImage.extent)
  let outputImage = inputImage.applyingFilter(
    "CIBlendWithMask",
    parameters: [
      kCIInputBackgroundImageKey: transparentBackground,
      kCIInputMaskImageKey: maskImage,
    ]
  )

  guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) else {
    throw PlayerBackgroundError.missingColorSpace
  }

  try FileManager.default.createDirectory(
    at: outputURL.deletingLastPathComponent(),
    withIntermediateDirectories: true
  )
  try CIContext().writePNGRepresentation(
    of: outputImage,
    to: outputURL,
    format: .RGBA8,
    colorSpace: colorSpace
  )
}

do {
  try run()
} catch {
  fputs("\(error.localizedDescription)\n", stderr)
  exit(1)
}
