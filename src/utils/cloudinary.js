import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";


cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
        });

// cloudinary.v2.uploader.upload(
//     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//         public_id: 'shoes',
//     },
//     function(error,result){console.log(result);}
// )

const uploadOnCloudinary= async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }
        //upload the file on cloudnary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
            // media_metadata: true
        })
        

        console.log("===========================================================");
        
        console.log(response);

        console.log("---------------------------------------------------------");

        
        //file has been uploaded Successfully.
        // console.log("File is Uploaded Successfully on Cloudinary.", response.url);
        fs.unlinkSync(localFilePath)
        
        return response;
    } 
    catch (error) {
        // .unlinkSync(localFilePath)
        fs.unlinkSync(localFilePath)
        //remove locally saved temporary Files as the uploaded operation Failed.
        return null; 
    }
}

export { uploadOnCloudinary };



// (async function() {

//     // Configuration
//     cloudinary.config({ 
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//         api_key: process.env.CLOUDINARY_API_KEY,
//         api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
//     });

    


// //--------------------------------------------------------------------------------
    
//     // Upload an image
//     const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);
    
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// })();

