import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';

// I don't must mix the server and client code otherwise I will have a lot of problems with navigation
export const uploadFile = async (file: File): Promise<string | null> => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const uploadOptions = { resource_type: 'auto' } satisfies UploadApiOptions;

    const bytes = new Uint8Array(await file.arrayBuffer());

    // upload through bytes
    const result: UploadApiResponse | undefined = await new Promise(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) return reject(error);
            return resolve(result);
          })
          .end(bytes);
      }
    );
    if (!result) throw new Error('Error uploading file');

    return result.secure_url;
  } catch (error) {
    return null;
  }
};
