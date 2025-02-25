import cloudinary from 'cloudinary'
import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'PRODUCTION') {
  dotenv.config({ path: 'config/config.env' })
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const upload_file = (file, folder) => {
  return new Promise((resolve, reject) => {
    // cloudinary.v2.uploader.upload  // buda kullanılabilir.
    cloudinary.uploader.upload(
      file,
      (result) => {
        resolve({
          public_id: result.public_id,
          url: result.url,
        })
      },
      {
        resource_type: 'auto',
        folder,
      }
    )
  })
}

export const delete_file = async (file) => {
  const res = await cloudinary.uploader.destroy(file)

  if (res?.result === 'ok') return true
}
