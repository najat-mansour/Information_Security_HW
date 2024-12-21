// Navigation Buttons 
const btnGoToHome = document.querySelector('#btnGoToHome');
const btnGoToHide = document.querySelector('#btnGoToHide');

btnGoToHome.addEventListener('click', () => {
    window.location.href = "http://127.0.0.1:5500/html/home.html";
});

btnGoToHide.addEventListener('click', () => {
    window.location.href = "http://127.0.0.1:5500/html/hide.html";
});

// Load Image Button 
const imgUploader = document.querySelector("#imgUploader");
const imgViewer = document.querySelector("#imgViewer");

imgUploader.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onload = (e) => {
            imgViewer.src = e.target.result;
        };

        reader.readAsDataURL(file);

    } else {
        alert("Please upload a valid image file.");

    }
});

// Clear Image Button
const btnClearImage = document.querySelector("#btnClearImage");

btnClearImage.addEventListener('click', () => {
    if (confirm("This action cannot be undone!")) {
        imgViewer.src = '../assets/imgs/no_image.png';

    }
});

// Restore Button
const btnRestore = document.querySelector("#btnRestore");
const txtLSBs = document.querySelector("#txtLSBs");

btnRestore.addEventListener("click", () => {
    // Check if all the input fields (Image and the number of LSBs) are available or not. 
    if (imgViewer.src === "http://127.0.0.1:5500/assets/imgs/no_image.png") {
        alert("Please, upload an image to be used!");
        return;
    }

    if (txtLSBs.value === "") {
        alert("Please, fill the number of used LSBs!");
        return;
    }

    const numberOfLSBs = Number(txtLSBs.value);
    if (numberOfLSBs < 1 || numberOfLSBs > 3) {
        alert("Please, enter a valid number of LSBs between 1 and 3!");
        return;
    }

    // Convert the image into a buffer (array of bytes)
    fetch(imgViewer.src)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const imageData = new Uint8Array(buffer);
            // Determining where the actual bytes of the image starts from (Leave the header which is 54-bytes)
            const imagePixelsStartsFrom =
                imageData[10]              // First Byte
                + (imageData[11] << 8)     // Second Byte
                + (imageData[12] << 16)    // Third Byte
                + (imageData[13] << 24);   // Fourth Byte 

            let messageBits = [];
            let resultText = "";

            // Restoring Process
            for (let i = imagePixelsStartsFrom; i < imageData.length; i++) {
                // A) Getting the bits stored in the LSBs of the image using the bitwise AND as well as shifting
                for (let j = numberOfLSBs - 1; j >= 0; j--) {
                    messageBits.push((imageData[i] >> j) & 1);
                }
            
                // B) Convert the bits into bytes (8-bits) and generate ASCII characters from them. 
                if (messageBits.length >= 8) {
                    let charCode = 0;
                    for (let b = 0; b < 8; b++) {
                        charCode = (charCode << 1) | messageBits[b];
                    }
            
                    // Check for NULL char ==> It terminates the secret message
                    if (charCode === 0) break;
            
                    resultText += String.fromCharCode(charCode);
                    messageBits = messageBits.slice(8);
                }
            }
            
            // Show the secret message on the text area 
            document.querySelector("textarea").value = resultText;
        })
        .catch(error => console.error("Error loading the image:", error));
});