import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const imagesDir = join(__dirname, '../public/services')

async function convertToWebP() {
  try {
    const files = await readdir(imagesDir)
    const pngFiles = files.filter(file => file.endsWith('.png'))

    if (pngFiles.length === 0) {
      console.log('Aucun fichier PNG trouvé dans public/services/')
      return
    }

    console.log(`Conversion de ${pngFiles.length} fichier(s) PNG en WebP...\n`)

    for (const file of pngFiles) {
      const inputPath = join(imagesDir, file)
      const outputPath = join(imagesDir, file.replace('.png', '.webp'))

      try {
        const stats = await sharp(inputPath).metadata()
        const originalSize = (await import('fs')).promises.stat(inputPath).then(s => s.size)

        await sharp(inputPath)
          .webp({ quality: 85, effort: 6 })
          .toFile(outputPath)

        const newSize = (await import('fs')).promises.stat(outputPath).then(s => s.size)
        const originalSizeBytes = await originalSize
        const newSizeBytes = await newSize
        const reduction = ((1 - newSizeBytes / originalSizeBytes) * 100).toFixed(1)

        console.log(`✅ ${file}`)
        console.log(`   ${(originalSizeBytes / 1024 / 1024).toFixed(2)} MB → ${(newSizeBytes / 1024 / 1024).toFixed(2)} MB (-${reduction}%)`)
        console.log(`   Dimensions: ${stats.width}x${stats.height}`)
        console.log()
      } catch (error) {
        console.error(`❌ Erreur lors de la conversion de ${file}:`, error.message)
      }
    }

    console.log('✨ Conversion terminée !')
    console.log('\n💡 N\'oubliez pas de :')
    console.log('   1. Mettre à jour vos composants pour utiliser les fichiers .webp')
    console.log('   2. Supprimer les anciens fichiers .png si vous le souhaitez')
  } catch (error) {
    console.error('Erreur:', error.message)
    process.exit(1)
  }
}

convertToWebP()
