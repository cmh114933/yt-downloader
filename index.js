
// Library import
let fs = require('fs')
let querystring = require("querystring")
let axios = require('axios')
let readlineSync = require("readline-sync")
let progress = require("cli-progress")

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
                // Obtain total size of video data to download in bytes
                const fullSize = parseInt(response.headers['content-length'], 10)
                
                // Set initial downloaded amount to 0
                let downloaded = 0

                // Create the progress bar and show on terminal
                console.log("Downloading ...")
                const bar = new progress.Bar({}, progress.Presets.shades_classic)
                bar.start(fullSize,0)

                // Save video data to file everytime we receive sufficient chunk of data
                response.data.on("data", (data) => {

                    // Update downloaded to keep track of total bytes currently downloaded
                    downloaded += data.length

                    // Update the progress bar with new progress
                    bar.update(downloaded)

                    // Stop the bar once the video is fully downloaded
                    if(downloaded == fullSize){
                        bar.stop()
                    }
                    
                    fs.write(file_descriptor, data, () => {})
                })
            })
        })
    }
)  
