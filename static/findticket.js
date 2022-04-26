let popup = new Popup()
popup.modal.onclick = null // disable clicking out of popup

let Search = document.getElementById("Search")
// no method? make my own B)
Search.Listeners = {}
Search.SetListener = function (type, listener)
{
    // Remove current listener if it exists
    let current = Search.Listeners[type]
    if (current) Search.removeEventListener(type, current)

    Search.Listeners[type] = listener // Set new listener as current
    Search.addEventListener(type, listener)
}

let Table = null


function GetUser()
{
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            response = JSON.parse(xhttp.response)
            if (this.status === 200)
            {
                Table = new Tabulator
                (
                    "#Table",
                    {
                        layout: "fitColumns",
                        data: response["user"],
                        columns: [
                            {field: "id", visible: false},
                            {field: "username"}
                        ]
                    }
                );
                Table.off('rowClick')
                Table.on(
                    'rowClick',
                    (e, row) =>
                    {
                        GetUserTickets(row.getData().id)
                    }
                )

                Search.SetListener("input", function ()
                    {
                        Table.setFilter(
                            (r, p) => r.username.includes(p.username),
                            {username: Search.value}
                        )
                    }
                )
                popup.Show()
            }
        }
    };

    xhttp.open("POST", window.location.href, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(
        JSON.stringify(
            {
                "intent": "get_user"
            }
        )
    );
    return false
}

GetUser()

function GetUserTickets(id)
{
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            response = JSON.parse(xhttp.response)
            if (this.status === 200)
            {
                Table = new Tabulator
                (
                    "#Table",
                    {
                        layout: "fitColumns",
                        data: response["ticket"],
                        columns: [
                            {field: "ticket.id", visible: false},
                            {field: "quest.name"}
                        ]
                    }
                );
                Table.off("rowClick")
                Table.on(
                    'rowClick',
                    (e, row) =>
                    {
                        Get_Ticket(row.getData().ticket.id)
                    }
                )

                Search.SetListener("input", function ()
                    {
                        Table.setFilter(
                            (r, p) => r.quest.name.includes(p.name),
                            {name: Search.value}
                        )
                    }
                )

            }
        }
    }
    xhttp.open("POST", window.location.href, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(
        JSON.stringify(
            {
                "intent": "get_user_ticket",
                "id": id
            }
        )
    );
}

function Get_Ticket(id)
{
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            if (this.status === 200)
            {
                response = JSON.parse(xhttp.response)
                popup.Close()
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
            }
        }
    };

    xhttp.open("POST", window.location.href, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(
        {
            "intent": "get_ticket",
            "id": id
        }
    ));

    return false
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
