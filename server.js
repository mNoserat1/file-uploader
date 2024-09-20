
const net = require("net");
const fs = require("fs/promises")
const { log } = require("console");
const port = 8090;
const server = net.createServer(() => { });
server.on("connection", (socket) => {
    log("new connection");
    let fileHandle;
    let fileStream;

    socket.on("data", async (chunck) => {
        // the client will send a file name before 10 -
        //split the file to get the file name
        let indexOfDivider = chunck.indexOf("-------");
        const fileName = chunck.subarray(10, indexOfDivider);
        if (!fileHandle) {
            socket.pause()
            fileHandle = await fs.open(`storage/${fileName}`, "w");
            fileStream = fileHandle.createWriteStream();
            fileStream.write(chunck.subarray(indexOfDivider + 7))
            // fileStream.write(chunck)
            socket.resume();



            fileStream.on("drain", () => {
                socket.resume();

            })

        }
        else {
            if (!fileStream.write(chunck)) {
                socket.pause();
            }
        }


    })
    socket.on("end", () => {
        fileHandle.close();
        fileHandle = undefined;
        fileStream = undefined;

        log("connection end")
    })
})
server.listen(port, () => {
    log(`server is up and running on`, server.address())
})