
// Library import
let fs = require('fs')
let querystring = require("querystring")
let axios = require('axios')
let readlineSync = require("readline-sync")

// Obtain user input for video id and video name
let video_id = readlineSync.question("Please key in video id")
let video_name = readlineSync.question("Please key in video name")

// Defining url variable
let url = "https://youtube.com/get_video_info?video_id=" + video_id


// Make request to youtube server for video information
axios.get(url)
.then(
    (response) => {
        const data = response.data

        // Convert video information from String to Object
        let info = querystring.parse(data)
        
        // Retrieve video formats information and split to array of individual formats
        let videoFormatStrings = info.url_encoded_fmt_stream_map.split(',')

        // Select the video format with lowest quality (i.e, last in array), and convert to Object
        let format =  querystring.parse(videoFormatStrings[videoFormatStrings.length - 1]);

        // Obtain file type for video
        let file_type = /.+\/(.+);/.exec(format.type)[1] 

        // Open file in preparation to save video data
        fs.open(video_name + "."+ file_type,"w", (error, file_descriptor) => {

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
