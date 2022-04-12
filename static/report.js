var Table = new Tabulator
(
    "#Table",
    {
        layout: "fitColumns",
        columns: [

            {field: "user.username", visible: true, title: "User"},
            {field: "count", visible: true, title: "Completed Quest count"}
        ],
        initialSort: [
            {column: "count", dir: "desc"}
        ]
    }
);

function PopulateTable()
{
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (this.readyState === 4)
        {
            response = JSON.parse(xhttp.response)
            if (this.status === 200)
            {
                console.log(response)
                Table.setData(response);
            }
        }
    };

    xhttp.open("POST", window.location.href, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(
        JSON.stringify(
            {
                "intent": "get_info"
            }
        )
    );
    return false
}

PopulateTable()
