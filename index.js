// Library imports
// ----------------
let axios = require("axios")
let querystring = require("querystring")
let file_system = require("fs")
let readlineSync = require("readline-sync")

// Actual Code
// ----------------

// Obtain user input for video id and video name
let video_id = readlineSync.question("Please key in video id")
let video_name = readlineSync.question("Please key in video name")

// Defining url variable
let url = "https://youtube.com/get_video_info?video_id=" + video_id


// Make request to youtube server for video information
axios.get(url)
.then(
    (response) => {
        const dataStr = response.data

        // Convert video information from String to Object
        let dataObj = querystring.parse(dataStr)

        let vidFormatsStr = dataObj.url_encoded_fmt_stream_map

        // Retrieve video formats information and split to array of individual formats
        let vidFormatsArr = vidFormatsStr.split(",")
        
        // Select the video format with lowest quality (i.e, last in array)
        let vidFormatStr = vidFormatsArr[vidFormatsArr.length - 1]
        
        // Convert lowest quality format to Object
        let vidFormatObj =  querystring.parse(vidFormatStr);

        // Extract video url
        let vidUrl = vidFormatObj.url

        // Obtain file type for video
        let fileType = vidFormatObj.type.split("/")[1].split(";")[0]

        // Open file in preparation to save video data
        file_system.open(video_name + "."+ fileType,"w", (error, file_descriptor) => {
            // Make request to youtube server to get actual video data in chunks
            axios({
                method: "get",
                url: vidUrl,
                responseType: "stream"
            })
            .then(function (response) {
                // Save video data to file everytime we receive sufficient chunk of data
                response.data.on("data", (data) => {
                    file_system.write(file_descriptor, data, () => {})
                })
            })
        })
    }
)  
