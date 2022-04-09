// Jared Tauler 3/30/2022
function FormDataPrint (v) {
    for (var pair of v.entries()) {
     console.log(pair[0]+ ': ' + pair[1]);
    }
}

function SubmitPicture(id) {
    let files = document.getElementById('ImageUpload').files
    let formdata = new FormData()
    formdata.append('ImageUpload', files[0])
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            response = JSON.parse(xhttp.response)
            if (this.status === 200)
            {
                // if (response[0] === "bad")
                // {
                // }
                if (response[0] === "pass")
                {
                    // if(window.location.hash)
                    // {
                    //     window.location.href = window.location.hash.substring(1)
                    // }
                    // else
                    // {
                        window.location.href = "home"
                    // }
                }
            }
            // else if (this.status === 500)
            // {
            //     PopupError(response)
            //     ShowPopup()
            // }
        }
    };

    xhttp.open("POST", window.location.href, true);
    xhttp.send(formdata);
    return false
}
