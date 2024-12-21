// Navigation Buttons 
const btnGoToHome = document.querySelector('#btnGoToHome');
const btnGoToRestore = document.querySelector('#btnGoToRestore');

btnGoToHome.addEventListener('click', () => {
    window.location.href = "http://127.0.0.1:5500/html/home.html";
});

btnGoToRestore.addEventListener('click', () => {
    window.location.href = "http://127.0.0.1:5500/html/restore.html";
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
        imgUploader.value = "";

    }
});

// Load File Button 
const fileUploader = document.querySelector("#fileUploader");
const fileViewer = document.querySelector("#fileViewer");

fileUploader.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file && file.type === "text/plain") {
        const reader = new FileReader();

        reader.onload = (e) => {
            fileViewer.value = e.target.result;
        };

        reader.readAsText(file);
    } else {
        alert("Please upload a valid text file.");

    }
});

// Clear File Button 
const btnClearFile = document.querySelector("#btnClearFile");

btnClearFile.addEventListener("click", () => {
    if (confirm("This action cannot be undone!")) {
        fileViewer.value = "";
        fileUploader.value = "";

    }
});

// Save Image Button
const btnSaveResultedImage = document.querySelector("#btnSaveResultedImage");
const resultedImage = document.querySelector("#resultedImage");

btnSaveResultedImage.addEventListener("click", () => {
    if (resultedImage.src != 'http://127.0.0.1:5500/assets/imgs/no_image.png') {
        const link = document.createElement("a");
        link.href = resultedImage.src;
        link.download = "resulted_image_after_hiding_text.bmp";
        link.click();

    } else {
        alert("No image available to save. Please load and process an image first.");

    }
});

// Hide Button
const btnHide = document.querySelector("#btnHide");
const txtLSBs = document.querySelector("#txtLSBs");

btnHide.addEventListener("click", () => {
    // Check if all the input fields (Image, Secret text and the number of LSBs) are available or not. 
    if (imgViewer.src === "http://127.0.0.1:5500/assets/imgs/no_image.png") {
        alert("Please, upload an image to be used!");
        return;
    }

    if (fileViewer.value === "") {
        alert("Please, enter a secret message to be hidden in the image!");
        return;
    }

    const numberOfLSBs = Number(txtLSBs.value);
    if (numberOfLSBs < 1 || numberOfLSBs > 3) {
        alert("Please, enter a valid number of LSBs between 1 and 3!");
        return;
    }

    const secretMessage = fileViewer.value;

    // Convert the secret text into array of bit. 
    const messageBits = [];
    for (let i = 0; i < secretMessage.length; i++) {
        const charCode = secretMessage.charCodeAt(i);
        for (let j = 7; j >= 0; j--) {
            messageBits.push((charCode >> j) & 1);
        }
    }

    // Add NULL character (0b00000000) at the end of the secret’s array of bits to indicate the end of it. 
    for (let i = 0; i < 8; i++) {
        messageBits.push(0);
    }

    // Convert the image into a buffer (array of bytes)
    fetch(imgViewer.src)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            const imageData = new Uint8Array(buffer);
            // Determining where the actual bytes of the image starts from (Leave the header's 54 bytes)
            const imagePixelsStartsFrom = 
                imageData[10]              // First Byte
                + (imageData[11] << 8)     // Second Byte
                + (imageData[12] << 16)    // Third Byte
                + (imageData[13] << 24);   // Fourth Byte 

            // Hiding Process
            let messageBitIndex = 0;

            // A) Store the secret text’s bits in the image LSBs using the bitwise OR after clearing them using the bitwise AND.  
            // I implemented three different cases to support using 1, 2 or 3 LSBs in the hiding and restoring. 
            for (let i = imagePixelsStartsFrom; i < imageData.length && messageBitIndex < messageBits.length; i++) {
                if (numberOfLSBs === 1) {
                    imageData[i] &= 0b11111110;
                    imageData[i] |= messageBits[messageBitIndex++];
            
                } else if (numberOfLSBs === 2) {
                    imageData[i] &= 0b11111100;
                    imageData[i] |= (messageBits[messageBitIndex++] << 1) | (messageBits[messageBitIndex++]);
            
                } else if (numberOfLSBs === 3) {
                    imageData[i] &= 0b11111000;
                    imageData[i] |= (messageBits[messageBitIndex++] << 2) | (messageBits[messageBitIndex++] << 1) | (messageBits[messageBitIndex++]);
                }
            }

            // B) Create a BLOB (Binary Large Object) and generate a URL for it
            const blob = new Blob([imageData], { type: "image/bmp" });
            const newImageUrl = URL.createObjectURL(blob);

            // Memory cleanup optimization
            if (resultedImage.src) {
                URL.revokeObjectURL(resultedImage.src);
            }

            // Display the image
            resultedImage.src = newImageUrl;
        })
        .catch(error => console.error("Error loading the image:", error));
});