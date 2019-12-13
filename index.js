
// Library imports
// ----------------
// Used to retrieve information from youtube
let axios = require("axios")
// Used to format data
let querystring = require("querystring")
// Used to save video data to computer
let file_system = require("fs")


// Actual Code
// ----------------

// Step 1
// ------
// Defining url variable
let url = "https://youtube.com/get_video_info?video_id=<key_in_video_id>"


// Make request to youtube server for video information
axios.get(url)
.then(
    (response) => {
        const dataStr = response.data

        // Step 2
        // ------
        // Step 2.1
        // Convert video information from String to Object
        let dataObj = querystring.parse(dataStr)

        let vidFormatsStr = dataObj.url_encoded_fmt_stream_map

        // Step 2.2
        // Retrieve video formats information and split to array of individual formats
        let vidFormatsArr = vidFormatsStr.split(",")
        
        // Step 2.3
        // Select the video format with lowest quality (i.e, last in array)
        let vidFormatStr = vidFormatsArr[vidFormatsArr.length - 1]
        
        // Convert lowest quality format to Object
        let vidFormatObj =  querystring.parse(vidFormatStr);

        // Extract video url
        let vidUrl = vidFormatObj.url

        // Step 3 & 4
        // ----------
        // Obtain file type for video
        let fileType = vidFormatObj.type.split("/")[1].split(";")[0]

        // Open file in preparation to save video data
        file_system.open("video."+ fileType,"w", (error, file_descriptor) => {
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
