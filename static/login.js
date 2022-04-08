function SendData (id)
{
    let formdata = new FormData(document.getElementById(id))
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            response = JSON.parse(xhttp.response)
            if (this.status === 200)
            {
                if (response[0] === "bad")
                {
                    // PopupText("Wrong " + response[1] + ".")
                    // ShowPopup()
                }
                if (response[0] === "pass")
                {
                    if(window.location.hash)
                    {
                        window.location.href = window.location.hash.substring(1)
                    }
                    else
                    {
                        window.location.href = "home"
                    }
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
