let CurrentTicketID = null

function Get_Ticket(decision)
{
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            if (this.status === 200)
            {
                ButtonToggle(false)
                response = JSON.parse(xhttp.response)
                CurrentTicketID = response["ticket"]["id"].toString()

                let elem = IDs_From_Elem(
                    [
                        "picture",
                        "username",
                        "datetime",
                        "questtask",
                        "questname",
                        "picturediv"
                    ],
                    document.getElementById("MainForm")
                )

                let pic = new Image()
                pic.src = response["picture-url"]
                removeAllChildNodes(elem["picture"])
                elem["picture"].appendChild(pic)


                elem["username"].textContent = response["user"]["username"]
                elem["questname"].textContent = response["quest"]["name"]
                elem["questtask"].textContent = response["quest"]["task"]
            } else if (this.status === 204)
            {
                ClearMainForm()
            }
        }
    };

    xhttp.open("POST", window.location.href, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(
        {
            "intent": "get-ticket",
            "decision": decision,
            "current_ticket": CurrentTicketID
        }
    ));

    return false
}

function ClearMainForm()
{
    CurrentTicketID = null
    let elem = IDs_From_Elem(
        [
            "picture",
            "username",
            "datetime",
            "questtask",
            "questname",
            "picturediv",
            "Buttons"
        ],
        document.getElementById("MainForm")
    )
    ButtonToggle(true)
    removeAllChildNodes(elem["picture"])
    // elem["OptionButton"].display = false
    elem["username"].textContent = ""
    elem["questname"].textContent = ""
    elem["questtask"].textContent = ""
}

function IDs_From_Elem(list, element)
{
    let elem = {}
    for (let i of list)
    {
        elem[i] = element.querySelector("[id='" + i + "']")
    }
    return elem
}

function removeAllChildNodes(parent)
{
    while (parent.firstChild)
    {
        parent.removeChild(parent.firstChild);
    }
}

function ButtonToggle(bool)
{
    let elem = IDs_From_Elem(
        [
            "Buttons"
        ],
        document.getElementById("MainForm")
    )
    console.log(elem)

    let buttons = IDs_From_Elem(
        [
            "GetTicket",
            "Choice"
        ],
        elem["Buttons"]
    )
    if (bool)
    {
        buttons["Choice"].style.display = "none"
        buttons["GetTicket"].style.display = "block"

    } else
    {
        buttons["Choice"].style.display = "block"
        buttons["GetTicket"].style.display = "none"
    }
}

Get_Ticket(null)
