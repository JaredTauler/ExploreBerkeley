var table = new Tabulator
(
    "#Table",
    {
        height: "311px",
        columns: [

            {field: "ticket.id", visible: false},
            {title: "Name", field: "quest.name"},
            {title: "Info", field: "quest.info"},
            // {title: "Name", field: "name"},
            // {title: "Task", field: "task"},
            // {title: "Info", field: "info"}
            // {title:"Rating", field:"rating"},
            // {title:"Favourite Color", field:"col"},
            // {title:"Date Of Birth", field:"dob", hozAlign:"center"},
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
                table.setData(response["user"]);
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
