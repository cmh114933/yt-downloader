
// Library import
let fs = require('fs')
let querystring = require("querystring")
let axios = require('axios')

// Defining url variable
let url = "https://youtube.com/get_video_info?video_id=<key_in_video_id>"


// Make request to youtube server for video information
axios.get(url)
.then(
    (response) => {
        const data = response.data

        // Convert video information from String to Object
        let info = querystring.parse(data)
        
        // Retrieve video formats information and split to array of individual formats
        let videoFormatStrings = info.url_encoded_fmt_stream_map.split(',')

        // Select the video format with lowest quality (i.e, last in array)
        let lowestQualityFormatString = videoFormatStrings[videoFormatStrings.length - 1]

        // Convert lowest quality format to Object
        let format =  querystring.parse(lowestQualityFormatString);

        // Obtain file type for video
        let file_type = format.type.split("/")[1].split(";")[0]

        // Open file in preparation to save video data
        fs.open("video."+ file_type,"w", (error, file_descriptor) => {

            // Make request to youtube server to get actual video data in chunks
            axios({
                method: 'get',
                url: format.url,
                responseType: 'stream'
            })
            .then(function (response) {
                // Save video data to file everytime we receive sufficient chunk of data
                response.data.on("data", (data) => {
                    fs.write(file_descriptor, data, () => {})
                })
            })
        })
    }
)  
