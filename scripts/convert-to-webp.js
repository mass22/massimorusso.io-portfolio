import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Récupérer l'argument de ligne de commande (fichier ou répertoire)
const inputArg = process.argv[2]
const defaultDir = join(__dirname, '../public/services')
const targetPath = inputArg
  ? resolve(inputArg.startsWith('/') ? inputArg : join(__dirname, '..', inputArg))
  : defaultDir

async function convertToWebP() {
  try {
    const targetStat = await stat(targetPath)
    let pngFiles = []

    if (targetStat.isFile()) {
      // Si c'est un fichier spécifique
      if (!targetPath.endsWith('.png')) {
        console.error('❌ Le fichier doit être un fichier PNG (.png)')
        process.exit(1)
      }
      pngFiles = [targetPath]
    } else if (targetStat.isDirectory()) {
      // Si c'est un répertoire
      const files = await readdir(targetPath)
      pngFiles = files
        .filter(file => file.endsWith('.png'))
        .map(file => join(targetPath, file))
    }

    if (pngFiles.length === 0) {
      console.log(`Aucun fichier PNG trouvé dans ${targetPath}`)
      return
    }

    console.log(`Conversion de ${pngFiles.length} fichier(s) PNG en WebP...\n`)

    for (const inputPath of pngFiles) {
      const outputPath = inputPath.replace('.png', '.webp')

      try {
        const stats = await sharp(inputPath).metadata()
        const originalSize = await stat(inputPath).then(s => s.size)

        await sharp(inputPath)
          .webp({ effort: 6, quality: 85 })
          .toFile(outputPath)

        const newSizeBytes = await stat(outputPath).then(s => s.size)
        const reduction = ((1 - newSizeBytes / originalSize) * 100).toFixed(1)
        const fileName = inputPath.split('/').pop()

        console.log(`✅ ${fileName}`)
        console.log(`   ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(newSizeBytes / 1024 / 1024).toFixed(2)} MB (-${reduction}%)`)
        console.log(`   Dimensions: ${stats.width}x${stats.height}`)
        console.log()
      } catch (error) {
        const fileName = inputPath.split('/').pop()
        console.error(`❌ Erreur lors de la conversion de ${fileName}:`, error.message)
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
