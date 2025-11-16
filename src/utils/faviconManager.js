// Utility to update favicon dynamically using emoji

export const updateFavicon = (emoji) => {
  try {
    // Remove existing favicon
    const existingFavicons = document.querySelectorAll("link[rel*='icon']")
    existingFavicons.forEach(favicon => favicon.remove())

    // Create canvas to convert emoji to favicon
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 64, 64)

    // Set font for emoji (use larger size for better quality)
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Draw emoji on canvas
    ctx.fillText(emoji, 32, 32)

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png')

    // Create new favicon link
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = dataUrl

    // Add to head
    document.head.appendChild(link)
  } catch (error) {
    console.warn('Failed to update favicon:', error)
  }
}

