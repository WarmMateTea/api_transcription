async function requestToSingleChatSummarizeEndpoint(rawText) {
    const buff = new Buffer.from(rawText, 'utf-8');
    const encodedText = buff.toString('base64');

    try {
        const myHeaders = new Headers();
        myHeaders.append("x-api-key", "132657ef-f954-4114-a0a7-1c5bec6d068d");
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "content": encodedText});

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

    fetch("http://localhost:4001/api/summarize", requestOptions)
    .then((response) => {
        return response.text();
    })
    .then((result) => {
        return console.log(result);
    })
    .catch((error) => {
        return console.error(error);
    });
    } catch (error) {
        console.error(error);
        throw(error);
    }
}

export { requestToSingleChatSummarizeEndpoint }